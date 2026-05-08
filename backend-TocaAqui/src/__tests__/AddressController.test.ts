process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/AddressModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
}));

import { Request, Response, NextFunction } from 'express';
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} from '../controllers/AddressController';
import AddressModel from '../models/AddressModel';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({ params: {}, query: {}, body: {}, ...overrides } as Request);

const makeAddress = (overrides = {}) => ({
  id: 1,
  rua: 'Rua Teste',
  numero: '100',
  bairro: 'Centro',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01000-000',
  update: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('AddressController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── createAddress ────────────────────────────────────────────────────────
  describe('createAddress', () => {
    it('cria endereço e retorna 201', async () => {
      const address = makeAddress();
      const req = makeReq({
        body: { rua: 'Rua Teste', numero: '100', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01000-000' },
      });
      const res = mockRes();

      (AddressModel.findOne as jest.Mock).mockResolvedValue(null);
      (AddressModel.create as jest.Mock).mockResolvedValue(address);

      createAddress(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(address);
    });

    it('passa AppError 400 quando endereço duplicado', async () => {
      const req = makeReq({ body: { rua: 'Rua Teste', numero: '100' } });
      const res = mockRes();

      (AddressModel.findOne as jest.Mock).mockResolvedValue(makeAddress());

      createAddress(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── getAddresses ─────────────────────────────────────────────────────────
  describe('getAddresses', () => {
    it('retorna lista paginada', async () => {
      const req = makeReq({ query: {} });
      const res = mockRes();

      (AddressModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: [makeAddress()],
      });

      getAddresses(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          pagination: expect.objectContaining({ total: 1 }),
        })
      );
    });
  });

  // ─── getAddressById ───────────────────────────────────────────────────────
  describe('getAddressById', () => {
    it('retorna endereço pelo id', async () => {
      const address = makeAddress();
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (AddressModel.findByPk as jest.Mock).mockResolvedValue(address);

      getAddressById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(address);
    });

    it('passa AppError 404 quando não encontrado', async () => {
      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      (AddressModel.findByPk as jest.Mock).mockResolvedValue(null);

      getAddressById(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── updateAddress ────────────────────────────────────────────────────────
  describe('updateAddress', () => {
    it('atualiza endereço com sucesso', async () => {
      const address = makeAddress();
      const req = makeReq({ params: { id: '1' }, body: { bairro: 'Novo Bairro' } });
      const res = mockRes();

      (AddressModel.findByPk as jest.Mock).mockResolvedValue(address);

      updateAddress(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(address.update).toHaveBeenCalledWith({ bairro: 'Novo Bairro' });
      expect(res.json).toHaveBeenCalledWith(address);
    });

    it('atualiza todos os campos do endereço', async () => {
      const address = makeAddress();
      const req = makeReq({
        params: { id: '1' },
        body: {
          rua: 'Rua Nova',
          numero: '500',
          bairro: 'Jardim',
          cidade: 'Campo Mourão',
          estado: 'PR',
          cep: '87300-000',
        },
      });
      const res = mockRes();

      (AddressModel.findByPk as jest.Mock).mockResolvedValue(address);

      updateAddress(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(address.update).toHaveBeenCalledWith({
        rua: 'Rua Nova',
        numero: '500',
        bairro: 'Jardim',
        cidade: 'Campo Mourão',
        estado: 'PR',
        cep: '87300-000',
      });
      expect(res.json).toHaveBeenCalledWith(address);
    });

    it('passa AppError 404 quando não encontrado', async () => {
      const req = makeReq({ params: { id: '999' }, body: {} });
      const res = mockRes();

      (AddressModel.findByPk as jest.Mock).mockResolvedValue(null);

      updateAddress(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── deleteAddress ────────────────────────────────────────────────────────
  describe('deleteAddress', () => {
    it('deleta endereço com sucesso', async () => {
      const address = makeAddress();
      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      (AddressModel.findByPk as jest.Mock).mockResolvedValue(address);

      deleteAddress(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(address.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Endereço removido com sucesso' });
    });

    it('passa AppError 404 quando não encontrado', async () => {
      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      (AddressModel.findByPk as jest.Mock).mockResolvedValue(null);

      deleteAddress(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });
});
