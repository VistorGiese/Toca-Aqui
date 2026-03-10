import { Request, Response } from 'express';
import { Op } from 'sequelize';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import AddressModel from '../models/AddressModel';
import UserModel from '../models/UserModel';
import redisService from '../config/redis';
import { uploadService } from '../services/UploadService';

const CACHE_TTL = 3000; 

export const listEstablishments = async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const { nome, tipo, cidade, genero } = req.query as Record<string, string>;

    const where: any = { esta_ativo: true };
    if (nome)   where.nome_estabelecimento = { [Op.like]: `%${nome}%` };
    if (tipo)   where.tipo_estabelecimento = tipo;
    if (genero) where.generos_musicais     = { [Op.like]: `%${genero}%` };

    const addressWhere: any = {};
    if (cidade) addressWhere.cidade = { [Op.like]: `%${cidade}%` };

    const sortedParams = Object.entries(req.query)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(':');
    const cacheKey = `estabelecimentos:list:${sortedParams || 'all'}`;

    const cachedData = await redisService.get<any>(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.json(cachedData);
    }
    console.log(`[CACHE MISS] ${cacheKey}`);

    const { count, rows } = await EstablishmentProfileModel.findAndCountAll({
      where,
      include: [
        {
          model: AddressModel,
          as: 'Address',
          where: Object.keys(addressWhere).length ? addressWhere : undefined,
          required: !!cidade,
        },
        { model: UserModel, as: 'User', attributes: ['id', 'nome', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const response = {
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };

    await redisService.set(cacheKey, response, CACHE_TTL);
    res.json(response);
  } catch (error) {
    console.error('Erro ao listar estabelecimentos:', error);
    res.status(500).json({ error: 'Erro ao listar estabelecimentos' });
  }
};

export const getEstablishment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `estabelecimento:${id}`;

    const cachedData = await redisService.get<any>(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.json(cachedData);
    }
    console.log(`[CACHE MISS] ${cacheKey}`);

    const establishment = await EstablishmentProfileModel.findByPk(id as string, {
      include: [
        {
          model: AddressModel,
          as: 'Address',
        },
        {
          model: UserModel,
          as: 'User',
          attributes: ['id', 'nome', 'email'],
        },
      ],
    });

    if (!establishment) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    const response = {
      success: true,
      data: establishment,
    };

    // Salvar no cache
    await redisService.set(cacheKey, response, CACHE_TTL);

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar estabelecimento:', error);
    res.status(500).json({ error: 'Erro ao buscar estabelecimento' });
  }
};

export const updateEstablishment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const establishment = await EstablishmentProfileModel.findByPk(id as string);

    if (!establishment) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    if (userRole !== 'admin' && establishment.usuario_id !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este estabelecimento' });
    }

    const {
      nome_estabelecimento,
      tipo_estabelecimento,
      descricao,
      generos_musicais,
      horario_abertura,
      horario_fechamento,
      endereco_id,
      telefone_contato,
      fotos,
      esta_ativo,
    } = req.body;

    if (endereco_id && endereco_id !== establishment.endereco_id) {
      const existingEstablishment = await EstablishmentProfileModel.findOne({
        where: {
          endereco_id: endereco_id,
          esta_ativo: true,
          id: { [Op.ne]: Number(id) },
        },
      });

      if (existingEstablishment) {
        return res.status(400).json({ 
          error: 'Este endereço já está sendo utilizado por outro estabelecimento ativo',
          estabelecimento_existente: {
            id: existingEstablishment.id,
            nome: existingEstablishment.nome_estabelecimento,
          },
        });
      }
    }

    await establishment.update({
      nome_estabelecimento: nome_estabelecimento || establishment.nome_estabelecimento,
      tipo_estabelecimento: tipo_estabelecimento || establishment.tipo_estabelecimento,
      descricao: descricao || establishment.descricao,
      generos_musicais: generos_musicais || establishment.generos_musicais,
      horario_abertura: horario_abertura || establishment.horario_abertura,
      horario_fechamento: horario_fechamento || establishment.horario_fechamento,
      endereco_id: endereco_id || establishment.endereco_id,
      telefone_contato: telefone_contato || establishment.telefone_contato,
      fotos: fotos !== undefined ? fotos : establishment.fotos,
      esta_ativo: esta_ativo !== undefined ? esta_ativo : establishment.esta_ativo,
    });

    // Invalidar cache
    await redisService.invalidate(`estabelecimento:${id}`);
    await redisService.invalidatePattern('estabelecimentos:*');

    res.json({
      success: true,
      message: 'Estabelecimento atualizado com sucesso',
      data: establishment,
    });
  } catch (error) {
    console.error('Erro ao atualizar estabelecimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar estabelecimento' });
  }
};

