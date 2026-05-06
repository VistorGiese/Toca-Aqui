process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/FavoriteModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../models/BandModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findAll: jest.fn() },
}));

jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return { ...actual, Op: actual.Op };
});

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} from '../controllers/FavoriteController';
import FavoriteModel from '../models/FavoriteModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

describe('FavoriteController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── addFavorite ──────────────────────────────────────────────────────────
  describe('addFavorite', () => {
    it('adiciona favorito e retorna 201', async () => {
      const favorito = { id: 1, usuario_id: 1, favoritavel_tipo: 'perfil_estabelecimento', favoritavel_id: 10 };
      const req = makeReq({
        user: { id: 1 },
        body: { favoritavel_tipo: 'perfil_estabelecimento', favoritavel_id: 10 },
      });
      const res = mockRes();

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 10 });
      (FavoriteModel.findOne as jest.Mock).mockResolvedValue(null);
      (FavoriteModel.create as jest.Mock).mockResolvedValue(favorito);

      addFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ favorito })
      );
    });

    it('passa erro 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: { favoritavel_tipo: 'banda', favoritavel_id: 1 } });
      const res = mockRes();

      addFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('passa erro 400 quando campos obrigatórios faltam', async () => {
      const req = makeReq({ user: { id: 1 }, body: {} });
      const res = mockRes();

      addFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa erro 400 quando tipo inválido', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { favoritavel_tipo: 'tipo_invalido', favoritavel_id: 1 },
      });
      const res = mockRes();

      addFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa erro 404 quando item não existe', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { favoritavel_tipo: 'perfil_estabelecimento', favoritavel_id: 999 },
      });
      const res = mockRes();

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      addFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('passa erro 400 quando já é favorito', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { favoritavel_tipo: 'perfil_estabelecimento', favoritavel_id: 10 },
      });
      const res = mockRes();

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 10 });
      (FavoriteModel.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      addFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── removeFavorite ───────────────────────────────────────────────────────
  describe('removeFavorite', () => {
    it('remove favorito com sucesso', async () => {
      const favorito = { id: 1, destroy: jest.fn().mockResolvedValue(undefined) };
      const req = makeReq({
        user: { id: 1 },
        params: { favoritavel_tipo: 'banda', favoritavel_id: '5' },
      });
      const res = mockRes();

      (FavoriteModel.findOne as jest.Mock).mockResolvedValue(favorito);

      removeFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(favorito.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Item removido dos favoritos com sucesso' });
    });

    it('passa erro 404 quando não é favorito', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { favoritavel_tipo: 'banda', favoritavel_id: '5' },
      });
      const res = mockRes();

      (FavoriteModel.findOne as jest.Mock).mockResolvedValue(null);

      removeFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── getFavorites ─────────────────────────────────────────────────────────
  describe('getFavorites', () => {
    it('retorna favoritos do usuário', async () => {
      const req = makeReq({ user: { id: 1 }, query: {} });
      const res = mockRes();

      (FavoriteModel.findAll as jest.Mock).mockResolvedValue([]);

      getFavorites(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ favoritos: expect.any(Array), total: 0 })
      );
    });

    it('passa erro 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, query: {} });
      const res = mockRes();

      getFavorites(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── checkFavorite ────────────────────────────────────────────────────────
  describe('checkFavorite', () => {
    it('retorna true quando é favorito', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { favoritavel_tipo: 'banda', favoritavel_id: '5' },
      });
      const res = mockRes();

      (FavoriteModel.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      checkFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ eh_favorito: true })
      );
    });

    it('retorna false quando não é favorito', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { favoritavel_tipo: 'banda', favoritavel_id: '5' },
      });
      const res = mockRes();

      (FavoriteModel.findOne as jest.Mock).mockResolvedValue(null);

      checkFavorite(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ eh_favorito: false })
      );
    });
  });
});
