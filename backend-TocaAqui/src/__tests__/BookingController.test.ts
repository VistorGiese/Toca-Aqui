process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/BookingModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  BookingStatus: {
    PENDENTE: 'pendente',
    ACEITO: 'aceito',
    REJEITADO: 'rejeitado',
    CANCELADO: 'cancelado',
    REALIZADO: 'realizado',
  },
}));

jest.mock('../models/BandApplicationModel', () => ({
  __esModule: true,
  default: { count: jest.fn() },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), findByPk: jest.fn() },
}));

jest.mock('../models/EstablishmentMemberModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));

jest.mock('../config/database', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    invalidate: jest.fn().mockResolvedValue(undefined),
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(false),
  },
}));

// Garante que Op do Sequelize não tente conectar ao banco
jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return {
    ...actual,
    Op: actual.Op,
  };
});

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getByProximidade,
} from '../controllers/BookingController';
import BookingModel from '../models/BookingModel';
import BandApplicationModel from '../models/BandApplicationModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import EstablishmentMemberModel from '../models/EstablishmentMemberModel';
import redisService from '../config/redis';
import sequelizeDb from '../config/database';

// asyncHandler retorna void — a promise interna é criada via Promise.resolve().catch(next).
// Para aguardá-la nos testes precisamos drenar a fila de microtasks.
const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

const makeBooking = (overrides = {}) => {
  const data = {
    id: 1,
    titulo_evento: 'Show de Rock',
    data_show: '2026-06-15',
    perfil_estabelecimento_id: 2,
    horario_inicio: '20:00',
    horario_fim: '23:00',
    status: 'pendente',
    EstablishmentProfile: { nome_estabelecimento: 'Bar Teste' },
    ...overrides,
  };
  return {
    ...data,
    update: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    toJSON: jest.fn().mockReturnValue(data),
  };
};

