process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';

jest.mock('../services/BandApplicationService', () => ({
  bandApplicationService: {
    apply: jest.fn(),
    accept: jest.fn(),
    reject: jest.fn(),
    getApplicationsForEvent: jest.fn(),
    getApplicationsByArtist: jest.fn(),
  },
}));

import { Request, Response, NextFunction } from 'express';
import {
  applyBandToEvent,
  acceptBandApplication,
  getBandApplicationsForEvent,
  rejectBandApplication,
  getMyApplications,
} from '../controllers/BandApplicationController';
import { bandApplicationService } from '../services/BandApplicationService';
import { AuthRequest } from '../middleware/authmiddleware';

// asyncHandler retorna void — drenar microtasks para aguardar a promise interna
const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeAuthReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, body: {}, ...overrides } as AuthRequest);

const makeAplicacao = (overrides = {}) => ({ id: 1, banda_id: 1, evento_id: 10, status: 'pendente', ...overrides });

describe('BandApplicationController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  describe('applyBandToEvent', () => {
    it('retorna 201 com aplicação criada', async () => {
      const aplicacao = makeAplicacao();
      (bandApplicationService.apply as jest.Mock).mockResolvedValue(aplicacao);

      const req = makeAuthReq({ user: { id: 5 }, body: { banda_id: 1, evento_id: 10 } });
      const res = mockRes();

      applyBandToEvent(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Candidatura enviada com sucesso',
          aplicacao,
        })
      );
    });

    it('passa erro ao next quando service lança exceção', async () => {
      const erro = new Error('Banda inativa');
      (bandApplicationService.apply as jest.Mock).mockRejectedValue(erro);

      const req = makeAuthReq({ user: { id: 5 }, body: { banda_id: 1, evento_id: 10 } });
      const res = mockRes();

      applyBandToEvent(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(erro);
    });

    it('passa AppError 401 ao next quando usuário não está identificado', async () => {
      const req = makeAuthReq({ user: undefined });
      const res = mockRes();

      applyBandToEvent(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  describe('acceptBandApplication', () => {
    it('retorna 200 com aplicação aceita e contrato gerado', async () => {
      // Phase 3: accept() retorna { aplicacao, contrato } — controller expõe ambos
      const aplicacao = makeAplicacao({ status: 'aceito' });
      const contrato = { id: 10, status: 'aguardando_aceite', cache_total: 500 };
      (bandApplicationService.accept as jest.Mock).mockResolvedValue({ aplicacao, contrato });

      const req = makeAuthReq({ user: { id: 5 }, params: { id: '1' } });
      const res = mockRes();

      acceptBandApplication(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ aplicacao, contrato })
      );
    });

    it('passa erro ao next quando service lança exceção', async () => {
      const erro = new Error('Já existe banda aceita');
      (bandApplicationService.accept as jest.Mock).mockRejectedValue(erro);

      const req = makeAuthReq({ user: { id: 5 }, params: { id: '1' } });
      const res = mockRes();

      acceptBandApplication(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(erro);
    });

    it('passa AppError 401 ao next quando usuário não está identificado', async () => {
      const req = makeAuthReq({ user: undefined });
      const res = mockRes();

      acceptBandApplication(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  describe('getBandApplicationsForEvent', () => {
    it('retorna candidaturas quando evento está aberto', async () => {
      const candidaturas = [makeAplicacao(), makeAplicacao({ id: 2 })];
      (bandApplicationService.getApplicationsForEvent as jest.Mock).mockResolvedValue({
        closed: false,
        aplicacoes: candidaturas,
      });

      const req = { params: { evento_id: '10' } } as unknown as Request;
      const res = mockRes();

      getBandApplicationsForEvent(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(candidaturas);
    });

    it('retorna mensagem de evento fechado quando closed é true', async () => {
      (bandApplicationService.getApplicationsForEvent as jest.Mock).mockResolvedValue({
        closed: true,
        aplicacoes: [],
      });

      const req = { params: { evento_id: '10' } } as unknown as Request;
      const res = mockRes();

      getBandApplicationsForEvent(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Evento fechado - candidatura já aceita',
          candidaturas: [],
        })
      );
    });

    it('passa erro ao next quando service lança exceção', async () => {
      const erro = new Error('Evento não encontrado');
      (bandApplicationService.getApplicationsForEvent as jest.Mock).mockRejectedValue(erro);

      const req = { params: { evento_id: '999' } } as unknown as Request;
      const res = mockRes();

      getBandApplicationsForEvent(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(erro);
    });
  });

  describe('rejectBandApplication', () => {
    it('retorna 200 com candidatura recusada', async () => {
      const aplicacao = makeAplicacao({ status: 'rejeitado' });
      (bandApplicationService.reject as jest.Mock).mockResolvedValue(aplicacao);

      const req = makeAuthReq({ user: { id: 5 }, params: { id: '1' } });
      const res = mockRes();

      rejectBandApplication(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Candidatura recusada com sucesso', aplicacao })
      );
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeAuthReq({ user: undefined });
      const res = mockRes();

      rejectBandApplication(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('passa erro ao next quando service lança exceção', async () => {
      const erro = new Error('Candidatura não encontrada');
      (bandApplicationService.reject as jest.Mock).mockRejectedValue(erro);

      const req = makeAuthReq({ user: { id: 5 }, params: { id: '999' } });
      const res = mockRes();

      rejectBandApplication(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(erro);
    });
  });

  describe('getMyApplications', () => {
    it('retorna candidaturas do artista logado', async () => {
      const aplicacoes = [makeAplicacao(), makeAplicacao({ id: 2 })];
      (bandApplicationService.getApplicationsByArtist as jest.Mock).mockResolvedValue(aplicacoes);

      const req = makeAuthReq({ user: { id: 5 } });
      const res = mockRes();

      getMyApplications(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(aplicacoes);
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeAuthReq({ user: undefined });
      const res = mockRes();

      getMyApplications(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });
});
