import { Request, Response } from "express";
import { Op } from "sequelize";
import BookingModel, { BookingStatus } from "../models/BookingModel";
import BandApplicationModel from "../models/BandApplicationModel";
import redisService from "../config/redis";
import { CACHE_TTL, CACHE_KEYS } from "../config/cache";

export const createBooking = async (req: Request, res: Response) => {
  try {
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
      return res.status(400).json({ error: "Já existe evento para este estabelecimento neste horário e dia." });
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
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar evento", details: error });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar agendamentos", details: error });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const cacheKey = CACHE_KEYS.agendamento(id);

    const cachedData = await redisService.get<any>(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.json(cachedData);
    }
    console.log(`[CACHE MISS] ${cacheKey}`);

    const booking = await BookingModel.findByPk(id);
    if (!booking) return res.status(404).json({ error: "Agendamento não encontrado" });

    await redisService.set(cacheKey, booking, CACHE_TTL.MEDIUM);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar agendamento", details: error });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const booking = await BookingModel.findByPk(id);
    if (!booking) return res.status(404).json({ error: "Agendamento não encontrado" });

    const candidaturas = await BandApplicationModel.count({ where: { evento_id: booking.id } });
    if (candidaturas > 0) {
      return res.status(400).json({ error: "Não é possível editar: já existem candidaturas para este evento." });
    }

    await booking.update(req.body);

    await redisService.invalidate(CACHE_KEYS.agendamento(id));
    await redisService.invalidatePattern('agendamentos:*');

    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar agendamento", details: error });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const booking = await BookingModel.findByPk(id);
    if (!booking) return res.status(404).json({ error: "Agendamento não encontrado" });

    const candidaturas = await BandApplicationModel.count({ where: { evento_id: booking.id } });
    if (candidaturas > 0) {
      return res.status(400).json({ error: "Não é possível remover: já existem candidaturas para este evento." });
    }

    await booking.destroy();

    await redisService.invalidate(CACHE_KEYS.agendamento(id));
    await redisService.invalidatePattern('agendamentos:*');

    res.json({ message: "Agendamento removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover agendamento", details: error });
  }
};
