import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import FavoriteModel from "../models/FavoriteModel";
import redisService from "../config/redis";
import pubSubService from "../services/PubSubService";

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const { favoritavel_tipo, favoritavel_id } = req.body;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (!favoritavel_tipo || !favoritavel_id) {
      return res.status(400).json({ error: "Tipo e ID do favorito são obrigatórios" });
    }

    const tiposValidos = ['perfil_estabelecimento', 'perfil_artista', 'banda'];
    if (!tiposValidos.includes(favoritavel_tipo)) {
      return res.status(400).json({ error: "Tipo de favorito inválido" });
    }

    const favoritoExistente = await FavoriteModel.findOne({
      where: { usuario_id, favoritavel_tipo, favoritavel_id }
    });

    if (favoritoExistente) {
      return res.status(400).json({ error: "Item já está nos seus favoritos" });
    }

    const favorito = await FavoriteModel.create({
      usuario_id,
      favoritavel_tipo,
      favoritavel_id
    });

    await redisService.invalidate(`favoritos:usuario:${usuario_id}`);

    await pubSubService.publishFavoritoAdicionado({
      usuario_id,
      favoritavel_tipo,
      favoritavel_id
    });

    res.status(201).json({ 
      message: "Item adicionado aos favoritos com sucesso",
      favorito 
    });
  } catch (error) {
    console.error("Erro ao adicionar favorito:", error);
    res.status(500).json({ error: "Erro ao adicionar item aos favoritos" });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const { favoritavel_tipo, favoritavel_id } = req.params;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const favorito = await FavoriteModel.findOne({
      where: { usuario_id, favoritavel_tipo, favoritavel_id }
    });

    if (!favorito) {
      return res.status(404).json({ error: "Item não está nos seus favoritos" });
    }

    await favorito.destroy();

    await redisService.invalidate(`favoritos:usuario:${usuario_id}`);

    await pubSubService.publishFavoritoRemovido({
      usuario_id,
      favoritavel_tipo: favoritavel_tipo as string,
      favoritavel_id: parseInt(favoritavel_id as string)
    });

    res.json({ message: "Item removido dos favoritos com sucesso" });
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    res.status(500).json({ error: "Erro ao remover item dos favoritos" });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const { tipo } = req.query;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const cacheKey = `favoritos:usuario:${usuario_id}${tipo ? `:tipo:${tipo}` : ''}`;

    const cached = await redisService.get<any[]>(cacheKey);
    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json({
        message: "Lista de favoritos recuperada com sucesso",
        total: cached.length,
        favoritos: cached,
        source: "cache"
      });
    }

    console.log(`Cache MISS: ${cacheKey}`);

    const whereClause: any = { usuario_id };
    if (tipo && ['perfil_estabelecimento', 'perfil_artista', 'banda'].includes(tipo as string)) {
      whereClause.favoritavel_tipo = tipo;
    }

    const favoritos = await FavoriteModel.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    const favoritosSimplificados = favoritos.map(fav => ({
      id: fav.id,
      tipo: fav.favoritavel_tipo,
      item_id: fav.favoritavel_id,
      data_criacao: (fav as any).createdAt || fav.data_criacao
    }));

    await redisService.set(cacheKey, favoritosSimplificados, 600);

    res.json({
      message: "Lista de favoritos recuperada com sucesso",
      total: favoritosSimplificados.length,
      favoritos: favoritosSimplificados,
      source: "database"
    });
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    res.status(500).json({ error: "Erro ao buscar favoritos" });
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const usuario_id = req.user?.id;
    const { favoritavel_tipo, favoritavel_id } = req.params;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const favorito = await FavoriteModel.findOne({
      where: { usuario_id, favoritavel_tipo, favoritavel_id }
    });

    res.json({
      eh_favorito: !!favorito,
      tipo: favoritavel_tipo,
      item_id: Number(favoritavel_id)
    });
  } catch (error) {
    console.error("Erro ao verificar favorito:", error);
    res.status(500).json({ error: "Erro ao verificar favorito" });
  }
};
