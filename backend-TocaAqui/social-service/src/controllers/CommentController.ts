import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import CommentModel from "../models/CommentModel";
import redisService from "../config/redis";
import pubSubService from "../services/PubSubService";

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const { comentavel_tipo, comentavel_id, texto } = req.body;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (!comentavel_tipo || !comentavel_id || !texto) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    const tiposValidos = ['perfil_estabelecimento', 'perfil_artista', 'banda', 'agendamento'];
    if (!tiposValidos.includes(comentavel_tipo)) {
      return res.status(400).json({ error: "Tipo de comentário inválido" });
    }

    if (texto.trim().length < 3) {
      return res.status(400).json({ error: "Comentário muito curto (mínimo 3 caracteres)" });
    }

    if (texto.trim().length > 1000) {
      return res.status(400).json({ error: "Comentário muito longo (máximo 1000 caracteres)" });
    }

    const comentario = await CommentModel.create({
      usuario_id,
      comentavel_tipo,
      comentavel_id,
      texto: texto.trim()
    });

    await redisService.invalidatePattern(`comentarios:${comentavel_tipo}:${comentavel_id}:*`);

    await pubSubService.publishComentarioCriado({
      id: comentario.id,
      usuario_id,
      comentavel_tipo,
      comentavel_id
    });

    res.status(201).json({ 
      message: "Comentário criado com sucesso",
      comentario 
    });
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    res.status(500).json({ error: "Erro ao criar comentário" });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { comentavel_tipo, comentavel_id } = req.params;

    if (!comentavel_tipo || !comentavel_id) {
      return res.status(400).json({ error: "Tipo e ID são obrigatórios" });
    }

    const cacheKey = `comentarios:${comentavel_tipo}:${comentavel_id}`;

    const cached = await redisService.get<any[]>(cacheKey);
    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json({
        message: "Comentários recuperados com sucesso",
        total: cached.length,
        comentarios: cached,
        source: "cache"
      });
    }

    console.log(`Cache MISS: ${cacheKey}`);

    const comentarios = await CommentModel.findAll({
      where: { comentavel_tipo, comentavel_id },
      order: [['created_at', 'DESC']]
    });

    await redisService.set(cacheKey, comentarios, 300);

    res.json({
      message: "Comentários recuperados com sucesso",
      total: comentarios.length,
      comentarios,
      source: "database"
    });
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    res.status(500).json({ error: "Erro ao buscar comentários" });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const { id } = req.params;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const comentario = await CommentModel.findByPk(id);

    if (!comentario) {
      return res.status(404).json({ error: "Comentário não encontrado" });
    }

    if (comentario.usuario_id !== usuario_id) {
      return res.status(403).json({ error: "Você não tem permissão para deletar este comentário" });
    }

    await comentario.destroy();

    await redisService.invalidatePattern(`comentarios:${comentario.comentavel_tipo}:${comentario.comentavel_id}:*`);

    await pubSubService.publishComentarioDeletado({
      id: comentario.id,
      comentavel_tipo: comentario.comentavel_tipo,
      comentavel_id: comentario.comentavel_id
    });

    res.json({ message: "Comentário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    res.status(500).json({ error: "Erro ao deletar comentário" });
  }
};
