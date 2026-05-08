process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';

// Mock de todos os models usados no modelRegistry
jest.mock('../models/AddressModel', () => ({ findByPk: jest.fn() }));
jest.mock('../models/BandModel', () => ({ findByPk: jest.fn() }));
jest.mock('../models/BookingModel', () => ({ findByPk: jest.fn() }));
jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findOne: jest.fn() },
  findByPk: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock('../models/EstablishmentMemberModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));

import { Response, NextFunction } from 'express';
import {
  checkRole,
  checkAdmin,
  checkOwnership,
  checkOwnershipOrAdmin,
  checkRolesOrAdmin,
  checkEstablishmentAccess,
  checkEstablishmentOwnerOnly,
  checkHasArtistProfile,
  checkHasEstablishmentProfile,
} from '../middleware/authorizationMiddleware';
import { AuthRequest } from '../middleware/authmiddleware';
import { UserRole } from '../types/roles';
import BookingModel from '../models/BookingModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import EstablishmentMemberModel from '../models/EstablishmentMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, body: {}, ...overrides } as AuthRequest);

describe('checkRole', () => {
  beforeEach(() => jest.clearAllMocks());

  it('chama next() quando o usuário possui a role exigida', () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ARTIST } });
    const res = mockRes();

    checkRole(UserRole.ARTIST)(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('retorna 401 quando req.user está ausente', () => {
    const req = makeReq();
    const res = mockRes();

    checkRole(UserRole.ARTIST)(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retorna 403 quando o usuário possui role diferente da exigida', () => {
    const req = makeReq({ user: { id: 1, role: UserRole.COMMON_USER } });
    const res = mockRes();

    checkRole(UserRole.ARTIST)(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('aceita múltiplas roles — passa quando usuário tem uma delas', () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ESTABLISHMENT_OWNER } });
    const res = mockRes();

    checkRole(UserRole.ARTIST, UserRole.ESTABLISHMENT_OWNER)(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('retorna 403 quando role está ausente no user', () => {
    const req = makeReq({ user: { id: 1 } } as any);
    const res = mockRes();

    checkRole(UserRole.ARTIST)(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('checkAdmin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passa apenas para usuário admin', () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ADMIN } });
    const res = mockRes();

    checkAdmin()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('bloqueia usuário não-admin', () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ARTIST } });
    const res = mockRes();

    checkAdmin()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('checkOwnership', () => {
  beforeEach(() => jest.clearAllMocks());

  it('chama next() quando usuário é dono do recurso', async () => {
    const req = makeReq({ user: { id: 10, role: UserRole.ARTIST } });
    const res = mockRes();
    const getOwnerId = jest.fn().mockResolvedValue(10);

    await checkOwnership(getOwnerId)(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(getOwnerId).toHaveBeenCalledWith(req);
  });

  it('retorna 401 quando usuário não está autenticado', async () => {
    const req = makeReq();
    const res = mockRes();
    const getOwnerId = jest.fn();

    await checkOwnership(getOwnerId)(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(getOwnerId).not.toHaveBeenCalled();
  });

  it('retorna 404 quando recurso não existe (getResourceOwnerId retorna undefined)', async () => {
    const req = makeReq({ user: { id: 10, role: UserRole.ARTIST } });
    const res = mockRes();
    const getOwnerId = jest.fn().mockResolvedValue(undefined);

    await checkOwnership(getOwnerId)(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retorna 403 quando usuário não é dono do recurso', async () => {
    const req = makeReq({ user: { id: 10, role: UserRole.ARTIST } });
    const res = mockRes();
    const getOwnerId = jest.fn().mockResolvedValue(99);

    await checkOwnership(getOwnerId)(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe('checkOwnershipOrAdmin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('admin sempre passa sem consultar o model', async () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ADMIN }, params: { id: '5' } });
    const res = mockRes();

    await checkOwnershipOrAdmin('Booking')(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(BookingModel.findByPk).not.toHaveBeenCalled();
  });

  it('retorna 401 quando usuário não está autenticado', async () => {
    const req = makeReq({ params: { id: '5' } });
    const res = mockRes();

    await checkOwnershipOrAdmin('Booking')(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retorna 404 quando o recurso não existe no banco', async () => {
    (BookingModel.findByPk as jest.Mock).mockResolvedValueOnce(null);
    const req = makeReq({ user: { id: 1, role: UserRole.ARTIST }, params: { id: '99' } });
    const res = mockRes();

    await checkOwnershipOrAdmin('Booking')(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('retorna 403 quando o usuário não é dono do recurso', async () => {
    (BookingModel.findByPk as jest.Mock).mockResolvedValueOnce({ usuario_id: 999 });
    const req = makeReq({ user: { id: 1, role: UserRole.ARTIST }, params: { id: '10' } });
    const res = mockRes();

    await checkOwnershipOrAdmin('Booking')(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('chama next() quando usuário é dono do recurso', async () => {
    (BookingModel.findByPk as jest.Mock).mockResolvedValueOnce({ usuario_id: 7 });
    const req = makeReq({ user: { id: 7, role: UserRole.ESTABLISHMENT_OWNER }, params: { id: '10' } });
    const res = mockRes();

    await checkOwnershipOrAdmin('Booking')(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('retorna 500 quando model não está no registry', async () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ARTIST }, params: { id: '1' } });
    const res = mockRes();

    await checkOwnershipOrAdmin('ModelInexistente')(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('checkEstablishmentAccess', () => {
  beforeEach(() => jest.clearAllMocks());

  it('admin passa sem consultar o banco', async () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ADMIN }, params: { id: '5' } });
    const res = mockRes();

    await checkEstablishmentAccess()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(EstablishmentProfileModel.findByPk).not.toHaveBeenCalled();
  });

  it('retorna 401 quando usuário não está autenticado', async () => {
    const req = makeReq({ params: { id: '5' } });
    const res = mockRes();

    await checkEstablishmentAccess()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retorna 404 quando estabelecimento não existe', async () => {
    (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);
    const req = makeReq({ user: { id: 1, role: UserRole.ESTABLISHMENT_OWNER }, params: { id: '99' } });
    const res = mockRes();

    await checkEstablishmentAccess()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('owner do estabelecimento passa', async () => {
    (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 5, usuario_id: 10 });
    const req = makeReq({ user: { id: 10, role: UserRole.ESTABLISHMENT_OWNER }, params: { id: '5' } });
    const res = mockRes();

    await checkEstablishmentAccess()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('membro do estabelecimento passa', async () => {
    (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 5, usuario_id: 99 });
    (EstablishmentMemberModel.findOne as jest.Mock).mockResolvedValue({ id: 1, usuario_id: 10 });
    const req = makeReq({ user: { id: 10, role: UserRole.ESTABLISHMENT_OWNER }, params: { id: '5' } });
    const res = mockRes();

    await checkEstablishmentAccess()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('retorna 403 para usuário não-owner e não-membro', async () => {
    (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 5, usuario_id: 99 });
    (EstablishmentMemberModel.findOne as jest.Mock).mockResolvedValue(null);
    const req = makeReq({ user: { id: 10, role: UserRole.ARTIST }, params: { id: '5' } });
    const res = mockRes();

    await checkEstablishmentAccess()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('checkEstablishmentOwnerOnly', () => {
  beforeEach(() => jest.clearAllMocks());

  it('admin passa sem consultar o banco', async () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ADMIN }, params: { id: '5' } });
    const res = mockRes();

    await checkEstablishmentOwnerOnly()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(EstablishmentProfileModel.findByPk).not.toHaveBeenCalled();
  });

  it('owner passa', async () => {
    (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 5, usuario_id: 7 });
    const req = makeReq({ user: { id: 7, role: UserRole.ESTABLISHMENT_OWNER }, params: { id: '5' } });
    const res = mockRes();

    await checkEstablishmentOwnerOnly()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('retorna 401 quando não autenticado', async () => {
    const req = makeReq({ params: { id: '5' } });
    const res = mockRes();

    await checkEstablishmentOwnerOnly()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retorna 404 quando estabelecimento não existe', async () => {
    (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);
    const req = makeReq({ user: { id: 1, role: UserRole.ESTABLISHMENT_OWNER }, params: { id: '99' } });
    const res = mockRes();

    await checkEstablishmentOwnerOnly()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('retorna 403 para não-owner', async () => {
    (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 5, usuario_id: 99 });
    const req = makeReq({ user: { id: 1, role: UserRole.ESTABLISHMENT_OWNER }, params: { id: '5' } });
    const res = mockRes();

    await checkEstablishmentOwnerOnly()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('checkHasArtistProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('admin passa sem consultar o banco', async () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ADMIN } });
    const res = mockRes();

    await checkHasArtistProfile()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(ArtistProfileModel.findOne).not.toHaveBeenCalled();
  });

  it('passa quando usuário tem perfil de artista', async () => {
    (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue({ id: 1, usuario_id: 5 });
    const req = makeReq({ user: { id: 5, role: UserRole.ARTIST } });
    const res = mockRes();

    await checkHasArtistProfile()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('retorna 401 quando não autenticado', async () => {
    const req = makeReq();
    const res = mockRes();

    await checkHasArtistProfile()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retorna 403 quando usuário não tem perfil de artista', async () => {
    (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(null);
    const req = makeReq({ user: { id: 5, role: UserRole.COMMON_USER } });
    const res = mockRes();

    await checkHasArtistProfile()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('checkHasEstablishmentProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('admin passa sem consultar o banco', async () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ADMIN } });
    const res = mockRes();

    await checkHasEstablishmentProfile()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(EstablishmentProfileModel.findOne).not.toHaveBeenCalled();
  });

  it('passa quando usuário tem perfil de estabelecimento', async () => {
    (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue({ id: 2, usuario_id: 5 });
    const req = makeReq({ user: { id: 5, role: UserRole.ESTABLISHMENT_OWNER } });
    const res = mockRes();

    await checkHasEstablishmentProfile()(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('retorna 401 quando não autenticado', async () => {
    const req = makeReq();
    const res = mockRes();

    await checkHasEstablishmentProfile()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retorna 403 quando usuário não tem perfil de estabelecimento', async () => {
    (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue(null);
    const req = makeReq({ user: { id: 5, role: UserRole.COMMON_USER } });
    const res = mockRes();

    await checkHasEstablishmentProfile()(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('checkRolesOrAdmin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('admin sempre passa independente da lista de roles', () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ADMIN } });
    const res = mockRes();

    checkRolesOrAdmin(UserRole.ARTIST)(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('passa quando usuário tem a role exigida', () => {
    const req = makeReq({ user: { id: 1, role: UserRole.ESTABLISHMENT_OWNER } });
    const res = mockRes();

    checkRolesOrAdmin(UserRole.ESTABLISHMENT_OWNER)(req, res, mockNext as unknown as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('retorna 403 quando usuário não tem a role e não é admin', () => {
    const req = makeReq({ user: { id: 1, role: UserRole.COMMON_USER } });
    const res = mockRes();

    checkRolesOrAdmin(UserRole.ARTIST, UserRole.ESTABLISHMENT_OWNER)(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('retorna 401 quando usuário não está autenticado', () => {
    const req = makeReq();
    const res = mockRes();

    checkRolesOrAdmin(UserRole.ARTIST)(req, res, mockNext as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
