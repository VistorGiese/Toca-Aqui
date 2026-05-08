process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../services/ShowService', () => ({
  showService: {
    getPublicShows: jest.fn(),
    getShowById: jest.fn(),
    getShowsDestaque: jest.fn(),
    searchShows: jest.fn(),
  },
}));

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { getPublicShows, getShowById, getShowsDestaque, searchShows } from '../controllers/ShowController';
import { showService } from '../services/ShowService';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

describe('ShowController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── getPublicShows ───────────────────────────────────────────────────────
  describe('getPublicShows', () => {
    it('retorna lista de shows com sucesso', async () => {
      const resultado = { shows: [{ id: 1 }, { id: 2 }], total: 2, page: 1 };
      const req = makeReq({ query: {} });
      const res = mockRes();

      (showService.getPublicShows as jest.Mock).mockResolvedValue(resultado);

      getPublicShows(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.getPublicShows).toHaveBeenCalledWith(
        expect.objectContaining({ esta_semana: false, fim_de_semana: false, esta_hoje: false })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Shows listados com sucesso' })
      );
    });

    it('passa filtros de cidade e gênero ao service', async () => {
      const req = makeReq({ query: { cidade: 'Campo Mourão', genero: 'rock' } });
      const res = mockRes();

      (showService.getPublicShows as jest.Mock).mockResolvedValue({ shows: [], total: 0 });

      getPublicShows(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.getPublicShows).toHaveBeenCalledWith(
        expect.objectContaining({ cidade: 'Campo Mourão', genero: 'rock' })
      );
    });

    it('converte flags boolean corretamente', async () => {
      const req = makeReq({ query: { esta_semana: 'true', fim_de_semana: 'false', esta_hoje: 'true' } });
      const res = mockRes();

      (showService.getPublicShows as jest.Mock).mockResolvedValue({ shows: [] });

      getPublicShows(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.getPublicShows).toHaveBeenCalledWith(
        expect.objectContaining({ esta_semana: true, fim_de_semana: false, esta_hoje: true })
      );
    });

    it('passa page e limit ao service quando fornecidos', async () => {
      const req = makeReq({ query: { page: '2', limit: '10' } });
      const res = mockRes();

      (showService.getPublicShows as jest.Mock).mockResolvedValue({ shows: [] });

      getPublicShows(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.getPublicShows).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 10 })
      );
    });
  });

  // ─── getShowById ──────────────────────────────────────────────────────────
  describe('getShowById', () => {
    it('retorna show pelo id', async () => {
      const show = { id: 1, titulo_evento: 'Show de Rock' };
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (showService.getShowById as jest.Mock).mockResolvedValue(show);

      getShowById(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.getShowById).toHaveBeenCalledWith(1, undefined);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Show encontrado com sucesso', show })
      );
    });

    it('passa usuario_id ao service quando autenticado', async () => {
      const req = makeReq({ params: { id: '1' }, user: { id: 42 } });
      const res = mockRes();

      (showService.getShowById as jest.Mock).mockResolvedValue({ id: 1 });

      getShowById(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.getShowById).toHaveBeenCalledWith(1, 42);
    });

    it('passa erro ao next quando show não encontrado', async () => {
      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      (showService.getShowById as jest.Mock).mockRejectedValue({ statusCode: 404, message: 'Show não encontrado' });

      getShowById(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });

  // ─── getShowsDestaque ─────────────────────────────────────────────────────
  describe('getShowsDestaque', () => {
    it('retorna shows em destaque', async () => {
      const shows = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const req = makeReq({ query: {} });
      const res = mockRes();

      (showService.getShowsDestaque as jest.Mock).mockResolvedValue(shows);

      getShowsDestaque(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.getShowsDestaque).toHaveBeenCalledWith(undefined);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Shows em destaque listados com sucesso', shows })
      );
    });

    it('passa limit ao service quando fornecido', async () => {
      const req = makeReq({ query: { limit: '5' } });
      const res = mockRes();

      (showService.getShowsDestaque as jest.Mock).mockResolvedValue([]);

      getShowsDestaque(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.getShowsDestaque).toHaveBeenCalledWith(5);
    });
  });

  // ─── searchShows ──────────────────────────────────────────────────────────
  describe('searchShows', () => {
    it('retorna resultados da busca com sucesso', async () => {
      const resultado = { shows: [{ id: 1 }], artistas: [], locais: [] };
      const req = makeReq({ query: { q: 'rock' } });
      const res = mockRes();

      (showService.searchShows as jest.Mock).mockResolvedValue(resultado);

      searchShows(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.searchShows).toHaveBeenCalledWith('rock', undefined);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Busca realizada com sucesso' })
      );
    });

    it('passa tipo ao service quando fornecido', async () => {
      const req = makeReq({ query: { q: 'samba', tipo: 'artistas' } });
      const res = mockRes();

      (showService.searchShows as jest.Mock).mockResolvedValue({ artistas: [] });

      searchShows(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(showService.searchShows).toHaveBeenCalledWith('samba', 'artistas');
    });

    it('retorna 400 quando q não fornecido', async () => {
      const req = makeReq({ query: {} });
      const res = mockRes();

      searchShows(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Parâmetro de busca obrigatório' });
    });

    it('retorna 400 quando q é string vazia', async () => {
      const req = makeReq({ query: { q: '   ' } });
      const res = mockRes();

      searchShows(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
