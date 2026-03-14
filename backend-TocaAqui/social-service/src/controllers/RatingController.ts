import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import RatingModel from "../models/RatingModel";
import redisService from "../config/redis";
import pubSubService from "../services/PubSubService";

export const createRating = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { avaliavel_tipo, avaliavel_id, nota, comentario } = req.body;

  if (!usuario_id) throw new AppError("Usuário não autenticado", 401);

  if (!avaliavel_tipo || !avaliavel_id || !nota) {
    throw new AppError("Tipo, ID e nota são obrigatórios", 400);
  }

  const tiposValidos = ['perfil_estabelecimento', 'perfil_artista', 'banda'];
  if (!tiposValidos.includes(avaliavel_tipo)) {
    throw new AppError("Tipo de avaliação inválido", 400);
  }

  if (nota < 1 || nota > 5) {
    throw new AppError("Nota deve ser entre 1 e 5", 400);
  }

  const avaliacaoExistente = await RatingModel.findOne({
    where: { usuario_id, avaliavel_tipo, avaliavel_id }
  });

  if (avaliacaoExistente) {
    throw new AppError("Você já avaliou este item", 400);
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
});

export const updateRating = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { id } = req.params;
  const { nota, comentario } = req.body;

  if (!usuario_id) throw new AppError("Usuário não autenticado", 401);

  const avaliacao = await RatingModel.findByPk(id);
  if (!avaliacao) throw new AppError("Avaliação não encontrada", 404);

  if (avaliacao.usuario_id !== usuario_id) {
    throw new AppError("Você não tem permissão para atualizar esta avaliação", 403);
  }

  const nota_antiga = avaliacao.nota;

  if (nota !== undefined) {
    if (nota < 1 || nota > 5) {
      throw new AppError("Nota deve ser entre 1 e 5", 400);
    }
    avaliacao.nota = nota;
  }

  if (comentario !== undefined) {
    avaliacao.comentario = comentario?.trim() || null;
  }

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
});

export const getRatings = asyncHandler(async (req: Request, res: Response) => {
  const { avaliavel_tipo, avaliavel_id } = req.params;

  if (!avaliavel_tipo || !avaliavel_id) {
    throw new AppError("Tipo e ID são obrigatórios", 400);
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const cacheKey = `avaliacoes:${avaliavel_tipo}:${avaliavel_id}:p${page}:l${limit}`;

  const cached = await redisService.get<any>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const { count, rows } = await RatingModel.findAndCountAll({
    where: { avaliavel_tipo, avaliavel_id },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const media = count > 0
    ? rows.reduce((acc, av) => acc + av.nota, 0) / rows.length
    : 0;

  const resultado = {
    message: "Avaliações recuperadas com sucesso",
    media: parseFloat(media.toFixed(2)),
    data: rows,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };

  await redisService.set(cacheKey, resultado, 600);
  res.json(resultado);
});

export const deleteRating = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { id } = req.params;

  if (!usuario_id) throw new AppError("Usuário não autenticado", 401);

  const avaliacao = await RatingModel.findByPk(id);
  if (!avaliacao) throw new AppError("Avaliação não encontrada", 404);

  if (avaliacao.usuario_id !== usuario_id) {
    throw new AppError("Você não tem permissão para deletar esta avaliação", 403);
  }

  await avaliacao.destroy();

  await redisService.invalidatePattern(`avaliacoes:${avaliacao.avaliavel_tipo}:${avaliacao.avaliavel_id}:*`);

  await pubSubService.publishAvaliacaoDeletada({
    id: avaliacao.id,
    avaliavel_tipo: avaliacao.avaliavel_tipo,
    avaliavel_id: avaliacao.avaliavel_id
  });

  res.json({ message: "Avaliação deletada com sucesso" });
});
