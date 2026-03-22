process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: {
    findAndCountAll: jest.fn(),
    count: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  UserRole: {
    ADMIN: 'admin',
    ARTIST: 'artist',
    ESTABLISHMENT_OWNER: 'establishment_owner',
    COMMON_USER: 'common_user',
  },
}));

jest.mock('../models/BandModel', () => ({
  __esModule: true,
  default: { count: jest.fn() },
}));

jest.mock('../models/BookingModel', () => ({
  __esModule: true,
  default: {
    count: jest.fn(),
    findAll: jest.fn(),
    sequelize: { fn: jest.fn(), col: jest.fn(), literal: jest.fn() },
  },
}));

jest.mock('../models/BandApplicationModel', () => ({
  __esModule: true,
  default: {
    count: jest.fn(),
    findAll: jest.fn(),
    sequelize: { fn: jest.fn(), col: jest.fn(), literal: jest.fn() },
  },
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { count: jest.fn() },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { count: jest.fn(), findByPk: jest.fn() },
}));

jest.mock('../models/BandMemberModel', () => ({
  __esModule: true,
  default: { count: jest.fn() },
}));

jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return { ...actual, Op: actual.Op };
});

import { Request, Response, NextFunction } from 'express';
import {
  getAllUsers,
  getUserStatistics,
  getEventStatistics,
  getBandStatistics,
  getDashboardMetrics,
  getUserById,
  getEventsByEstablishment,
} from '../controllers/AdminController';
import UserModel from '../models/UserModel';
import BandModel from '../models/BandModel';
import BookingModel from '../models/BookingModel';
import BandApplicationModel from '../models/BandApplicationModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({ params: {}, query: {}, body: {}, ...overrides } as Request);

describe('AdminController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── getAllUsers ───────────────────────────────────────────────────────────
  describe('getAllUsers', () => {
    it('retorna lista paginada de usuários', async () => {
      const req = makeReq({ query: {} });
      const res = mockRes();

      (UserModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 10,
        rows: [{ id: 1, nome: 'Teste' }],
      });

      getAllUsers(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({ total: 10 }),
          users: expect.any(Array),
        })
      );
    });

    it('passa AppError 400 quando role inválida', async () => {
      const req = makeReq({ query: { role: 'superadmin' } });
      const res = mockRes();

      getAllUsers(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 400 quando search muito longo', async () => {
      const req = makeReq({ query: { search: 'a'.repeat(101) } });
      const res = mockRes();

      getAllUsers(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('filtra por role quando fornecida', async () => {
      const req = makeReq({ query: { role: 'artist' } });
      const res = mockRes();

      (UserModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });

      getAllUsers(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(UserModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'artist' }),
        })
      );
    });
  });

  // ─── getUserStatistics ────────────────────────────────────────────────────
  describe('getUserStatistics', () => {
    it('retorna estatísticas de usuários', async () => {
      const req = makeReq();
      const res = mockRes();

      (UserModel.count as jest.Mock).mockResolvedValue(100);
      (ArtistProfileModel.count as jest.Mock).mockResolvedValue(30);
      (EstablishmentProfileModel.count as jest.Mock).mockResolvedValue(20);

      getUserStatistics(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          usuarios: expect.objectContaining({
            total: 100,
          }),
        })
      );
    });
  });

  // ─── getEventStatistics ───────────────────────────────────────────────────
  describe('getEventStatistics', () => {
    it('retorna estatísticas de eventos', async () => {
      const req = makeReq();
      const res = mockRes();

      (BookingModel.count as jest.Mock).mockResolvedValue(50);
      (BookingModel.findAll as jest.Mock).mockResolvedValue([]);

      getEventStatistics(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          eventos: expect.objectContaining({
            total: 50,
          }),
        })
      );
    });
  });

  // ─── getBandStatistics ────────────────────────────────────────────────────
  describe('getBandStatistics', () => {
    it('retorna estatísticas de bandas', async () => {
      const req = makeReq();
      const res = mockRes();

      (BandModel.count as jest.Mock).mockResolvedValue(25);
      (BandApplicationModel.count as jest.Mock).mockResolvedValue(100);
      (BandApplicationModel.findAll as jest.Mock).mockResolvedValue([]);

      getBandStatistics(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          bandas: expect.objectContaining({ total: 25 }),
        })
      );
    });
  });

  // ─── getDashboardMetrics ──────────────────────────────────────────────────
  describe('getDashboardMetrics', () => {
    it('retorna métricas do dashboard', async () => {
      const req = makeReq();
      const res = mockRes();

      (UserModel.count as jest.Mock).mockResolvedValue(100);
      (BandModel.count as jest.Mock).mockResolvedValue(25);
      (BookingModel.count as jest.Mock).mockResolvedValue(50);
      (BandApplicationModel.count as jest.Mock).mockResolvedValue(80);
      (UserModel.findAll as jest.Mock).mockResolvedValue([]);
      (BookingModel.findAll as jest.Mock).mockResolvedValue([]);

      getDashboardMetrics(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          resumo: expect.objectContaining({
            totalUsuarios: 100,
            totalBandas: 25,
          }),
        })
      );
    });
  });

  // ─── getUserById ──────────────────────────────────────────────────────────
  describe('getUserById', () => {
    it('retorna usuário com estatísticas', async () => {
      const user = { id: 1, nome: 'Teste' };
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(user);
      (BandMemberModel.count as jest.Mock).mockResolvedValue(2);
      (BookingModel.count as jest.Mock).mockResolvedValue(5);

      getUserById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user,
          statistics: expect.objectContaining({
            bandas_que_participa: 2,
            eventos_criados: 5,
          }),
        })
      );
    });

    it('passa AppError 400 quando ID inválido', async () => {
      const req = makeReq({ params: { id: 'abc' } });
      const res = mockRes();

      getUserById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 404 quando não encontrado', async () => {
      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      getUserById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── getEventsByEstablishment ─────────────────────────────────────────────
  describe('getEventsByEstablishment', () => {
    it('retorna eventos do estabelecimento', async () => {
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        nome_estabelecimento: 'Bar',
      });
      (BookingModel.findAll as jest.Mock).mockResolvedValue([]);

      getEventsByEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          estabelecimento_id: 1,
          nome_estabelecimento: 'Bar',
        })
      );
    });

    it('passa AppError 400 quando ID inválido', async () => {
      const req = makeReq({ params: { id: 'abc' } });
      const res = mockRes();

      getEventsByEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 404 quando estabelecimento não encontrado', async () => {
      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      getEventsByEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });
});
