process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/EstablishmentMemberModel', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { listMembers, addMember, removeMember } from '../controllers/EstablishmentMemberController';
import EstablishmentMemberModel from '../models/EstablishmentMemberModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import UserModel from '../models/UserModel';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

const makeUser = (overrides = {}) => ({
  id: 2,
  nome_completo: 'João Silva',
  email: 'joao@email.com',
  foto_perfil: null,
  ...overrides,
});

const makeEstabelecimento = (overrides = {}) => ({
  id: 1,
  usuario_id: 10,
  ...overrides,
});

const makeMembro = (overrides = {}) => ({
  id: 1,
  estabelecimento_id: 1,
  usuario_id: 2,
  role: 'admin',
  destroy: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('EstablishmentMemberController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── listMembers ──────────────────────────────────────────────────────────
  describe('listMembers', () => {
    it('retorna owner e membros do estabelecimento', async () => {
      const owner = makeUser({ id: 10, nome_completo: 'Dono Bar' });
      const membro = { ...makeMembro(), User: makeUser() };
      const estabelecimento = { ...makeEstabelecimento(), User: owner };

      (EstablishmentMemberModel.findAll as jest.Mock).mockResolvedValue([membro]);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(estabelecimento);

      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      listMembers(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: expect.objectContaining({ role: 'owner' }),
          members: expect.arrayContaining([expect.objectContaining({ role: 'admin' })]),
        })
      );
    });

    it('retorna owner null quando estabelecimento não encontrado', async () => {
      (EstablishmentMemberModel.findAll as jest.Mock).mockResolvedValue([]);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      listMembers(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ owner: null, members: [] })
      );
    });
  });

  // ─── addMember ────────────────────────────────────────────────────────────
  describe('addMember', () => {
    it('adiciona membro com sucesso e retorna 201', async () => {
      const usuario = makeUser();
      const estabelecimento = makeEstabelecimento({ usuario_id: 10 });
      const membro = makeMembro();

      (UserModel.findOne as jest.Mock).mockResolvedValue(usuario);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(estabelecimento);
      (EstablishmentMemberModel.findOne as jest.Mock).mockResolvedValue(null);
      (EstablishmentMemberModel.create as jest.Mock).mockResolvedValue(membro);

      const req = makeReq({ params: { id: '1' }, body: { email: 'joao@email.com' } });
      const res = mockRes();

      addMember(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Gerenciador adicionado com sucesso' })
      );
    });

    it('lança 400 quando email não fornecido', async () => {
      const req = makeReq({ params: { id: '1' }, body: {} });
      const res = mockRes();

      addMember(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('lança 404 quando usuário não encontrado', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const req = makeReq({ params: { id: '1' }, body: { email: 'naoexiste@email.com' } });
      const res = mockRes();

      addMember(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('lança 404 quando estabelecimento não encontrado', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(makeUser());
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      const req = makeReq({ params: { id: '999' }, body: { email: 'joao@email.com' } });
      const res = mockRes();

      addMember(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('lança 400 quando tenta adicionar o próprio owner', async () => {
      const owner = makeUser({ id: 10 });
      const estabelecimento = makeEstabelecimento({ usuario_id: 10 });

      (UserModel.findOne as jest.Mock).mockResolvedValue(owner);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(estabelecimento);

      const req = makeReq({ params: { id: '1' }, body: { email: 'owner@email.com' } });
      const res = mockRes();

      addMember(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('lança 409 quando usuário já é membro', async () => {
      const usuario = makeUser();
      const estabelecimento = makeEstabelecimento({ usuario_id: 10 });

      (UserModel.findOne as jest.Mock).mockResolvedValue(usuario);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(estabelecimento);
      (EstablishmentMemberModel.findOne as jest.Mock).mockResolvedValue(makeMembro());

      const req = makeReq({ params: { id: '1' }, body: { email: 'joao@email.com' } });
      const res = mockRes();

      addMember(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
    });
  });

  // ─── removeMember ─────────────────────────────────────────────────────────
  describe('removeMember', () => {
    it('remove membro com sucesso', async () => {
      const membro = makeMembro();
      (EstablishmentMemberModel.findOne as jest.Mock).mockResolvedValue(membro);

      const req = makeReq({ params: { id: '1', usuarioId: '2' } });
      const res = mockRes();

      removeMember(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(membro.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Gerenciador removido com sucesso' });
    });

    it('lança 404 quando membro não encontrado', async () => {
      (EstablishmentMemberModel.findOne as jest.Mock).mockResolvedValue(null);

      const req = makeReq({ params: { id: '1', usuarioId: '999' } });
      const res = mockRes();

      removeMember(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });
});
