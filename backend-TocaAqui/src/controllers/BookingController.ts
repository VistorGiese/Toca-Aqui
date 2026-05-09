import { Request, Response } from "express";
import { Op, QueryTypes } from "sequelize";
import BookingModel, { BookingStatus } from "../models/BookingModel";
import BandApplicationModel from "../models/BandApplicationModel";
import EstablishmentProfileModel from "../models/EstablishmentProfileModel";
import EstablishmentMemberModel from "../models/EstablishmentMemberModel";
import redisService from "../config/redis";
import { CACHE_TTL, CACHE_KEYS } from "../config/cache";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../errors/AppError";
import sequelize from "../config/database";
import { AuthRequest } from '../middleware/authmiddleware';

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const { titulo_evento, descricao_evento, data_show, horario_inicio, horario_fim, generos_musicais, genero_musical, esta_publico, preco_ingresso_inteira, preco_ingresso_meia, capacidade_maxima, classificacao_etaria, perfil_estabelecimento_id } = req.body;

  // Validar que o usuário logado é dono ou membro do estabelecimento informado
  const perfil = await EstablishmentProfileModel.findByPk(perfil_estabelecimento_id);
  if (!perfil) throw new AppError('Estabelecimento não encontrado', 404);

  const isDono = perfil.usuario_id === req.user.id;
  if (!isDono) {
    const membro = await EstablishmentMemberModel.findOne({
      where: { estabelecimento_id: perfil_estabelecimento_id, usuario_id: req.user.id },
    });
    if (!membro) throw new AppError('Acesso negado: este estabelecimento não pertence ao usuário logado', 403);
  }

  const conflito = await BookingModel.findOne({
    where: {
      perfil_estabelecimento_id,
      data_show,
      [Op.or]: [
        {
          horario_inicio: { [Op.lt]: horario_fim },
          horario_fim: { [Op.gt]: horario_inicio }
        }
      ]
    }
  });
  if (conflito) {
    throw new AppError("Já existe evento para este estabelecimento neste horário e dia.", 400);
  }
  const booking = await BookingModel.create({
    titulo_evento,
    descricao_evento,
    data_show,
    perfil_estabelecimento_id,
    horario_inicio,
    horario_fim,
    status: BookingStatus.PENDENTE,
    genero_musical: genero_musical ?? generos_musicais ?? undefined,
    esta_publico: esta_publico ?? undefined,
    preco_ingresso_inteira: preco_ingresso_inteira ?? undefined,
    preco_ingresso_meia: preco_ingresso_meia ?? undefined,
    capacidade_maxima: capacidade_maxima ?? undefined,
    classificacao_etaria: classificacao_etaria ?? undefined,
  });

  await redisService.invalidatePattern('agendamentos:*');

  res.status(201).json(booking);
});

export const getBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const { data_inicio, data_fim, status, estabelecimento_id } = req.query as Record<string, string>;

  // Se filtrou por estabelecimento, verificar que o usuário logado é dono ou membro
  if (estabelecimento_id && req.user?.id) {
    const perfil = await EstablishmentProfileModel.findByPk(estabelecimento_id);
    if (!perfil) throw new AppError('Estabelecimento não encontrado', 404);

    const isDono = perfil.usuario_id === req.user.id;
    if (!isDono) {
      const membro = await EstablishmentMemberModel.findOne({
        where: { estabelecimento_id, usuario_id: req.user.id },
      });
      if (!membro) throw new AppError('Acesso negado: este estabelecimento não pertence ao usuário logado', 403);
    }
  }

  const where: any = {};
  if (data_inicio && data_fim) where.data_show = { [Op.between]: [data_inicio, data_fim] };
  else if (data_inicio)        where.data_show = { [Op.gte]: data_inicio };
  else if (data_fim)           where.data_show = { [Op.lte]: data_fim };
  if (status)           where.status = status;
  if (estabelecimento_id) where.perfil_estabelecimento_id = estabelecimento_id;

  const sortedParams = Object.entries(req.query)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(':');
  const cacheKey = CACHE_KEYS.agendamentos(sortedParams || 'all');

  const cachedData = await redisService.get<any>(cacheKey);
  if (cachedData) {
    console.log(`[CACHE HIT] ${cacheKey}`);
    return res.json(cachedData);
  }
  console.log(`[CACHE MISS] ${cacheKey}`);

  const { count, rows } = await BookingModel.findAndCountAll({
    where,
    include: [{
      model: EstablishmentProfileModel,
      as: 'EstablishmentProfile',
      attributes: ['id', 'nome_estabelecimento'],
    }],
    order: [['data_show', 'DESC']],
    limit,
    offset,
  });

  const mappedRows = rows.map((row: any) => ({
    ...row.toJSON(),
    nome_estabelecimento: row.EstablishmentProfile?.nome_estabelecimento ?? null,
  }));

  const payload = {
    data: mappedRows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };

  await redisService.set(cacheKey, payload, CACHE_TTL.MEDIUM);
  res.json(payload);
});

