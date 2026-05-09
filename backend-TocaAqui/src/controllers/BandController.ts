/**
 * BandController — CRUD público/admin de bandas (rotas /bandas).
 * Usado para listagem pública, criação com upload de imagem, e gerenciamento admin.
 * Para operações de artistas (criar banda como membro, convites), ver BandManagementController.
 */
import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../config/database";
import BandModel, { BandAttributes } from "../models/BandModel";
import { uploadService } from "../services/UploadService";
import redisService from "../config/redis";
import { CACHE_TTL, CACHE_KEYS } from "../config/cache";
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';
import { AuthRequest } from '../middleware/authmiddleware';

export const createBand = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const {
    nome_banda,
    nome,
    descricao,
    biografia,
    genero_musical,
    generos_musicais,
    data_criacao
  } = req.body;

  let imagemPath: string | undefined;
  if (req.file) {
    imagemPath = uploadService.getRelativePath(req.file);
    console.log(`Imagem da banda salva: ${imagemPath}`);
  }

  const nomeBanda = nome_banda || nome;
  const descricaoBanda = descricao || biografia;
  const generos = generos_musicais || (genero_musical ? [genero_musical] : []);

  if (nomeBanda) {
    const existingBand = await BandModel.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nome_banda')),
        sequelize.fn('LOWER', nomeBanda)
      ),
    });

    if (existingBand) {
      if (req.file) {
        uploadService.deleteFile(imagemPath!);
        console.log(`Imagem deletada: banda duplicada detectada`);
      }
      throw new AppError('Já existe uma banda cadastrada com este nome', 400, {
        banda_existente: {
          id: existingBand.id,
          nome: existingBand.nome_banda,
        },
      });
    }
  }

  const band = await BandModel.create({
    nome_banda: nomeBanda,
    descricao: descricaoBanda,
    imagem: imagemPath,
    generos_musicais: generos,
    data_criacao: data_criacao || new Date()
  });

  await redisService.invalidatePattern('bandas:*');

  res.status(201).json({
    message: "Banda criada com sucesso",
    banda: band,
    imagem_upload: req.file ? {
      filename: req.file.filename,
      path: imagemPath,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : null
  });
});

export const getBands = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const { nome, genero } = req.query as Record<string, string>;

  const where: any = {};
  if (nome)   where.nome_banda        = { [Op.like]: `%${nome}%` };
  if (genero) where.generos_musicais  = { [Op.like]: `%${genero}%` };

  const sortedParams = Object.entries(req.query)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(':');
  const cacheKey = CACHE_KEYS.bandas(sortedParams || 'all');

  const cachedData = await redisService.get<any>(cacheKey);
  if (cachedData) {
    console.log(`[CACHE HIT] ${cacheKey}`);
    return res.json(cachedData);
  }

  console.log(`[CACHE MISS] ${cacheKey}`);
  const { count, rows } = await BandModel.findAndCountAll({ where, limit, offset });

  const payload = {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };

  await redisService.set(cacheKey, payload, CACHE_TTL.LONG);
  res.json(payload);
});

export const getBandById = asyncHandler(async (req: Request, res: Response) => {
  const bandId = req.params.id as string;
  const cacheKey = CACHE_KEYS.banda(bandId);

  const cachedData = await redisService.get<any>(cacheKey);
  if (cachedData) {
    console.log(`[CACHE HIT] ${cacheKey}`);
    return res.json({ data: cachedData });
  }

  console.log(`[CACHE MISS] ${cacheKey}`);
  const band = await BandModel.findByPk(bandId);

  if (!band) {
    throw new AppError('Banda não encontrada', 404);
  }

  await redisService.set(cacheKey, band, CACHE_TTL.LONG);
  res.json({ data: band });
});

export const updateBand = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const bandId = req.params.id as string;
  const band = await BandModel.findByPk(bandId);
  if (!band) throw new AppError('Banda não encontrada', 404);

  const novoNome = req.body.nome_banda || req.body.nome;
  if (novoNome && novoNome !== band.nome_banda) {
    const existingBand = await BandModel.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nome_banda')),
        sequelize.fn('LOWER', novoNome)
      ),
    });

    if (existingBand && existingBand.id !== band.id) {
      if (req.file) {
        uploadService.deleteFile(uploadService.getRelativePath(req.file));
      }
      throw new AppError('Já existe uma banda cadastrada com este nome', 400, {
        banda_existente: {
          id: existingBand.id,
          nome: existingBand.nome_banda,
        },
      });
    }
  }

  if (req.file && band.imagem) {
    uploadService.deleteFile(band.imagem);
  }

  const { nome_banda, nome, descricao, generos_musicais, esta_ativo, cache_minimo, cache_maximo, cidade, estado, telefone_contato, links_sociais, press_kit, tem_estrutura_som, estrutura_som, esta_disponivel } = req.body;
  const updateData: Partial<BandAttributes> = {};
  if (novoNome !== undefined) updateData.nome_banda = novoNome;
  if (descricao !== undefined) updateData.descricao = descricao;
  if (generos_musicais !== undefined) updateData.generos_musicais = generos_musicais;
  if (esta_ativo !== undefined) updateData.esta_ativo = esta_ativo;
  if (cache_minimo !== undefined) updateData.cache_minimo = cache_minimo;
  if (cache_maximo !== undefined) updateData.cache_maximo = cache_maximo;
  if (cidade !== undefined) updateData.cidade = cidade;
  if (estado !== undefined) updateData.estado = estado;
  if (telefone_contato !== undefined) updateData.telefone_contato = telefone_contato;
  if (links_sociais !== undefined) updateData.links_sociais = links_sociais;
  if (press_kit !== undefined) updateData.press_kit = press_kit;
  if (tem_estrutura_som !== undefined) updateData.tem_estrutura_som = tem_estrutura_som;
  if (estrutura_som !== undefined) updateData.estrutura_som = estrutura_som;
  if (esta_disponivel !== undefined) updateData.esta_disponivel = esta_disponivel;
  if (req.file) {
    updateData.imagem = uploadService.getRelativePath(req.file);
  }

  await band.update(updateData);

  await redisService.invalidate(CACHE_KEYS.banda(bandId));
  await redisService.invalidatePattern('bandas:*');

  res.json({
    message: "Banda atualizada com sucesso",
    banda: band,
    imagem_upload: req.file ? {
      filename: req.file.filename,
      path: updateData.imagem,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : null
  });
});

export const deleteBand = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const bandId = req.params.id as string;
  const band = await BandModel.findByPk(bandId);
  if (!band) throw new AppError('Banda não encontrada', 404);

  if (band.imagem) {
    uploadService.deleteFile(band.imagem);
  }

  await band.destroy();

  await redisService.invalidate(CACHE_KEYS.banda(bandId));
  await redisService.invalidatePattern('bandas:*');

  res.json({ message: "Banda removida com sucesso" });
});
