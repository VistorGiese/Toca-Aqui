process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.JWT_EXPIRES_IN = '1h';

// Mock do módulo Redis antes de qualquer import que o use
jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    exists: jest.fn().mockResolvedValue(false),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    invalidate: jest.fn().mockResolvedValue(undefined),
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
    getClient: jest.fn().mockReturnValue({
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
    }),
  },
}));

import { Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authmiddleware';
import { generateToken } from '../utils/jwt';
import redisService from '../config/redis';

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as unknown as NextFunction;

const makeReq = (authHeader?: string): AuthRequest =>
  ({ header: jest.fn((name: string) => (name === 'Authorization' ? authHeader : undefined)) } as unknown as AuthRequest);

describe('authMiddleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna 401 quando o header Authorization está ausente', async () => {
    const req = makeReq(undefined);
    const res = mockRes();

    await authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Acesso Negado, Token Inexistente' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retorna 401 quando o token é inválido', async () => {
    const req = makeReq('Bearer token.invalido.aqui');
    const res = mockRes();

    await authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retorna 401 quando o token está na blacklist do Redis', async () => {
    const token = generateToken({ id: 1, email: 'a@b.com', role: 'artist' });
    const req = makeReq(`Bearer ${token}`);
    const res = mockRes();

    (redisService.exists as jest.Mock).mockResolvedValueOnce(true);

    await authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token revogado. Faça login novamente.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('chama next() e popula req.user para token válido e não revogado', async () => {
    const token = generateToken({ id: 7, email: 'valid@test.com', role: 'artist' });
    const req = makeReq(`Bearer ${token}`);
    const res = mockRes();

    (redisService.exists as jest.Mock).mockResolvedValueOnce(false);

    await authMiddleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(expect.objectContaining({ id: 7, email: 'valid@test.com', role: 'artist' }));
    expect(req.token).toBe(token);
  });

  it('retorna 401 quando token não tem id numérico', async () => {
    // Gera token com id como string — viola validação do middleware
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: 'nao-numerico', email: 'x@y.com', role: 'artist' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const req = makeReq(`Bearer ${token}`);
    const res = mockRes();

    (redisService.exists as jest.Mock).mockResolvedValueOnce(false);

    await authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('aceita token sem role e popula req.user com role undefined', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 5, email: 'x@y.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = makeReq(`Bearer ${token}`);
    const res = mockRes();

    (redisService.exists as jest.Mock).mockResolvedValueOnce(false);

    await authMiddleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(expect.objectContaining({ id: 5, email: 'x@y.com' }));
    expect(res.status).not.toHaveBeenCalled();
  });
});
