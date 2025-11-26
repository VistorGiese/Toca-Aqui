import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import RatingModel from "../models/RatingModel";
import redisService from "../config/redis";
import pubSubService from "../services/PubSubService";

export const createRating = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const { avaliavel_tipo, avaliavel_id, nota, comentario } = req.body;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (!avaliavel_tipo || !avaliavel_id || !nota) {
      return res.status(400).json({ error: "Tipo, ID e nota são obrigatórios" });
    }

    const tiposValidos = ['perfil_estabelecimento', 'perfil_artista', 'banda'];
    if (!tiposValidos.includes(avaliavel_tipo)) {
      return res.status(400).json({ error: "Tipo de avaliação inválido" });
    }

    if (nota < 1 || nota > 5) {
      return res.status(400).json({ error: "Nota deve ser entre 1 e 5" });
    }

    const avaliacaoExistente = await RatingModel.findOne({
      where: { usuario_id, avaliavel_tipo, avaliavel_id }
    });

    if (avaliacaoExistente) {
      return res.status(400).json({ error: "Você já avaliou este item" });
    }

    const avaliacao = await RatingModel.create({
      usuario_id,
      avaliavel_tipo,
      avaliavel_id,
      nota,
      comentario: comentario?.trim() || null
    });

    await redisService.invalidatePattern(`avaliacoes:${avaliavel_tipo}:${avaliavel_id}:*`);

    await pubSubService.publishAvaliacaoCriada({
      id: avaliacao.id,
      usuario_id,
      avaliavel_tipo,
      avaliavel_id,
      nota
    });

    res.status(201).json({ 
      message: "Avaliação criada com sucesso",
      avaliacao 
    });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    res.status(500).json({ error: "Erro ao criar avaliação" });
  }
};

export const updateRating = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const { id } = req.params;
    const { nota, comentario } = req.body;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const avaliacao = await RatingModel.findByPk(id);

    if (!avaliacao) {
      return res.status(404).json({ error: "Avaliação não encontrada" });
    }

    if (avaliacao.usuario_id !== usuario_id) {
      return res.status(403).json({ error: "Você não tem permissão para atualizar esta avaliação" });
    }

    if (nota !== undefined) {
      if (nota < 1 || nota > 5) {
        return res.status(400).json({ error: "Nota deve ser entre 1 e 5" });
      }
      avaliacao.nota = nota;
    }

    if (comentario !== undefined) {
      avaliacao.comentario = comentario?.trim() || null;
    }

    const nota_antiga = avaliacao.nota;

    await avaliacao.save();

    await redisService.invalidatePattern(`avaliacoes:${avaliacao.avaliavel_tipo}:${avaliacao.avaliavel_id}:*`);

    await pubSubService.publishAvaliacaoAtualizada({
      id: avaliacao.id,
      avaliavel_tipo: avaliacao.avaliavel_tipo,
      avaliavel_id: avaliacao.avaliavel_id,
      nota_antiga,
      nota_nova: avaliacao.nota
    });

    res.json({ 
      message: "Avaliação atualizada com sucesso",
      avaliacao 
    });
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);
    res.status(500).json({ error: "Erro ao atualizar avaliação" });
  }
};

export const getRatings = async (req: Request, res: Response) => {
  try {
    const { avaliavel_tipo, avaliavel_id } = req.params;

    if (!avaliavel_tipo || !avaliavel_id) {
      return res.status(400).json({ error: "Tipo e ID são obrigatórios" });
    }

    const cacheKey = `avaliacoes:${avaliavel_tipo}:${avaliavel_id}`;

    const cached = await redisService.get<any>(cacheKey);
    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json({
        ...cached,
        source: "cache"
      });
    }

    console.log(`Cache MISS: ${cacheKey}`);

    const avaliacoes = await RatingModel.findAll({
      where: { avaliavel_tipo, avaliavel_id },
      order: [['created_at', 'DESC']]
    });

    const total = avaliacoes.length;
    const media = total > 0 
      ? avaliacoes.reduce((acc, av) => acc + av.nota, 0) / total 
      : 0;

    const resultado = {
      message: "Avaliações recuperadas com sucesso",
      total,
      media: parseFloat(media.toFixed(2)),
      avaliacoes
    };

    await redisService.set(cacheKey, resultado, 600);

    res.json({
      ...resultado,
      source: "database"
    });
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    res.status(500).json({ error: "Erro ao buscar avaliações" });
  }
};

export const deleteRating = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const { id } = req.params;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const avaliacao = await RatingModel.findByPk(id);

    if (!avaliacao) {
      return res.status(404).json({ error: "Avaliação não encontrada" });
    }

    if (avaliacao.usuario_id !== usuario_id) {
      return res.status(403).json({ error: "Você não tem permissão para deletar esta avaliação" });
    }

    await avaliacao.destroy();

    await redisService.invalidatePattern(`avaliacoes:${avaliacao.avaliavel_tipo}:${avaliacao.avaliavel_id}:*`);

    await pubSubService.publishAvaliacaoDeletada({
      id: avaliacao.id,
      avaliavel_tipo: avaliacao.avaliavel_tipo,
      avaliavel_id: avaliacao.avaliavel_id
    });

    res.json({ message: "Avaliação deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
    res.status(500).json({ error: "Erro ao deletar avaliação" });
  }
};
