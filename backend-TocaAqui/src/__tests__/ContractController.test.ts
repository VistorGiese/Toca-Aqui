process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../services/ContractService', () => ({
  contractService: {
    getUserRole: jest.fn(),
    getById: jest.fn(),
    getByEvent: jest.fn(),
    getByUser: jest.fn(),
    proposeEdit: jest.fn(),
    acceptContract: jest.fn(),
    cancelContract: jest.fn(),
    getHistory: jest.fn(),
  },
}));

jest.mock('../services/NotificationService', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../models/NotificationModel', () => ({
  NotificationType: {
    CONTRATO_ATUALIZADO: 'contrato_atualizado',
    CONTRATO_ACEITO: 'contrato_aceito',
    CONTRATO_CANCELADO: 'contrato_cancelado',
  },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/BandMemberModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
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

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import {
  getContract,
  getContractByEvent,
  getMyContracts,
  editContract,
  acceptContract,
  cancelContract,
  getContractHistory,
} from '../controllers/ContractController';
import { contractService } from '../services/ContractService';
import { createNotification } from '../services/NotificationService';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
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

const makeContrato = (overrides = {}) => ({
  id: 1,
  perfil_estabelecimento_id: 10,
  banda_id: 5,
  aceite_contratante: false,
  aceite_contratado: false,
  ...overrides,
});

describe('ContractController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── getContract ──────────────────────────────────────────────────────────
  describe('getContract', () => {
    it('retorna contrato quando usuário tem acesso', async () => {
      const contrato = makeContrato();
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (contractService.getById as jest.Mock).mockResolvedValue(contrato);

      getContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(contrato);
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '1' } });
      const res = mockRes();

      getContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('passa AppError 403 quando usuário não tem acesso', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue(null);

      getContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  // ─── getContractByEvent ───────────────────────────────────────────────────
  describe('getContractByEvent', () => {
    it('retorna contrato do evento', async () => {
      const contrato = makeContrato();
      const req = makeReq({ user: { id: 1 }, params: { evento_id: '10' } });
      const res = mockRes();

      (contractService.getByEvent as jest.Mock).mockResolvedValue(contrato);
      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');

      getContractByEvent(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(contrato);
    });

    it('passa AppError 404 quando não há contrato para o evento', async () => {
      const req = makeReq({ user: { id: 1 }, params: { evento_id: '10' } });
      const res = mockRes();

      (contractService.getByEvent as jest.Mock).mockResolvedValue(null);

      getContractByEvent(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { evento_id: '10' } });
      const res = mockRes();

      getContractByEvent(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── getMyContracts ───────────────────────────────────────────────────────
  describe('getMyContracts', () => {
    it('retorna contratos do usuário', async () => {
      const contratos = [makeContrato(), makeContrato({ id: 2 })];
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (contractService.getByUser as jest.Mock).mockResolvedValue(contratos);

      getMyContracts(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({ data: contratos });
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined });
      const res = mockRes();

      getMyContracts(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── editContract ─────────────────────────────────────────────────────────
  describe('editContract', () => {
    it('edita contrato e notifica outra parte', async () => {
      const contrato = makeContrato();
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { cache_total: 5000 },
      });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (contractService.proposeEdit as jest.Mock).mockResolvedValue(contrato);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue({
        ArtistProfile: { usuario_id: 2 },
      });

      editContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(contractService.proposeEdit).toHaveBeenCalledWith(1, 1, 'contratante', { cache_total: 5000 });
      expect(redisService.invalidatePattern).toHaveBeenCalledWith('contratos:*');
      expect(res.json).toHaveBeenCalledWith(contrato);
    });

    it('passa AppError 403 quando usuário sem acesso', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '1' }, body: {} });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue(null);

      editContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  // ─── acceptContract ───────────────────────────────────────────────────────
  describe('acceptContract', () => {
    it('aceita contrato e notifica quando ambos aceitaram', async () => {
      const contrato = makeContrato({ aceite_contratante: true, aceite_contratado: true });
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (contractService.acceptContract as jest.Mock).mockResolvedValue(contrato);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 1 });
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue({
        ArtistProfile: { usuario_id: 2 },
      });

      acceptContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(contrato);
      expect(redisService.invalidatePattern).toHaveBeenCalledWith('contratos:*');
      expect(createNotification).toHaveBeenCalled();
    });

    it('notifica outra parte quando apenas uma aceitou', async () => {
      const contrato = makeContrato({ aceite_contratante: true, aceite_contratado: false });
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (contractService.acceptContract as jest.Mock).mockResolvedValue(contrato);
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue({
        ArtistProfile: { usuario_id: 2 },
      });

      acceptContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(contrato);
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '1' } });
      const res = mockRes();

      acceptContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── cancelContract ───────────────────────────────────────────────────────
  describe('cancelContract', () => {
    it('cancela contrato e notifica outra parte', async () => {
      const contrato = makeContrato();
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { motivo: 'Mudança de planos' },
      });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (contractService.cancelContract as jest.Mock).mockResolvedValue({
        contrato,
        penalidade_percentual: 50,
      });
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue({
        ArtistProfile: { usuario_id: 2 },
      });

      cancelContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({ contrato, penalidade_percentual: 50 });
      expect(redisService.invalidatePattern).toHaveBeenCalledWith('contratos:*');
    });

    it('passa AppError 403 quando sem acesso', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '1' }, body: {} });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue(null);

      cancelContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  // ─── getContractHistory ───────────────────────────────────────────────────
  describe('getContractHistory', () => {
    it('retorna histórico do contrato', async () => {
      const historico = [{ id: 1, campo_alterado: 'cache_total' }];
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (contractService.getHistory as jest.Mock).mockResolvedValue(historico);

      getContractHistory(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({ data: historico });
    });

    it('passa AppError 403 quando sem acesso', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue(null);

      getContractHistory(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '1' } });
      const res = mockRes();

      getContractHistory(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });
});
