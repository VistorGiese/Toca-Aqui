process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/BandModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), create: jest.fn() },
}));

jest.mock('../models/BandMemberModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), count: jest.fn(), create: jest.fn() },
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: {},
}));

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import {
  createBand,
  getBandDetails,
  inviteMemberToBand,
  respondToBandInvitation,
  getUserBands,
} from '../controllers/BandManagementController';
import BandModel from '../models/BandModel';
import BandMemberModel from '../models/BandMemberModel';
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

describe('BandManagementController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── createBand ───────────────────────────────────────────────────────────
  describe('createBand', () => {
    it('cria banda com artista como líder e retorna 201', async () => {
      const band = { id: 1, nome_banda: 'Minha Banda', descricao: 'Desc', generos_musicais: ['rock'], esta_ativo: true };
      const member = { id: 1, banda_id: 1, perfil_artista_id: 5 };
      const req = makeReq({
        user: { id: 1 },
        body: { nome_banda: 'Minha Banda', perfil_artista_id: 5 },
      });
      const res = mockRes();

      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue({ id: 5, usuario_id: 1 });
      (BandModel.create as jest.Mock).mockResolvedValue(band);
      (BandMemberModel.create as jest.Mock).mockResolvedValue(member);

      createBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(BandMemberModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ e_lider: true, status: 'approved' })
      );
    });

    it('passa AppError 400 quando nome_banda ou perfil_artista_id faltam', async () => {
      const req = makeReq({ user: { id: 1 }, body: { nome_banda: 'Test' } });
      const res = mockRes();

      createBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 404 quando perfil de artista não pertence ao usuário', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { nome_banda: 'Test', perfil_artista_id: 99 },
      });
      const res = mockRes();

      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(null);

      createBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: { nome_banda: 'Test', perfil_artista_id: 5 } });
      const res = mockRes();

      createBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── getBandDetails ───────────────────────────────────────────────────────
  describe('getBandDetails', () => {
    it('retorna detalhes da banda com membros', async () => {
      const band = {
        id: 1,
        nome_banda: 'Rock Band',
        descricao: 'Desc',
        generos_musicais: ['rock'],
        esta_ativo: true,
        Members: [{
          id: 1,
          funcao: 'Líder',
          e_lider: true,
          data_entrada: new Date(),
          ArtistProfile: { id: 5, nome_artistico: 'DJ', User: { nome: 'João' } },
        }],
      };
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (BandModel.findByPk as jest.Mock).mockResolvedValue(band);

      getBandDetails(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          nome_banda: 'Rock Band',
          members: expect.any(Array),
        })
      );
    });

    it('passa AppError 404 quando banda não encontrada', async () => {
      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      (BandModel.findByPk as jest.Mock).mockResolvedValue(null);

      getBandDetails(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── inviteMemberToBand ───────────────────────────────────────────────────
  describe('inviteMemberToBand', () => {
    it('envia convite com sucesso e retorna 201', async () => {
      const invitation = { id: 10, banda_id: 1, perfil_artista_id: 5, funcao: 'Guitarrista', status: 'pending' };
      const req = makeReq({
        user: { id: 1 },
        body: { banda_id: 1, perfil_artista_id: 5, funcao: 'Guitarrista' },
      });
      const res = mockRes();

      (BandMemberModel.findOne as jest.Mock)
        .mockResolvedValueOnce({ id: 1 }) // userLeadership
        .mockResolvedValueOnce(null); // existingMembership
      (BandMemberModel.count as jest.Mock).mockResolvedValue(3);
      (BandMemberModel.create as jest.Mock).mockResolvedValue(invitation);

      inviteMemberToBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('passa AppError 403 quando não é líder', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { banda_id: 1, perfil_artista_id: 5 },
      });
      const res = mockRes();

      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(null);

      inviteMemberToBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('passa AppError 400 quando banda tem 10 membros', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { banda_id: 1, perfil_artista_id: 5 },
      });
      const res = mockRes();

      (BandMemberModel.findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });
      (BandMemberModel.count as jest.Mock).mockResolvedValue(10);

      inviteMemberToBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 400 quando artista já está na banda', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { banda_id: 1, perfil_artista_id: 5 },
      });
      const res = mockRes();

      (BandMemberModel.findOne as jest.Mock)
        .mockResolvedValueOnce({ id: 1 }) // userLeadership
        .mockResolvedValueOnce({ id: 5 }); // existingMembership
      (BandMemberModel.count as jest.Mock).mockResolvedValue(3);

      inviteMemberToBand(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── respondToBandInvitation ──────────────────────────────────────────────
  describe('respondToBandInvitation', () => {
    it('aceita convite com sucesso', async () => {
      const invitation = {
        id: 10,
        status: 'pending',
        data_entrada: null,
        save: jest.fn().mockResolvedValue(undefined),
      };
      const req = makeReq({
        user: { id: 1 },
        body: { invitation_id: 10, action: 'accept' },
      });
      const res = mockRes();

      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(invitation);

      respondToBandInvitation(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(invitation.status).toBe('approved');
      expect(invitation.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Convite aceito com sucesso' })
      );
    });

    it('rejeita convite com sucesso', async () => {
      const invitation = {
        id: 10,
        status: 'pending',
        save: jest.fn().mockResolvedValue(undefined),
      };
      const req = makeReq({
        user: { id: 1 },
        body: { invitation_id: 10, action: 'reject' },
      });
      const res = mockRes();

      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(invitation);

      respondToBandInvitation(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(invitation.status).toBe('rejected');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Convite rejeitado' })
      );
    });

    it('passa AppError 400 quando ação inválida', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { invitation_id: 10, action: 'invalid' },
      });
      const res = mockRes();

      respondToBandInvitation(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 404 quando convite não encontrado', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { invitation_id: 999, action: 'accept' },
      });
      const res = mockRes();

      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(null);

      respondToBandInvitation(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── getUserBands ─────────────────────────────────────────────────────────
  describe('getUserBands', () => {
    it('retorna bandas do usuário', async () => {
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (ArtistProfileModel.findAll as jest.Mock).mockResolvedValue([]);

      getUserBands(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({ bands: [] });
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined });
      const res = mockRes();

      getUserBands(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });
});
