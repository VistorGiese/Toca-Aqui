import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middleware/authmiddleware";
import FavoriteModel from "../models/FavoriteModel";
import EstablishmentProfileModel from "../models/EstablishmentProfileModel";
import ArtistProfileModel from "../models/ArtistProfileModel";
import BandModel from "../models/BandModel";
import BookingModel from "../models/BookingModel";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError, unauthorized, badRequest, notFound } from "../errors/AppError";

export const addFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { favoritavel_tipo, favoritavel_id } = req.body;

  if (!usuario_id) {
    throw unauthorized("Usuário não identificado");
  }

  if (!favoritavel_tipo || !favoritavel_id) {
    throw badRequest("Tipo e ID do favorito são obrigatórios");
  }

  const tiposValidos = ['perfil_estabelecimento', 'perfil_artista', 'banda', 'agendamento'];
  if (!tiposValidos.includes(favoritavel_tipo)) {
    throw badRequest("Tipo de favorito inválido");
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
    case 'agendamento':
      itemExiste = await BookingModel.findByPk(favoritavel_id);
      break;
  }

  if (!itemExiste) {
    throw notFound("Item não encontrado");
  }

  const favoritoExistente = await FavoriteModel.findOne({
    where: { usuario_id, favoritavel_tipo, favoritavel_id }
  });

  if (favoritoExistente) {
    throw badRequest("Item já está nos seus favoritos");
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
});

export const removeFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { favoritavel_tipo, favoritavel_id } = req.params;

  if (!usuario_id) {
    throw unauthorized("Usuário não identificado");
  }

  const favorito = await FavoriteModel.findOne({
    where: { usuario_id, favoritavel_tipo, favoritavel_id }
  });

  if (!favorito) {
    throw notFound("Item não está nos seus favoritos");
  }

  await favorito.destroy();

  res.json({ message: "Item removido dos favoritos com sucesso" });
});

export const getFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { tipo } = req.query;

  if (!usuario_id) {
    throw unauthorized("Usuário não identificado");
  }

  const whereClause: any = { usuario_id };
  if (tipo && ['perfil_estabelecimento', 'perfil_artista', 'banda', 'agendamento'].includes(tipo as string)) {
    whereClause.favoritavel_tipo = tipo;
  }

  const favoritos = await FavoriteModel.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });

  const estabelecimentoIds = favoritos.filter(f => f.favoritavel_tipo === 'perfil_estabelecimento').map(f => f.favoritavel_id);
  const artistaIds = favoritos.filter(f => f.favoritavel_tipo === 'perfil_artista').map(f => f.favoritavel_id);
  const bandaIds = favoritos.filter(f => f.favoritavel_tipo === 'banda').map(f => f.favoritavel_id);
  const agendamentoIds = favoritos.filter(f => f.favoritavel_tipo === 'agendamento').map(f => f.favoritavel_id);

  const [estabelecimentos, artistas, bandas, agendamentos] = await Promise.all([
    estabelecimentoIds.length > 0
      ? EstablishmentProfileModel.findAll({ where: { id: { [Op.in]: estabelecimentoIds } } })
      : [],
    artistaIds.length > 0
      ? ArtistProfileModel.findAll({ where: { id: { [Op.in]: artistaIds } } })
      : [],
    bandaIds.length > 0
      ? BandModel.findAll({ where: { id: { [Op.in]: bandaIds } } })
      : [],
    agendamentoIds.length > 0
      ? BookingModel.findAll({ where: { id: { [Op.in]: agendamentoIds } } })
      : [],
  ]);

  const detalhesMap = new Map<string, any>();
  (estabelecimentos as any[]).forEach(e => detalhesMap.set(`perfil_estabelecimento:${e.id}`, e));
  (artistas as any[]).forEach(a => detalhesMap.set(`perfil_artista:${a.id}`, a));
  (bandas as any[]).forEach(b => detalhesMap.set(`banda:${b.id}`, b));
  (agendamentos as any[]).forEach(a => detalhesMap.set(`agendamento:${a.id}`, a));

  const favoritosComDetalhes = favoritos.map(favorito => ({
    id: favorito.id,
    tipo: favorito.favoritavel_tipo,
    data_criacao: (favorito as any).createdAt,
    item: detalhesMap.get(`${favorito.favoritavel_tipo}:${favorito.favoritavel_id}`) || null,
  }));

  res.json({
    message: "Lista de favoritos recuperada com sucesso",
    total: favoritosComDetalhes.length,
    favoritos: favoritosComDetalhes
  });
});

export const checkFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;
  const { favoritavel_tipo, favoritavel_id } = req.params;

  if (!usuario_id) {
    throw unauthorized("Usuário não identificado");
  }

  const favorito = await FavoriteModel.findOne({
    where: { usuario_id, favoritavel_tipo, favoritavel_id }
  });

  res.json({
    eh_favorito: !!favorito,
    tipo: favoritavel_tipo,
    item_id: Number(favoritavel_id)
  });
});