export const deleteEstablishment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const establishment = await EstablishmentProfileModel.findByPk(id as string);

    if (!establishment) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    if (userRole !== 'admin' && establishment.usuario_id !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este estabelecimento' });
    }

    await establishment.update({ esta_ativo: false });

    // Invalidar cache
    await redisService.invalidate(`estabelecimento:${id}`);
    await redisService.invalidatePattern('estabelecimentos:*');

    res.json({
      success: true,
      message: 'Estabelecimento desativado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir estabelecimento:', error);
    res.status(500).json({ error: 'Erro ao excluir estabelecimento' });
  }
};

export const uploadEstablishmentPhotos = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const novasFotos = files.map((f) => uploadService.getRelativePath(f));

    const establishment = await EstablishmentProfileModel.findByPk(id as string);
    if (!establishment) {
      novasFotos.forEach((p) => uploadService.deleteFile(p));
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    if (userRole !== 'admin' && establishment.usuario_id !== userId) {
      novasFotos.forEach((p) => uploadService.deleteFile(p));
      return res.status(403).json({ error: 'Você não tem permissão para editar este estabelecimento' });
    }

    const fotosAtuais: string[] = Array.isArray(establishment.fotos)
      ? (establishment.fotos as unknown as string[])
      : establishment.fotos
        ? JSON.parse(establishment.fotos as unknown as string)
        : [];

    const fotosAtualizadas = [...fotosAtuais, ...novasFotos];

    await establishment.update({ fotos: JSON.stringify(fotosAtualizadas) });

    await redisService.invalidate(`estabelecimento:${id}`);
    await redisService.invalidatePattern('estabelecimentos:*');

    res.json({
      message: 'Fotos adicionadas com sucesso',
      fotos: fotosAtualizadas,
    });
  } catch (error) {
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach((f) =>
        uploadService.deleteFile(uploadService.getRelativePath(f))
      );
    }
    console.error('Erro ao fazer upload de fotos:', error);
    res.status(500).json({ error: 'Erro ao fazer upload de fotos' });
  }
};

export const removeEstablishmentPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { filename } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!filename) {
      return res.status(400).json({ error: 'filename é obrigatório' });
    }

    const establishment = await EstablishmentProfileModel.findByPk(id as string);
    if (!establishment) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    if (userRole !== 'admin' && establishment.usuario_id !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este estabelecimento' });
    }

    const fotosAtuais: string[] = Array.isArray(establishment.fotos)
      ? (establishment.fotos as unknown as string[])
      : establishment.fotos
        ? JSON.parse(establishment.fotos as unknown as string)
        : [];

    const fotoParaRemover = fotosAtuais.find((f) => f.includes(filename));
    if (!fotoParaRemover) {
      return res.status(404).json({ error: 'Foto não encontrada no perfil do estabelecimento' });
    }

    const fotosAtualizadas = fotosAtuais.filter((f) => !f.includes(filename));
    await establishment.update({ fotos: JSON.stringify(fotosAtualizadas) });

    uploadService.deleteFile(fotoParaRemover);

    await redisService.invalidate(`estabelecimento:${id}`);
    await redisService.invalidatePattern('estabelecimentos:*');

    res.json({
      message: 'Foto removida com sucesso',
      fotos: fotosAtualizadas,
    });
  } catch (error) {
    console.error('Erro ao remover foto:', error);
    res.status(500).json({ error: 'Erro ao remover foto' });
  }
};
