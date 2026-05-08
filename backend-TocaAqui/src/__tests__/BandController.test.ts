process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/BandModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../services/UploadService', () => ({
  uploadService: {
    getRelativePath: jest.fn().mockReturnValue('uploads/band.jpg'),
    deleteFile: jest.fn(),
  },
}));

jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    invalidate: jest.fn().mockResolvedValue(undefined),
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    where: jest.fn().mockReturnValue({}),
    fn: jest.fn().mockReturnValue(''),
    col: jest.fn().mockReturnValue(''),
  },
}));

jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return { ...actual, Op: actual.Op };
});

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import {
  createBand,
  getBands,
  getBandById,
  updateBand,
  deleteBand,
} from '../controllers/BandController';
import BandModel from '../models/BandModel';
import { uploadService } from '../services/UploadService';
import redisService from '../config/redis';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

const makeBand = (overrides = {}) => ({
  id: 1,
  nome_banda: 'Rock Band',
  descricao: 'Uma banda de rock',
  generos_musicais: ['rock'],
  imagem: null,
  update: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('BandController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── createBand ───────────────────────────────────────────────────────────
  describe('createBand', () => {
    it('cria banda e retorna 201', async () => {
      const band = makeBand();
      const req = makeReq({
        user: { id: 1 },
        body: { nome_banda: 'Rock Band', descricao: 'Uma banda', generos_musicais: ['rock'] },
      });
      const res = mockRes();

      (BandModel.findOne as jest.Mock).mockResolvedValue(null);
      (BandModel.create as jest.Mock).mockResolvedValue(band);

      createBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ banda: band })
      );
      expect(redisService.invalidatePattern).toHaveBeenCalledWith('bandas:*');
    });

    it('passa AppError 400 quando nome já existe', async () => {
      const existingBand = makeBand();
      const req = makeReq({
        user: { id: 1 },
        body: { nome_banda: 'Rock Band' },
      });
      const res = mockRes();

      (BandModel.findOne as jest.Mock).mockResolvedValue(existingBand);

      createBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: { nome_banda: 'Test' } });
      const res = mockRes();

      createBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('deleta imagem quando nome duplicado e há upload', async () => {
      const existingBand = makeBand();
      const req = makeReq({
        user: { id: 1 },
        body: { nome_banda: 'Rock Band' },
        file: { filename: 'test.jpg' } as any,
      } as any);
      const res = mockRes();

      (BandModel.findOne as jest.Mock).mockResolvedValue(existingBand);

      createBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(uploadService.deleteFile).toHaveBeenCalled();
    });
  });

  // ─── getBands ─────────────────────────────────────────────────────────────
  describe('getBands', () => {
    it('retorna lista paginada e salva no cache', async () => {
      const req = makeReq({ query: {} });
      const res = mockRes();

      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (BandModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: [makeBand(), makeBand({ id: 2 })],
      });

      getBands(req, res, mockNext as unknown as NextFunction);
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
      const cached = { data: [], pagination: {} };

      (redisService.get as jest.Mock).mockResolvedValueOnce(cached);

      getBands(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(cached);
      expect(BandModel.findAndCountAll).not.toHaveBeenCalled();
    });
  });

  // ─── getBandById ──────────────────────────────────────────────────────────
  describe('getBandById', () => {
    it('retorna banda pelo id', async () => {
      const band = makeBand();
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (BandModel.findByPk as jest.Mock).mockResolvedValue(band);

      getBandById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({ data: band });
      expect(redisService.set).toHaveBeenCalled();
    });

    it('passa AppError 404 quando banda não existe', async () => {
      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (BandModel.findByPk as jest.Mock).mockResolvedValue(null);

      getBandById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('retorna do cache quando disponível', async () => {
      const cached = makeBand();
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (redisService.get as jest.Mock).mockResolvedValueOnce(cached);

      getBandById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({ data: cached });
      expect(BandModel.findByPk).not.toHaveBeenCalled();
    });
  });

  // ─── updateBand ───────────────────────────────────────────────────────────
  describe('updateBand', () => {
    it('atualiza banda com sucesso', async () => {
      const band = makeBand();
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { descricao: 'Nova descrição' },
      });
      const res = mockRes();

      (BandModel.findByPk as jest.Mock).mockResolvedValue(band);

      updateBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(band.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ banda: band })
      );
      expect(redisService.invalidatePattern).toHaveBeenCalledWith('bandas:*');
    });

    it('passa AppError 404 quando banda não existe', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '999' }, body: {} });
      const res = mockRes();

      (BandModel.findByPk as jest.Mock).mockResolvedValue(null);

      updateBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '1' }, body: {} });
      const res = mockRes();

      updateBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('deleta arquivo enviado quando nome já está em uso por outra banda', async () => {
      const band = makeBand({ id: 1, nome_banda: 'Rock Band' });
      const outraBanda = makeBand({ id: 99, nome_banda: 'Novo Nome' });
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { nome_banda: 'Novo Nome' },
        file: { filename: 'upload.jpg', size: 1024, mimetype: 'image/jpeg' } as any,
      } as any);
      const res = mockRes();

      (BandModel.findByPk as jest.Mock).mockResolvedValue(band);
      (BandModel.findOne as jest.Mock).mockResolvedValue(outraBanda);

      updateBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(uploadService.deleteFile).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('deleta imagem antiga quando banda já possui imagem e novo arquivo é enviado', async () => {
      const band = makeBand({ imagem: 'uploads/old.jpg' });
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { descricao: 'Nova descrição' },
        file: { filename: 'new.jpg', size: 512, mimetype: 'image/jpeg' } as any,
      } as any);
      const res = mockRes();

      (BandModel.findByPk as jest.Mock).mockResolvedValue(band);
      (BandModel.findOne as jest.Mock).mockResolvedValue(null);

      updateBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(uploadService.deleteFile).toHaveBeenCalledWith('uploads/old.jpg');
      expect(band.update).toHaveBeenCalledWith(
        expect.objectContaining({ imagem: 'uploads/band.jpg' })
      );
    });
  });

  // ─── deleteBand ───────────────────────────────────────────────────────────
  describe('deleteBand', () => {
    it('deleta banda com sucesso', async () => {
      const band = makeBand();
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (BandModel.findByPk as jest.Mock).mockResolvedValue(band);

      deleteBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(band.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Banda removida com sucesso' });
    });

    it('deleta imagem da banda ao remover', async () => {
      const band = makeBand({ imagem: 'uploads/old.jpg' });
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (BandModel.findByPk as jest.Mock).mockResolvedValue(band);

      deleteBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(uploadService.deleteFile).toHaveBeenCalledWith('uploads/old.jpg');
    });

    it('passa AppError 404 quando banda não existe', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '999' } });
      const res = mockRes();

      (BandModel.findByPk as jest.Mock).mockResolvedValue(null);

      deleteBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });
});
