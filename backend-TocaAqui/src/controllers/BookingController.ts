import { Request, Response } from "express";
import { Op } from "sequelize";
import BookingModel, { BookingStatus } from "../models/BookingModel";
import BandApplicationModel from "../models/BandApplicationModel";
import redisService from "../config/redis";
import { CACHE_TTL, CACHE_KEYS } from "../config/cache";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../errors/AppError";
import { AuthRequest } from '../middleware/authmiddleware';

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);

  const { titulo_evento, descricao_evento, data_show, perfil_estabelecimento_id, horario_inicio, horario_fim } = req.body;
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
  });

  await redisService.invalidatePattern('agendamentos:*');

  res.status(201).json(booking);
});

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const { data_inicio, data_fim, status, estabelecimento_id } = req.query as Record<string, string>;

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
    order: [['data_show', 'DESC']],
    limit,
    offset,
  });

  const payload = {
    data: rows,
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

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
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
