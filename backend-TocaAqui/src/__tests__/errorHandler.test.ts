process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

import { Request, Response, NextFunction } from 'express';
import { errorHandler, asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = {} as Request;
const mockNext = jest.fn() as unknown as NextFunction;

describe('errorHandler middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('responde com statusCode e mensagem para AppError', () => {
    const err = new AppError('recurso não encontrado', 404);
    const res = mockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'recurso não encontrado' }));
  });

  it('inclui campos extras do AppError no body', () => {
    const err = new AppError('conflito', 400, { campo: 'email' });
    const res = mockRes();

    errorHandler(err, mockReq, res, mockNext);

    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.campo).toBe('email');
  });

  it('retorna 400 para SequelizeValidationError fora de produção', () => {
    const err = Object.assign(new Error('coluna nula'), { name: 'SequelizeValidationError' });
    const res = mockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.error).toBe('Dados inválidos');
    expect(body.details).toBeDefined();
  });

  it('retorna 400 para SequelizeUniqueConstraintError', () => {
    const err = Object.assign(new Error('email duplicado'), { name: 'SequelizeUniqueConstraintError' });
    const res = mockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('retorna 401 para JsonWebTokenError', () => {
    const err = Object.assign(new Error('jwt malformed'), { name: 'JsonWebTokenError' });
    const res = mockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
  });

  it('retorna 401 para TokenExpiredError', () => {
    const err = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
    const res = mockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retorna 400 para MulterError', () => {
    const err = Object.assign(new Error('file too large'), { name: 'MulterError' });
    const res = mockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.error).toBe('Erro no upload de arquivo');
  });

  it('retorna 500 para erros genéricos não mapeados', () => {
    const err = new Error('erro desconhecido');
    const res = mockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor' });
  });
});

describe('asyncHandler wrapper', () => {
  beforeEach(() => jest.clearAllMocks());

  it('chama next com o erro quando a função async rejeita', async () => {
    const next = jest.fn();
    const erro = new Error('falha assíncrona');

    const handler = asyncHandler(async () => {
      throw erro;
    });

    await handler(mockReq, mockRes(), next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(erro);
  });

  it('não chama next quando a função resolve sem erro', async () => {
    const next = jest.fn();
    const res = mockRes();

    const handler = asyncHandler(async (_req, res) => {
      res.json({ ok: true });
    });

    await handler(mockReq, res, next as unknown as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
