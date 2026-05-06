import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

const schema = z.object({
  nome: z.string().min(2),
  idade: z.number().int().positive(),
});

describe('validate middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('chama next() quando os dados são válidos', () => {
    const req = { body: { nome: 'Ana', idade: 25, campoExtra: 'ignorado' } } as Request;
    const res = mockRes();

    validate(schema)(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('substitui req.body pelo dado parseado (remove campos extras)', () => {
    const req = { body: { nome: 'Ana', idade: 25, campoExtra: 'ignorado' } } as Request;
    const res = mockRes();

    validate(schema)(req, res, mockNext);

    expect(req.body).toEqual({ nome: 'Ana', idade: 25 });
    expect(req.body.campoExtra).toBeUndefined();
  });

  it('retorna 400 quando faltam campos obrigatórios', () => {
    const req = { body: { nome: 'Ana' } } as Request;
    const res = mockRes();

    validate(schema)(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Dados inválidos', detalhes: expect.any(Array) })
    );
  });

  it('retorna 400 com descrição dos campos inválidos', () => {
    const req = { body: { nome: 'A', idade: -5 } } as Request;
    const res = mockRes();

    validate(schema)(req, res, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    const campos = payload.detalhes.map((d: any) => d.campo);

    expect(campos).toContain('nome');
    expect(campos).toContain('idade');
  });

  it('retorna 400 com body completamente vazio', () => {
    const req = { body: {} } as Request;
    const res = mockRes();

    validate(schema)(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('não chama next() quando tipo de campo está errado', () => {
    const req = { body: { nome: 'Ana', idade: 'vinte' } } as Request;
    const res = mockRes();

    validate(schema)(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
