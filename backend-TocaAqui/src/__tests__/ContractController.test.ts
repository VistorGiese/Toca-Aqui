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
    completeContract: jest.fn(),
  },
}));

jest.mock('../models/ContractModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../models/AvaliacaoShowModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), create: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), update: jest.fn() },
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
  completeContractHandler,
  avaliarArtista,
  avaliarEstabelecimento,
} from '../controllers/ContractController';
import { contractService } from '../services/ContractService';
import { createNotification } from '../services/NotificationService';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import redisService from '../config/redis';
import ContractModel from '../models/ContractModel';
import AvaliacaoShowModel from '../models/AvaliacaoShowModel';
import ArtistProfileModel from '../models/ArtistProfileModel';

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

  // ─── completeContractHandler (Phase 5) ────────────────────────────────────
  describe('completeContractHandler', () => {
    it('retorna contrato concluído quando usuário é contratante', async () => {
      const contrato = makeContrato({ status: 'concluido' });
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (contractService.completeContract as jest.Mock).mockResolvedValue(contrato);

      completeContractHandler(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(contrato);
      expect(redisService.invalidatePattern).toHaveBeenCalledWith('contratos:*');
    });

    it('lança 403 quando usuário não é contratante', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratado');

      completeContractHandler(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('lança 401 quando usuário não está identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '1' } });
      const res = mockRes();

      completeContractHandler(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── avaliarEstabelecimento ───────────────────────────────────────────────
  describe('avaliarEstabelecimento', () => {
    const makeContratoConcluido = (overrides = {}) =>
      makeContrato({ status: 'concluido', artista_id: 7, banda_id: null, evento_id: 30, ...overrides });

    it('retorna 201 quando artista individual avalia o estabelecimento', async () => {
      const contrato = makeContratoConcluido();
      const avaliacao = { id: 10, nota_local: 5 };
      const req = makeReq({
        user: { id: 3 },
        params: { id: '1' },
        body: { nota: 5, comentario: 'Lugar ótimo', tags: [] },
      });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 3 });
      (AvaliacaoShowModel.findOne as jest.Mock).mockResolvedValue(null);
      (AvaliacaoShowModel.create as jest.Mock).mockResolvedValue(avaliacao);

      avaliarEstabelecimento(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ avaliacao })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '1' }, body: { nota: 4 } });
      const res = mockRes();

      avaliarEstabelecimento(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('lança 400 quando nota está fora do intervalo 1-5', async () => {
      const req = makeReq({ user: { id: 3 }, params: { id: '1' }, body: { nota: 0 } });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContratoConcluido());

      avaliarEstabelecimento(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança 404 quando contrato não encontrado', async () => {
      const req = makeReq({ user: { id: 3 }, params: { id: '999' }, body: { nota: 4 } });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(null);

      avaliarEstabelecimento(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('lança 400 quando contrato não está concluído', async () => {
      const req = makeReq({ user: { id: 3 }, params: { id: '1' }, body: { nota: 4 } });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContrato({ status: 'aceito', artista_id: 7 }));

      avaliarEstabelecimento(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança 403 quando usuário não é o contratado', async () => {
      const req = makeReq({ user: { id: 99 }, params: { id: '1' }, body: { nota: 4 } });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContratoConcluido());
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 3 });

      avaliarEstabelecimento(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('lança 400 quando avaliação duplicada', async () => {
      const req = makeReq({ user: { id: 3 }, params: { id: '1' }, body: { nota: 4 } });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContratoConcluido());
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 3 });
      (AvaliacaoShowModel.findOne as jest.Mock).mockResolvedValue({ id: 2 });

      avaliarEstabelecimento(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── avaliarArtista (Phase 5) ─────────────────────────────────────────────
  describe('avaliarArtista', () => {
    const makeContratoConcluido = (overrides = {}) =>
      makeContrato({ status: 'concluido', artista_id: null, evento_id: 20, ...overrides });

    it('retorna 201 com avaliação quando dados são válidos', async () => {
      // Arrange
      const contrato = makeContratoConcluido();
      const avaliacao = { id: 5, nota_artista: 4 };
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { nota: 4, comentario: 'Ótimo show', tags: [] },
      });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 1 });
      (AvaliacaoShowModel.findOne as jest.Mock).mockResolvedValue(null);
      (AvaliacaoShowModel.create as jest.Mock).mockResolvedValue(avaliacao);

      // Act
      avaliarArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ avaliacao })
      );
    });

    it('lança 400 quando nota está fora do intervalo 1-5', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { nota: 6 },
      });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContratoConcluido());

      avaliarArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança 404 quando contrato não encontrado', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { id: '999' },
        body: { nota: 4 },
      });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(null);

      avaliarArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('lança 400 quando contrato não está concluído', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { nota: 4 },
      });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContrato({ status: 'aceito' }));

      avaliarArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança 403 quando usuário não é dono do estabelecimento', async () => {
      const req = makeReq({
        user: { id: 99 },
        params: { id: '1' },
        body: { nota: 4 },
      });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContratoConcluido());
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 1 });

      avaliarArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('lança 400 quando avaliação duplicada', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { nota: 4 },
      });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContratoConcluido());
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 1 });
      (AvaliacaoShowModel.findOne as jest.Mock).mockResolvedValue({ id: 3 });

      avaliarArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('recalcula nota_media do artista com média arredondada a 1 decimal', async () => {
      // Arrange — artista com 2 contratos concluídos, notas [4, 5] → média 4.5
      const contrato = makeContratoConcluido({ artista_id: 7 });
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { nota: 5 },
      });
      const res = mockRes();

      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 1 });
      (AvaliacaoShowModel.findOne as jest.Mock).mockResolvedValue(null);
      (AvaliacaoShowModel.create as jest.Mock).mockResolvedValue({ id: 5 });
      (ContractModel.findAll as jest.Mock).mockResolvedValue([{ evento_id: 20 }, { evento_id: 21 }]);
      (AvaliacaoShowModel.findAll as jest.Mock).mockResolvedValue([
        { nota_artista: 4 },
        { nota_artista: 5 },
      ]);

      // Act
      avaliarArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      // Assert — Math.round((4+5)/2 * 10) / 10 = 4.5
      expect(ArtistProfileModel.update).toHaveBeenCalledWith(
        { nota_media: 4.5 },
        expect.objectContaining({ where: { id: 7 } })
      );
    });
  });
});
