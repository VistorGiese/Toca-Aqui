process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../services/PaymentService', () => ({
  paymentService: {
    getByContract: jest.fn(),
    getById: jest.fn(),
  },
}));

jest.mock('../services/StripeService', () => ({
  stripeService: {
    getPaymentClientSecret: jest.fn(),
    createSignalPayment: jest.fn(),
  },
}));

jest.mock('../services/ContractService', () => ({
  contractService: {
    getUserRole: jest.fn(),
  },
}));

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import {
  getPaymentsForContract,
  getPayment,
  initiatePayment,
  createSignalPayment,
} from '../controllers/PaymentController';
import { paymentService } from '../services/PaymentService';
import { stripeService } from '../services/StripeService';
import { contractService } from '../services/ContractService';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

describe('PaymentController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── getPaymentsForContract ───────────────────────────────────────────────
  describe('getPaymentsForContract', () => {
    it('retorna pagamentos do contrato', async () => {
      const payments = [{ id: 1 }, { id: 2 }];
      const req = makeReq({ user: { id: 1 }, params: { contrato_id: '10' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (paymentService.getByContract as jest.Mock).mockResolvedValue(payments);

      getPaymentsForContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({ data: payments });
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { contrato_id: '10' } });
      const res = mockRes();

      getPaymentsForContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('passa AppError 403 quando sem acesso', async () => {
      const req = makeReq({ user: { id: 1 }, params: { contrato_id: '10' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue(null);

      getPaymentsForContract(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  // ─── getPayment ───────────────────────────────────────────────────────────
  describe('getPayment', () => {
    it('retorna pagamento pelo id', async () => {
      const payment = { id: 1, contrato_id: 10 };
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (paymentService.getById as jest.Mock).mockResolvedValue(payment);
      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');

      getPayment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(payment);
    });

    it('passa AppError 403 quando sem acesso ao contrato', async () => {
      const payment = { id: 1, contrato_id: 10 };
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (paymentService.getById as jest.Mock).mockResolvedValue(payment);
      (contractService.getUserRole as jest.Mock).mockResolvedValue(null);

      getPayment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  // ─── initiatePayment ─────────────────────────────────────────────────────
  describe('initiatePayment', () => {
    it('retorna client_secret para contratante', async () => {
      const payment = { id: 1, contrato_id: 10 };
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (paymentService.getById as jest.Mock).mockResolvedValue(payment);
      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (stripeService.getPaymentClientSecret as jest.Mock).mockResolvedValue('secret_test');

      initiatePayment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({ client_secret: 'secret_test' });
    });

    it('passa AppError 403 quando não é contratante', async () => {
      const payment = { id: 1, contrato_id: 10 };
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (paymentService.getById as jest.Mock).mockResolvedValue(payment);
      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratado');

      initiatePayment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  // ─── createSignalPayment ─────────────────────────────────────────────────
  describe('createSignalPayment', () => {
    it('cria pagamento de sinal e retorna 201', async () => {
      const result = { paymentId: 1, clientSecret: 'secret' };
      const req = makeReq({ user: { id: 1 }, params: { contrato_id: '10' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratante');
      (stripeService.createSignalPayment as jest.Mock).mockResolvedValue(result);

      createSignalPayment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('passa AppError 403 quando não é contratante', async () => {
      const req = makeReq({ user: { id: 1 }, params: { contrato_id: '10' } });
      const res = mockRes();

      (contractService.getUserRole as jest.Mock).mockResolvedValue('contratado');

      createSignalPayment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });
});
