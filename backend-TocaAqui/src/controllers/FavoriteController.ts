import { Request, Response } from "express";
import FavoriteModel from "../models/FavoriteModel";
import EstablishmentProfileModel from "../models/EstablishmentProfileModel";
import ArtistProfileModel from "../models/ArtistProfileModel";
import BandModel from "../models/BandModel";

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const usuario_id = (req as any).user?.id;
    const { favoritavel_tipo, favoritavel_id } = req.body;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    if (!favoritavel_tipo || !favoritavel_id) {
      return res.status(400).json({ error: "Tipo e ID do favorito são obrigatórios" });
    }

    const tiposValidos = ['perfil_estabelecimento', 'perfil_artista', 'banda'];
    if (!tiposValidos.includes(favoritavel_tipo)) {
      return res.status(400).json({ error: "Tipo de favorito inválido" });
    }

    let itemExiste;
    switch (favoritavel_tipo) {
      case 'perfil_estabelecimento':
        itemExiste = await EstablishmentProfileModel.findByPk(favoritavel_id);
        break;
      case 'perfil_artista':
        itemExiste = await ArtistProfileModel.findByPk(favoritavel_id);
        break;
      case 'banda':
        itemExiste = await BandModel.findByPk(favoritavel_id);
        break;
    }

    if (!itemExiste) {
      return res.status(404).json({ error: "Item não encontrado" });
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

    res.status(201).json({ 
      message: "Item adicionado aos favoritos com sucesso",
      favorito 
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar item aos favoritos" });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const usuario_id = (req as any).user?.id;
    const { favoritavel_tipo, favoritavel_id } = req.params;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const favorito = await FavoriteModel.findOne({
      where: { usuario_id, favoritavel_tipo, favoritavel_id }
    });

    if (!favorito) {
      return res.status(404).json({ error: "Item não está nos seus favoritos" });
    }

    await favorito.destroy();

    res.json({ message: "Item removido dos favoritos com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover item dos favoritos" });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const usuario_id = (req as any).user?.id;
    const { tipo } = req.query; 

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const whereClause: any = { usuario_id };
    if (tipo && ['perfil_estabelecimento', 'perfil_artista', 'banda'].includes(tipo as string)) {
      whereClause.favoritavel_tipo = tipo;
    }

    const favoritos = await FavoriteModel.findAll({
      where: whereClause,
      order: [['data_criacao', 'DESC']]
    });

    const favoritosComDetalhes = [];
    for (const favorito of favoritos) {
      let detalheItem;
      switch (favorito.favoritavel_tipo) {
        case 'perfil_estabelecimento':
          detalheItem = await EstablishmentProfileModel.findByPk(favorito.favoritavel_id);
          break;
        case 'perfil_artista':
          detalheItem = await ArtistProfileModel.findByPk(favorito.favoritavel_id);
          break;
        case 'banda':
          detalheItem = await BandModel.findByPk(favorito.favoritavel_id);
          break;
      }

      favoritosComDetalhes.push({
        id: favorito.id,
        tipo: favorito.favoritavel_tipo,
        data_criacao: favorito.data_criacao,
        item: detalheItem
      });
    }

    res.json({
      message: "Lista de favoritos recuperada com sucesso",
      total: favoritosComDetalhes.length,
      favoritos: favoritosComDetalhes
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar favoritos" });
  }
};

export const checkFavorite = async (req: Request, res: Response) => {
  try {
    const usuario_id = (req as any).user?.id;
    const { favoritavel_tipo, favoritavel_id } = req.params;

    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não identificado" });
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
    res.status(500).json({ error: "Erro ao verificar favorito" });
  }
};