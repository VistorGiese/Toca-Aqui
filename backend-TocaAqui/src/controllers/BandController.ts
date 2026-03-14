import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../config/database";
import BandModel from "../models/BandModel";
import { uploadService } from "../services/UploadService";
import redisService from "../config/redis";
import { CACHE_TTL, CACHE_KEYS } from "../config/cache";

export const createBand = async (req: Request, res: Response) => {
  try {
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
        return res.status(400).json({
          error: 'Já existe uma banda cadastrada com este nome',
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
  } catch (error) {
    if (req.file) {
      uploadService.deleteFile(uploadService.getRelativePath(req.file));
    }
    res.status(400).json({ error: "Erro ao criar banda", details: error });
  }
};

export const getBands = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar bandas", details: error });
  }
};

export const getBandById = async (req: Request, res: Response) => {
  try {
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
      return res.status(404).json({ error: "Banda não encontrada" });
    }

    await redisService.set(cacheKey, band, CACHE_TTL.LONG);
    res.json({ data: band });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar banda", details: error });
  }
};

export const updateBand = async (req: Request, res: Response) => {
  try {
    const bandId = req.params.id as string;
    const band = await BandModel.findByPk(bandId);
    if (!band) return res.status(404).json({ error: "Banda não encontrada" });

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
        return res.status(400).json({
          error: 'Já existe uma banda cadastrada com este nome',
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

    const { nome_banda, nome, descricao, generos_musicais, esta_ativo } = req.body;
    const updateData: Partial<{ nome_banda: string; descricao: string; generos_musicais: any; esta_ativo: boolean; imagem: string }> = {};
    const novoNome = nome_banda || nome;
    if (novoNome !== undefined) updateData.nome_banda = novoNome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (generos_musicais !== undefined) updateData.generos_musicais = generos_musicais;
    if (esta_ativo !== undefined) updateData.esta_ativo = esta_ativo;
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
  } catch (error) {
    if (req.file) {
      uploadService.deleteFile(uploadService.getRelativePath(req.file));
    }
    res.status(400).json({ error: "Erro ao atualizar banda", details: error });
  }
};

export const deleteBand = async (req: Request, res: Response) => {
  try {
    const bandId = req.params.id as string;
    const band = await BandModel.findByPk(bandId);
    if (!band) return res.status(404).json({ error: "Banda não encontrada" });

    if (band.imagem) {
      uploadService.deleteFile(band.imagem);
    }

    await band.destroy();

    await redisService.invalidate(CACHE_KEYS.banda(bandId));
    await redisService.invalidatePattern('bandas:*');

    res.json({ message: "Banda removida com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover banda", details: error });
  }
};
