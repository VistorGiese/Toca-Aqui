import { Request, Response } from 'express';
import path from 'path';
import { AuthRequest } from '../middleware/authmiddleware';
import { Op } from 'sequelize';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import AddressModel from '../models/AddressModel';
import UserModel from '../models/UserModel';
import redisService from '../config/redis';
import { uploadService } from '../services/UploadService';
import { CACHE_TTL, CACHE_KEYS } from '../config/cache';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';
import { geocodificarEndereco } from '../services/GeocodingService';

export const listEstablishments = asyncHandler(async (req: Request, res: Response) => {
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
  const cacheKey = CACHE_KEYS.estabelecimentos(sortedParams || 'all');

  const cachedData = await redisService.get<any>(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const { count, rows } = await EstablishmentProfileModel.findAndCountAll({
    where,
    include: [
      {
        model: AddressModel,
        as: 'Address',
        where: Object.keys(addressWhere).length ? addressWhere : undefined,
        required: !!cidade,
        attributes: ['id', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'],
      },
      { model: UserModel, as: 'User', attributes: ['id', 'nome_completo', 'email'] },
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

  await redisService.set(cacheKey, response, CACHE_TTL.LONG);
  res.json(response);
});

export const getEstablishment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = CACHE_KEYS.estabelecimento(id as string);

  const cachedData = await redisService.get<any>(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const establishment = await EstablishmentProfileModel.findByPk(id as string, {
    include: [
      {
        model: AddressModel,
        as: 'Address',
        attributes: ['id', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'],
      },
      {
        model: UserModel,
        as: 'User',
        attributes: ['id', 'nome_completo', 'email'],
      },
    ],
  });

  if (!establishment) {
    throw new AppError('Estabelecimento não encontrado', 404);
  }

  const response = {
    success: true,
    data: establishment,
  };

  // Salvar no cache
  await redisService.set(cacheKey, response, CACHE_TTL.LONG);

  res.json(response);
});

export const updateEstablishment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const establishment = await EstablishmentProfileModel.findByPk(id as string);

  if (!establishment) {
    throw new AppError('Estabelecimento não encontrado', 404);
  }

  if (userRole !== 'admin' && establishment.usuario_id !== userId) {
    throw new AppError('Você não tem permissão para editar este estabelecimento', 403);
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
      throw new AppError('Este endereço já está sendo utilizado por outro estabelecimento ativo', 400, {
        estabelecimento_existente: {
          id: existingEstablishment.id,
          nome: existingEstablishment.nome_estabelecimento,
        },
      });
    }
  }

  const novoEnderecoId = endereco_id ?? establishment.endereco_id;
  let coordenadas: { latitude?: number; longitude?: number } = {};

  if (endereco_id && endereco_id !== establishment.endereco_id) {
    const endereco = await AddressModel.findByPk(endereco_id);
    if (endereco) {
      const coords = await geocodificarEndereco(
        endereco.rua,
        endereco.numero,
        endereco.cidade,
        endereco.estado,
        endereco.cep
      );
      if (coords) {
        coordenadas = { latitude: coords.latitude, longitude: coords.longitude };
      }
    }
  }

  await establishment.update({
    nome_estabelecimento: nome_estabelecimento ?? establishment.nome_estabelecimento,
    tipo_estabelecimento: tipo_estabelecimento ?? establishment.tipo_estabelecimento,
    descricao: descricao !== undefined ? descricao : establishment.descricao,
    generos_musicais: generos_musicais ?? establishment.generos_musicais,
    horario_abertura: horario_abertura ?? establishment.horario_abertura,
    horario_fechamento: horario_fechamento ?? establishment.horario_fechamento,
    endereco_id: novoEnderecoId,
    telefone_contato: telefone_contato ?? establishment.telefone_contato,
    fotos: fotos !== undefined ? fotos : establishment.fotos,
    esta_ativo: esta_ativo !== undefined ? esta_ativo : establishment.esta_ativo,
    ...coordenadas,
  });

  // Invalidar cache
  await redisService.invalidate(CACHE_KEYS.estabelecimento(id as string));
  await redisService.invalidatePattern('estabelecimentos:*');

  res.json({
    success: true,
    message: 'Estabelecimento atualizado com sucesso',
    data: establishment,
  });
});

export const deleteEstablishment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const establishment = await EstablishmentProfileModel.findByPk(id as string);

  if (!establishment) {
    throw new AppError('Estabelecimento não encontrado', 404);
  }

  if (userRole !== 'admin' && establishment.usuario_id !== userId) {
    throw new AppError('Você não tem permissão para excluir este estabelecimento', 403);
  }

  await establishment.update({ esta_ativo: false });

  // Invalidar cache
  await redisService.invalidate(CACHE_KEYS.estabelecimento(id as string));
  await redisService.invalidatePattern('estabelecimentos:*');

  res.json({
    success: true,
    message: 'Estabelecimento desativado com sucesso',
  });
});