export const getBookingById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const cacheKey = CACHE_KEYS.agendamento(id);

  const cachedData = await redisService.get<any>(cacheKey);
  if (cachedData) {
    console.log(`[CACHE HIT] ${cacheKey}`);
    return res.json(cachedData);
  }
  console.log(`[CACHE MISS] ${cacheKey}`);

  const booking = await BookingModel.findByPk(id);
  if (!booking) throw new AppError("Agendamento não encontrado", 404);

  await redisService.set(cacheKey, booking, CACHE_TTL.MEDIUM);
  res.json(booking);
});

export const updateBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const id = req.params.id as string;
  const booking = await BookingModel.findByPk(id);
  if (!booking) throw new AppError("Agendamento não encontrado", 404);

  const candidaturas = await BandApplicationModel.count({ where: { evento_id: booking.id } });
  if (candidaturas > 0) {
    throw new AppError("Não é possível editar: já existem candidaturas para este evento.", 400);
  }

  await booking.update(req.body);

  await redisService.invalidate(CACHE_KEYS.agendamento(id));
  await redisService.invalidatePattern('agendamentos:*');

  res.json(booking);
});

export const deleteBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const id = req.params.id as string;
  const booking = await BookingModel.findByPk(id);
  if (!booking) throw new AppError("Agendamento não encontrado", 404);

  const candidaturas = await BandApplicationModel.count({ where: { evento_id: booking.id } });
  if (candidaturas > 0) {
    throw new AppError("Não é possível remover: já existem candidaturas para este evento.", 400);
  }

  await booking.destroy();

  await redisService.invalidate(CACHE_KEYS.agendamento(id));
  await redisService.invalidatePattern('agendamentos:*');

  res.json({ message: "Agendamento removido com sucesso" });
});

export const getMeusAgendamentos = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  // Busca todos os estabelecimentos onde o usuário é dono ou membro
  const perfilDono = await EstablishmentProfileModel.findAll({
    where: { usuario_id: req.user.id },
    attributes: ['id'],
  });

  const membroEm = await EstablishmentMemberModel.findAll({
    where: { usuario_id: req.user.id },
    attributes: ['estabelecimento_id'],
  });

  const ids = [
    ...perfilDono.map((p) => p.id),
    ...membroEm.map((m) => m.estabelecimento_id),
  ];

  if (ids.length === 0) throw new AppError('Nenhum estabelecimento encontrado para este usuário', 403);

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const { status } = req.query as Record<string, string>;
  const where: any = { perfil_estabelecimento_id: { [Op.in]: ids } };
  if (status) where.status = status;

  const { count, rows } = await BookingModel.findAndCountAll({
    where,
    include: [{
      model: EstablishmentProfileModel,
      as: 'EstablishmentProfile',
      attributes: ['id', 'nome_estabelecimento'],
    }],
    order: [['data_show', 'DESC']],
    limit,
    offset,
  });

  const mappedRows = rows.map((row: any) => ({
    ...row.toJSON(),
    nome_estabelecimento: row.EstablishmentProfile?.nome_estabelecimento ?? null,
  }));

  res.json({
    data: mappedRows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});

export const getByProximidade = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, raio } = req.query;

  if (!lat || !lng) {
    throw new AppError('Os parâmetros lat e lng são obrigatórios', 400);
  }

  const userLat = parseFloat(lat as string);
  const userLng = parseFloat(lng as string);
  const raioKm = parseFloat((raio as string) || '50');

  if (isNaN(userLat) || isNaN(userLng)) {
    throw new AppError('lat e lng devem ser números válidos', 400);
  }

  const results = await sequelize.query(
    `SELECT
      a.id,
      a.titulo_evento,
      a.descricao_evento,
      a.data_show,
      a.horario_inicio,
      a.horario_fim,
      a.genero_musical,
      a.preco_ingresso_inteira,
      a.preco_ingresso_meia,
      a.classificacao_etaria,
      a.imagem_capa,
      e.id AS estabelecimento_id,
      e.nome_estabelecimento,
      e.latitude,
      e.longitude,
      (6371 * ACOS(
        COS(RADIANS(:userLat)) * COS(RADIANS(e.latitude)) *
        COS(RADIANS(e.longitude) - RADIANS(:userLng)) +
        SIN(RADIANS(:userLat)) * SIN(RADIANS(e.latitude))
      )) AS distancia_km
    FROM agendamentos a
    INNER JOIN perfis_estabelecimentos e ON a.perfil_estabelecimento_id = e.id
    WHERE a.status = 'pendente'
      AND e.latitude IS NOT NULL
      AND e.longitude IS NOT NULL
    HAVING distancia_km <= :raioKm
    ORDER BY distancia_km ASC`,
    {
      replacements: { userLat, userLng, raioKm },
      type: QueryTypes.SELECT,
    }
  );

  res.json({ data: results, total: (results as any[]).length });
});
