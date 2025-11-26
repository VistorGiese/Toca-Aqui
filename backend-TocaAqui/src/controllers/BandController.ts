import { Request, Response } from "express";
import sequelize from "../config/database";
import BandModel from "../models/BandModel";
import { uploadService } from "../services/UploadService";
import redisService from "../config/redis";


const CACHE_TTL = 3000;

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
      generos_musicais: JSON.stringify(generos),
      data_criacao: data_criacao || new Date()
    });
    
    await redisService.invalidatePattern('bandas:*');
    console.log('Cache invalidado: bandas:* (nova banda criada)');
    
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
      console.log(`Imagem deletada devido a erro na criação da banda`);
    }
    res.status(400).json({ error: "Erro ao criar banda", details: error });
  }
};

export const getBands = async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'bandas:list';
    
    const cachedData = await redisService.get<any[]>(cacheKey);
    
    if (cachedData) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json({
        data: cachedData,
        source: 'cache'
      });
    }
    
    console.log(`Cache MISS: ${cacheKey} - Buscando do banco de dados...`);
    const bands = await BandModel.findAll();
    
    await redisService.set(cacheKey, bands, CACHE_TTL);
    console.log(`Cache armazenado: ${cacheKey} (TTL: ${CACHE_TTL}s)`);
    
    res.json({
      data: bands,
      source: 'database'
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar bandas", details: error });
  }
};

export const getBandById = async (req: Request, res: Response) => {
  try {
    const bandId = req.params.id;
    const cacheKey = `banda:${bandId}`;
    
    const cachedData = await redisService.get<any>(cacheKey);
    
    if (cachedData) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json({
        data: cachedData,
        source: 'cache'
      });
    }

    console.log(`Cache MISS: ${cacheKey} - Buscando do banco de dados...`);
    const band = await BandModel.findByPk(bandId);
    
    if (!band) {
      return res.status(404).json({ error: "Banda não encontrada" });
    }
    

    await redisService.set(cacheKey, band, CACHE_TTL);
    console.log(`Cache armazenado: ${cacheKey} (TTL: ${CACHE_TTL}s)`);
    
    res.json({
      data: band,
      source: 'database'
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar banda", details: error });
  }
};

export const updateBand = async (req: Request, res: Response) => {
  try {
    const bandId = req.params.id;
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
          console.log(`Imagem deletada: nome de banda duplicado detectado`);
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
      console.log(`Imagem antiga deletada: ${band.imagem}`);
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.imagem = uploadService.getRelativePath(req.file);
      console.log(`Nova imagem da banda: ${updateData.imagem}`);
    }

    await band.update(updateData);

    await redisService.invalidate(`banda:${bandId}`);
    await redisService.invalidatePattern('bandas:*');
    console.log(`Cache invalidado: banda:${bandId} e bandas:* (banda atualizada)`);
    
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
      console.log(`Imagem deletada devido a erro na atualização da banda`);
    }
    res.status(400).json({ error: "Erro ao atualizar banda", details: error });
  }
};

export const deleteBand = async (req: Request, res: Response) => {
  try {
    const bandId = req.params.id;
    const band = await BandModel.findByPk(bandId);
    if (!band) return res.status(404).json({ error: "Banda não encontrada" });
    

    if (band.imagem) {
      uploadService.deleteFile(band.imagem);
      console.log(`Imagem da banda deletada: ${band.imagem}`);
    }

    await band.destroy();
    
    await redisService.invalidate(`banda:${bandId}`);
    await redisService.invalidatePattern('bandas:*');
    console.log(`Cache invalidado: banda:${bandId} e bandas:* (banda deletada)`);
    
    res.json({ message: "Banda removida com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover banda", details: error });
  }
};