describe('BookingController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── createBooking ────────────────────────────────────────────────────────
  describe('createBooking', () => {
    it('cria booking e retorna 201 quando não há conflito de horário', async () => {
      const booking = makeBooking();
      const req = makeReq({
        user: { id: 1 },
        body: {
          titulo_evento: 'Show de Rock',
          data_show: '2026-06-15',
          horario_inicio: '20:00',
          horario_fim: '23:00',
        },
      });
      const res = mockRes();

      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue({ id: 2, usuario_id: 1 });
      (BookingModel.findOne as jest.Mock).mockResolvedValue(null);
      (BookingModel.create as jest.Mock).mockResolvedValue(booking);

      createBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(booking);
    });

    it('passa AppError 400 ao next quando há conflito de horário', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: {
          titulo_evento: 'Conflito',
          data_show: '2026-06-15',
          horario_inicio: '20:00',
          horario_fim: '23:00',
        },
      });
      const res = mockRes();

      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue({ id: 2, usuario_id: 1 });
      (BookingModel.findOne as jest.Mock).mockResolvedValue(makeBooking());

      createBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 401 ao next quando usuário não está identificado', async () => {
      const req = makeReq({ user: undefined });
      const res = mockRes();

      createBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('passa AppError 403 quando usuário não tem perfil de estabelecimento nem é membro', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { titulo_evento: 'Sem Estab', data_show: '2026-06-15', horario_inicio: '20:00', horario_fim: '23:00' },
      });
      const res = mockRes();

      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue(null);
      (EstablishmentMemberModel.findOne as jest.Mock).mockResolvedValue(null);

      createBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  // ─── getBookings ──────────────────────────────────────────────────────────
  describe('getBookings', () => {
    it('retorna lista paginada e salva no cache', async () => {
      const req = makeReq({ query: {} });
      const res = mockRes();

      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (BookingModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: [makeBooking(), makeBooking({ id: 2 })],
      });

      getBookings(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          pagination: expect.objectContaining({ total: 2, page: 1 }),
        })
      );
      expect(redisService.set).toHaveBeenCalled();
    });

    it('retorna dados do cache quando disponível', async () => {
      const req = makeReq({ query: {} });
      const res = mockRes();
      const cachedPayload = { data: [], pagination: {} };

      (redisService.get as jest.Mock).mockResolvedValueOnce(cachedPayload);

      getBookings(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(cachedPayload);
      expect(BookingModel.findAndCountAll).not.toHaveBeenCalled();
    });

    it('passa AppError 404 quando estabelecimento_id não encontrado', async () => {
      // redisService.get NÃO é chamado — o check de estabelecimento lança antes
      const req = makeReq({ user: { id: 1 }, query: { estabelecimento_id: '999' } });
      const res = mockRes();

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      getBookings(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('passa AppError 403 quando usuário não é dono nem membro do estabelecimento', async () => {
      // redisService.get NÃO é chamado — o check de estabelecimento lança antes
      const req = makeReq({ user: { id: 99 }, query: { estabelecimento_id: '2' } });
      const res = mockRes();

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 2, usuario_id: 10 });
      (EstablishmentMemberModel.findOne as jest.Mock).mockResolvedValue(null);

      getBookings(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('clamps limit a 100 quando valor maior é fornecido', async () => {
      const req = makeReq({ query: { limit: '9999' } });
      const res = mockRes();

      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (BookingModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });

      getBookings(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(BookingModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });
  });

  // ─── getBookingById ───────────────────────────────────────────────────────
  describe('getBookingById', () => {
    it('retorna booking pelo id', async () => {
      const booking = makeBooking();
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(booking);

      getBookingById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(booking);
    });

    it('passa AppError 404 ao next quando booking não existe', async () => {
      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(null);

      getBookingById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('retorna dados do cache quando disponível', async () => {
      const cached = makeBooking();
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (redisService.get as jest.Mock).mockResolvedValueOnce(cached);

      getBookingById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(cached);
      expect(BookingModel.findByPk).not.toHaveBeenCalled();
    });
  });

  // ─── updateBooking ────────────────────────────────────────────────────────
  describe('updateBooking', () => {
    it('atualiza booking quando não há candidaturas', async () => {
      const booking = makeBooking();
      const req = makeReq({ user: { id: 1 }, params: { id: '1' }, body: { titulo_evento: 'Novo Nome' } });
      const res = mockRes();

      (BookingModel.findByPk as jest.Mock).mockResolvedValue(booking);
      (BandApplicationModel.count as jest.Mock).mockResolvedValue(0);

      updateBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(booking.update).toHaveBeenCalledWith({ titulo_evento: 'Novo Nome' });
      expect(res.json).toHaveBeenCalledWith(booking);
    });

    it('passa AppError 400 ao next quando existem candidaturas', async () => {
      const booking = makeBooking();
      const req = makeReq({ user: { id: 1 }, params: { id: '1' }, body: {} });
      const res = mockRes();

      (BookingModel.findByPk as jest.Mock).mockResolvedValue(booking);
      (BandApplicationModel.count as jest.Mock).mockResolvedValue(3);

      updateBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 404 ao next quando booking não existe', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '999' }, body: {} });
      const res = mockRes();

      (BookingModel.findByPk as jest.Mock).mockResolvedValue(null);

      updateBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('passa AppError 401 ao next quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '1' }, body: {} });
      const res = mockRes();

      updateBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('atualiza múltiplos campos do booking', async () => {
      const booking = makeBooking();
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: {
          titulo_evento: 'Show Atualizado',
          data_show: '2026-07-20',
          horario_inicio: '21:00',
          horario_fim: '00:00',
        },
      });
      const res = mockRes();

      (BookingModel.findByPk as jest.Mock).mockResolvedValue(booking);
      (BandApplicationModel.count as jest.Mock).mockResolvedValue(0);

      updateBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(booking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo_evento: 'Show Atualizado',
          data_show: '2026-07-20',
          horario_inicio: '21:00',
          horario_fim: '00:00',
        })
      );
    });
  });

  // ─── deleteBooking ────────────────────────────────────────────────────────
  describe('deleteBooking', () => {
    it('deleta booking quando não há candidaturas', async () => {
      const booking = makeBooking();
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (BookingModel.findByPk as jest.Mock).mockResolvedValue(booking);
      (BandApplicationModel.count as jest.Mock).mockResolvedValue(0);

      deleteBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(booking.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Agendamento removido com sucesso' });
    });

    it('passa AppError 400 ao next quando existem candidaturas', async () => {
      const booking = makeBooking();
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (BookingModel.findByPk as jest.Mock).mockResolvedValue(booking);
      (BandApplicationModel.count as jest.Mock).mockResolvedValue(2);

      deleteBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
      expect(booking.destroy).not.toHaveBeenCalled();
    });

    it('passa AppError 404 ao next quando booking não existe', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '999' } });
      const res = mockRes();

      (BookingModel.findByPk as jest.Mock).mockResolvedValue(null);

      deleteBooking(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── getByProximidade ─────────────────────────────────────────────────────
  describe('getByProximidade', () => {
    it('retorna shows próximos quando lat e lng são fornecidos', async () => {
      const results = [{ id: 1, titulo_evento: 'Show Próximo', distancia_km: 3.5 }];
      const req = makeReq({ query: { lat: '-23.5', lng: '-46.6', raio: '10' } });
      const res = mockRes();

      (sequelizeDb.query as jest.Mock).mockResolvedValue(results);

      getByProximidade(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(sequelizeDb.query).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ data: results, total: 1 });
    });

    it('usa raio padrão de 50km quando raio não é fornecido', async () => {
      const req = makeReq({ query: { lat: '-23.5', lng: '-46.6' } });
      const res = mockRes();

      (sequelizeDb.query as jest.Mock).mockResolvedValue([]);

      getByProximidade(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(sequelizeDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ replacements: expect.objectContaining({ raioKm: 50 }) })
      );
    });

    it('passa AppError 400 quando lat ou lng faltam', async () => {
      const req = makeReq({ query: { lat: '-23.5' } });
      const res = mockRes();

      getByProximidade(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 400 quando lat ou lng não são números válidos', async () => {
      const req = makeReq({ query: { lat: 'invalido', lng: '-46.6' } });
      const res = mockRes();

      getByProximidade(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });
});
