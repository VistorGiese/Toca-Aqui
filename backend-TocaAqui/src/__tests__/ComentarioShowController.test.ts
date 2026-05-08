process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../services/ComentarioShowService', () => ({
  comentarioShowService: {
    getComentariosByShow: jest.fn(),
    criarComentario: jest.fn(),
    curtirComentario: jest.fn(),
  },
}));

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { getComentarios, criarComentario, curtirComentario } from '../controllers/ComentarioShowController';
import { comentarioShowService } from '../services/ComentarioShowService';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

describe('ComentarioShowController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── getComentarios ───────────────────────────────────────────────────────
  describe('getComentarios', () => {
    it('retorna comentários do show', async () => {
      const comentarios = [{ id: 1, texto: 'Ótimo show!' }, { id: 2, texto: 'Incrível!' }];
      const req = makeReq({ params: { agendamentoId: '5' } });
      const res = mockRes();

      (comentarioShowService.getComentariosByShow as jest.Mock).mockResolvedValue(comentarios);

      getComentarios(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(comentarioShowService.getComentariosByShow).toHaveBeenCalledWith(5, undefined);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Comentários listados com sucesso', total: 2, comentarios })
      );
    });

    it('passa usuario_id ao service quando autenticado', async () => {
      const req = makeReq({ params: { agendamentoId: '5' }, user: { id: 42 } });
      const res = mockRes();

      (comentarioShowService.getComentariosByShow as jest.Mock).mockResolvedValue([]);

      getComentarios(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(comentarioShowService.getComentariosByShow).toHaveBeenCalledWith(5, 42);
    });
  });

  // ─── criarComentario ──────────────────────────────────────────────────────
  describe('criarComentario', () => {
    it('cria comentário e retorna 201', async () => {
      const comentario = { id: 1, texto: 'Show incrível!', usuario_id: 1 };
      const req = makeReq({
        user: { id: 1 },
        body: { agendamento_id: 5, texto: 'Show incrível!' },
      });
      const res = mockRes();

      (comentarioShowService.criarComentario as jest.Mock).mockResolvedValue(comentario);

      criarComentario(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(comentarioShowService.criarComentario).toHaveBeenCalledWith(
        expect.objectContaining({ usuario_id: 1, agendamento_id: 5, texto: 'Show incrível!' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Comentário criado com sucesso', comentario })
      );
    });

    it('cria comentário como resposta (com parent_id)', async () => {
      const comentario = { id: 2, texto: 'Concordo!', parent_id: 1 };
      const req = makeReq({
        user: { id: 1 },
        body: { agendamento_id: 5, texto: 'Concordo!', parent_id: 1 },
      });
      const res = mockRes();

      (comentarioShowService.criarComentario as jest.Mock).mockResolvedValue(comentario);

      criarComentario(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(comentarioShowService.criarComentario).toHaveBeenCalledWith(
        expect.objectContaining({ parent_id: 1 })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: {} });
      const res = mockRes();

      criarComentario(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });

  // ─── curtirComentario ─────────────────────────────────────────────────────
  describe('curtirComentario', () => {
    it('retorna mensagem de curtida quando curtiu', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '10' } });
      const res = mockRes();

      (comentarioShowService.curtirComentario as jest.Mock).mockResolvedValue({ curtiu: true, total_curtidas: 5 });

      curtirComentario(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(comentarioShowService.curtirComentario).toHaveBeenCalledWith(10, 1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Comentário curtido com sucesso', curtiu: true })
      );
    });

    it('retorna mensagem de remoção quando descurtiu', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '10' } });
      const res = mockRes();

      (comentarioShowService.curtirComentario as jest.Mock).mockResolvedValue({ curtiu: false, total_curtidas: 4 });

      curtirComentario(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Curtida removida com sucesso', curtiu: false })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '10' } });
      const res = mockRes();

      curtirComentario(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });
});
