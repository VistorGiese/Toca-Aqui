import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import FavoriteModel from "../models/FavoriteModel";
import redisService from "../config/redis";
import pubSubService from "../services/PubSubService";

export const addFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { favoritavel_tipo, favoritavel_id } = req.body;

  if (!usuario_id) throw new AppError("Usuário não autenticado", 401);

  if (!favoritavel_tipo || !favoritavel_id) {
    throw new AppError("Tipo e ID do favorito são obrigatórios", 400);
  }

  const tiposValidos = ['perfil_estabelecimento', 'perfil_artista', 'banda'];
  if (!tiposValidos.includes(favoritavel_tipo)) {
    throw new AppError("Tipo de favorito inválido", 400);
  }

  const favoritoExistente = await FavoriteModel.findOne({
    where: { usuario_id, favoritavel_tipo, favoritavel_id }
  });

  if (favoritoExistente) {
    throw new AppError("Item já está nos seus favoritos", 400);
  }

  const favorito = await FavoriteModel.create({
    usuario_id,
    favoritavel_tipo,
    favoritavel_id
  });

  await redisService.invalidatePattern(`favoritos:usuario:${usuario_id}*`);

  await pubSubService.publishFavoritoAdicionado({
    usuario_id,
    favoritavel_tipo,
    favoritavel_id
  });

  res.status(201).json({
    message: "Item adicionado aos favoritos com sucesso",
    favorito
  });
});

export const removeFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { favoritavel_tipo, favoritavel_id } = req.params;

  if (!usuario_id) throw new AppError("Usuário não autenticado", 401);

  const favorito = await FavoriteModel.findOne({
    where: { usuario_id, favoritavel_tipo, favoritavel_id }
  });

  if (!favorito) throw new AppError("Item não está nos seus favoritos", 404);

  await favorito.destroy();

  await redisService.invalidatePattern(`favoritos:usuario:${usuario_id}*`);

  await pubSubService.publishFavoritoRemovido({
    usuario_id,
    favoritavel_tipo: favoritavel_tipo as string,
    favoritavel_id: parseInt(favoritavel_id as string)
  });

  res.json({ message: "Item removido dos favoritos com sucesso" });
});

export const getFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { tipo } = req.query;

  if (!usuario_id) throw new AppError("Usuário não autenticado", 401);

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const cacheKey = `favoritos:usuario:${usuario_id}${tipo ? `:tipo:${tipo}` : ''}:p${page}:l${limit}`;

  const cached = await redisService.get<any>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const whereClause: any = { usuario_id };
  if (tipo && ['perfil_estabelecimento', 'perfil_artista', 'banda'].includes(tipo as string)) {
    whereClause.favoritavel_tipo = tipo;
  }

  const { count, rows } = await FavoriteModel.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const favoritosSimplificados = rows.map(fav => ({
    id: fav.id,
    tipo: fav.favoritavel_tipo,
    item_id: fav.favoritavel_id,
    data_criacao: (fav as any).createdAt || fav.data_criacao
  }));

  const resultado = {
    message: "Lista de favoritos recuperada com sucesso",
    data: favoritosSimplificados,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };

  await redisService.set(cacheKey, resultado, 600);
  res.json(resultado);
});

export const checkFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { favoritavel_tipo, favoritavel_id } = req.params;

  if (!usuario_id) throw new AppError("Usuário não autenticado", 401);

  const favorito = await FavoriteModel.findOne({
    where: { usuario_id, favoritavel_tipo, favoritavel_id }
  });

  res.json({
    eh_favorito: !!favorito,
    tipo: favoritavel_tipo,
    item_id: Number(favoritavel_id)
  });
});
