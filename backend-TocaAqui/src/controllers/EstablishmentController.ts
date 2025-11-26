import { Request, Response } from 'express';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import AddressModel from '../models/AddressModel';
import UserModel from '../models/UserModel';
import redisService from '../config/redis';

const CACHE_TTL = 3000; 

export const listEstablishments = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'estabelecimentos:list';
    
    const cachedData = await redisService.get<any>(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.json(cachedData);
    }
    console.log(`[CACHE MISS] ${cacheKey}`);

    const establishments = await EstablishmentProfileModel.findAll({
      where: { esta_ativo: true },
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
      order: [['created_at', 'DESC']],
    });

    const response = {
      success: true,
      count: establishments.length,
      data: establishments,
    };

    // Salvar no cache
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

    // Verificar cache
    const cachedData = await redisService.get<any>(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.json(cachedData);
    }
    console.log(`[CACHE MISS] ${cacheKey}`);

    const establishment = await EstablishmentProfileModel.findByPk(id, {
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
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const establishment = await EstablishmentProfileModel.findByPk(id);

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
          id: { [require('sequelize').Op.ne]: id }, // Excluir o próprio estabelecimento
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
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const establishment = await EstablishmentProfileModel.findByPk(id);

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
