import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import CommentModel from "../models/CommentModel";
import redisService from "../config/redis";
import pubSubService from "../services/PubSubService";

export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { comentavel_tipo, comentavel_id, texto } = req.body;

  if (!usuario_id) throw new AppError("Usuário não autenticado", 401);

  if (!comentavel_tipo || !comentavel_id || !texto) {
    throw new AppError("Todos os campos são obrigatórios", 400);
  }

  const tiposValidos = ['perfil_estabelecimento', 'perfil_artista', 'banda', 'agendamento'];
  if (!tiposValidos.includes(comentavel_tipo)) {
    throw new AppError("Tipo de comentário inválido", 400);
  }

  if (texto.trim().length < 3) {
    throw new AppError("Comentário muito curto (mínimo 3 caracteres)", 400);
  }

  if (texto.trim().length > 1000) {
    throw new AppError("Comentário muito longo (máximo 1000 caracteres)", 400);
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
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const { comentavel_tipo, comentavel_id } = req.params;

  if (!comentavel_tipo || !comentavel_id) {
    throw new AppError("Tipo e ID são obrigatórios", 400);
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const cacheKey = `comentarios:${comentavel_tipo}:${comentavel_id}:p${page}:l${limit}`;

  const cached = await redisService.get<any>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const { count, rows } = await CommentModel.findAndCountAll({
    where: { comentavel_tipo, comentavel_id },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const resultado = {
    message: "Comentários recuperados com sucesso",
    data: rows,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };

  await redisService.set(cacheKey, resultado, 300);
  res.json(resultado);
});

export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { id } = req.params;

  if (!usuario_id) throw new AppError("Usuário não autenticado", 401);

  const comentario = await CommentModel.findByPk(id as string);
  if (!comentario) throw new AppError("Comentário não encontrado", 404);

  if (comentario.usuario_id !== usuario_id) {
    throw new AppError("Você não tem permissão para deletar este comentário", 403);
  }

  await comentario.destroy();

  await redisService.invalidatePattern(`comentarios:${comentario.comentavel_tipo}:${comentario.comentavel_id}:*`);

  await pubSubService.publishComentarioDeletado({
    id: comentario.id,
    comentavel_tipo: comentario.comentavel_tipo,
    comentavel_id: comentario.comentavel_id
  });

  res.json({ message: "Comentário deletado com sucesso" });
});
