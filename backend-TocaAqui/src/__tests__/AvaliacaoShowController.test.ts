process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../services/AvaliacaoShowService', () => ({
  avaliacaoShowService: {
    criarAvaliacao: jest.fn(),
    getAvaliacoesByShow: jest.fn(),
  },
}));

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { criarAvaliacao, getAvaliacoesByShow } from '../controllers/AvaliacaoShowController';
import { avaliacaoShowService } from '../services/AvaliacaoShowService';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

describe('AvaliacaoShowController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── criarAvaliacao ───────────────────────────────────────────────────────
  describe('criarAvaliacao', () => {
    it('cria avaliação e retorna 201', async () => {
      const avaliacao = { id: 1, nota_artista: 5, nota_local: 4 };
      const req = makeReq({
        user: { id: 1 },
        body: { agendamento_id: 10, nota_artista: 5, nota_local: 4, comentario: 'Ótimo show!' },
      });
      const res = mockRes();

      (avaliacaoShowService.criarAvaliacao as jest.Mock).mockResolvedValue(avaliacao);

      criarAvaliacao(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(avaliacaoShowService.criarAvaliacao).toHaveBeenCalledWith(
        expect.objectContaining({ usuario_id: 1, agendamento_id: 10, nota_artista: 5 })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Avaliação registrada com sucesso', avaliacao })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: {} });
      const res = mockRes();

      criarAvaliacao(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('passa erro do service ao next', async () => {
      const req = makeReq({ user: { id: 1 }, body: { agendamento_id: 10, nota_artista: 5 } });
      const res = mockRes();

      (avaliacaoShowService.criarAvaliacao as jest.Mock).mockRejectedValue({ statusCode: 400, message: 'Já avaliado' });

      criarAvaliacao(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

  // ─── getAvaliacoesByShow ──────────────────────────────────────────────────
  describe('getAvaliacoesByShow', () => {
    it('retorna avaliações do show', async () => {
      const resultado = { avaliacoes: [{ id: 1, nota_artista: 5 }], media_artista: 5, media_local: 4 };
      const req = makeReq({ params: { agendamentoId: '10' } });
      const res = mockRes();

      (avaliacaoShowService.getAvaliacoesByShow as jest.Mock).mockResolvedValue(resultado);

      getAvaliacoesByShow(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(avaliacaoShowService.getAvaliacoesByShow).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Avaliações listadas com sucesso' })
      );
    });

    it('retorna lista vazia quando não há avaliações', async () => {
      const resultado = { avaliacoes: [], media_artista: null, media_local: null };
      const req = makeReq({ params: { agendamentoId: '99' } });
      const res = mockRes();

      (avaliacaoShowService.getAvaliacoesByShow as jest.Mock).mockResolvedValue(resultado);

      getAvaliacoesByShow(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ avaliacoes: [] })
      );
    });
  });
});
