process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../services/IngressoService', () => ({
  ingressoService: {
    comprarIngresso: jest.fn(),
    getMeusIngressos: jest.fn(),
    getIngressoById: jest.fn(),
  },
}));

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { comprarIngresso, getMeusIngressos, getIngressoById } from '../controllers/IngressoController';
import { ingressoService } from '../services/IngressoService';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

describe('IngressoController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── comprarIngresso ──────────────────────────────────────────────────────
  describe('comprarIngresso', () => {
    it('compra ingresso e retorna 201', async () => {
      const ingresso = { id: 1, codigo_qr: 'abc123', tipo: 'inteira' };
      const req = makeReq({
        user: { id: 1 },
        body: {
          agendamento_id: 5,
          tipo: 'inteira',
          nome_comprador: 'João Silva',
          cpf: '123.456.789-00',
          telefone: '44999999999',
        },
      });
      const res = mockRes();

      (ingressoService.comprarIngresso as jest.Mock).mockResolvedValue(ingresso);

      comprarIngresso(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(ingressoService.comprarIngresso).toHaveBeenCalledWith(
        expect.objectContaining({ usuario_id: 1, agendamento_id: 5, tipo: 'inteira' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Ingresso comprado com sucesso', ingresso })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: {} });
      const res = mockRes();

      comprarIngresso(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('passa erro do service ao next', async () => {
      const req = makeReq({ user: { id: 1 }, body: { agendamento_id: 5, tipo: 'inteira' } });
      const res = mockRes();

      (ingressoService.comprarIngresso as jest.Mock).mockRejectedValue({ statusCode: 400, message: 'Show esgotado' });

      comprarIngresso(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

  // ─── getMeusIngressos ─────────────────────────────────────────────────────
  describe('getMeusIngressos', () => {
    it('retorna ingressos do usuário', async () => {
      const ingressos = [{ id: 1 }, { id: 2 }];
      const req = makeReq({ user: { id: 1 }, query: {} });
      const res = mockRes();

      (ingressoService.getMeusIngressos as jest.Mock).mockResolvedValue(ingressos);

      getMeusIngressos(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(ingressoService.getMeusIngressos).toHaveBeenCalledWith(1, undefined);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Ingressos listados com sucesso', total: 2, ingressos })
      );
    });

    it('passa filtro de tipo ao service', async () => {
      const req = makeReq({ user: { id: 1 }, query: { tipo: 'proximos' } });
      const res = mockRes();

      (ingressoService.getMeusIngressos as jest.Mock).mockResolvedValue([]);

      getMeusIngressos(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(ingressoService.getMeusIngressos).toHaveBeenCalledWith(1, 'proximos');
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined });
      const res = mockRes();

      getMeusIngressos(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });

  // ─── getIngressoById ──────────────────────────────────────────────────────
  describe('getIngressoById', () => {
    it('retorna ingresso pelo id', async () => {
      const ingresso = { id: 1, codigo_qr: 'abc123' };
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (ingressoService.getIngressoById as jest.Mock).mockResolvedValue(ingresso);

      getIngressoById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(ingressoService.getIngressoById).toHaveBeenCalledWith(1, 1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Ingresso encontrado com sucesso', ingresso })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '1' } });
      const res = mockRes();

      getIngressoById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('passa erro do service ao next quando ingresso não encontrado', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '999' } });
      const res = mockRes();

      (ingressoService.getIngressoById as jest.Mock).mockRejectedValue({ statusCode: 404, message: 'Não encontrado' });

      getIngressoById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });
});