export const uploadEstablishmentPhotos = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError('Nenhuma imagem enviada', 400);
  }

  const novasFotos = files.map((f) => uploadService.getRelativePath(f));

  const establishment = await EstablishmentProfileModel.findByPk(id as string);
  if (!establishment) {
    novasFotos.forEach((p) => uploadService.deleteFile(p));
    throw new AppError('Estabelecimento não encontrado', 404);
  }

  if (userRole !== 'admin' && establishment.usuario_id !== userId) {
    novasFotos.forEach((p) => uploadService.deleteFile(p));
    throw new AppError('Você não tem permissão para editar este estabelecimento', 403);
  }

  const fotosAtuais: string[] = Array.isArray(establishment.fotos)
    ? (establishment.fotos as unknown as string[])
    : establishment.fotos
      ? JSON.parse(establishment.fotos as unknown as string)
      : [];

  const fotosAtualizadas = [...fotosAtuais, ...novasFotos];

  await establishment.update({ fotos: JSON.stringify(fotosAtualizadas) });

  await redisService.invalidate(CACHE_KEYS.estabelecimento(id as string));
  await redisService.invalidatePattern('estabelecimentos:*');

  res.json({
    message: 'Fotos adicionadas com sucesso',
    fotos: fotosAtualizadas,
  });
});

export const removeEstablishmentPhoto = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { filename } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!filename) {
    throw new AppError('filename é obrigatório', 400);
  }

  const establishment = await EstablishmentProfileModel.findByPk(id as string);
  if (!establishment) {
    throw new AppError('Estabelecimento não encontrado', 404);
  }

  if (userRole !== 'admin' && establishment.usuario_id !== userId) {
    throw new AppError('Você não tem permissão para editar este estabelecimento', 403);
  }

  const fotosAtuais: string[] = Array.isArray(establishment.fotos)
    ? (establishment.fotos as unknown as string[])
    : establishment.fotos
      ? JSON.parse(establishment.fotos as unknown as string)
      : [];

  // Sanitizar filename: usar apenas o basename para evitar path traversal
  const safeFilename = path.basename(filename);
  const fotoParaRemover = fotosAtuais.find((f) => path.basename(f) === safeFilename);
  if (!fotoParaRemover) {
    throw new AppError('Foto não encontrada no perfil do estabelecimento', 404);
  }

  const fotosAtualizadas = fotosAtuais.filter((f) => f !== fotoParaRemover);
  await establishment.update({ fotos: JSON.stringify(fotosAtualizadas) });

  uploadService.deleteFile(fotoParaRemover);

  await redisService.invalidate(CACHE_KEYS.estabelecimento(id as string));
  await redisService.invalidatePattern('estabelecimentos:*');

  res.json({
    message: 'Foto removida com sucesso',
    fotos: fotosAtualizadas,
  });
});
