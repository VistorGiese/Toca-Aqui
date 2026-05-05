process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/PaymentModel', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
  PaymentStatus: {
    PENDENTE: 'pendente',
    PAGO: 'pago',
    FALHOU: 'falhou',
    REEMBOLSADO: 'reembolsado',
  },
  PaymentType: {
    SINAL: 'sinal',
    RESTANTE: 'restante',
  },
}));

jest.mock('../models/ContractModel', () => ({
  __esModule: true,
  default: {},
}));

import { PaymentService } from '../services/PaymentService';
import PaymentModel from '../models/PaymentModel';

const service = new PaymentService();

const makePayment = (overrides = {}) => ({
  id: 1,
  contrato_id: 10,
  tipo: 'sinal',
  valor: 2500,
  status: 'pendente',
  tentativas: 0,
  stripe_payment_intent_id: 'pi_test_123',
  update: jest.fn().mockResolvedValue(undefined),
  reload: jest.fn().mockImplementation(function (this: any) { return Promise.resolve(this); }),
  ...overrides,
});

describe('PaymentService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── createPayment ────────────────────────────────────────────────────────
  describe('createPayment', () => {
    it('cria pagamento com status pendente', async () => {
      const payment = makePayment();
      (PaymentModel.create as jest.Mock).mockResolvedValue(payment);

      const result = await service.createPayment({
        contrato_id: 10,
        tipo: 'sinal' as any,
        valor: 2500,
      });

      expect(PaymentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          contrato_id: 10,
          status: 'pendente',
          tentativas: 0,
        })
      );
      expect(result).toBe(payment);
    });
  });

  // ─── getByContract ────────────────────────────────────────────────────────
  describe('getByContract', () => {
    it('retorna pagamentos do contrato', async () => {
      const payments = [makePayment(), makePayment({ id: 2 })];
      (PaymentModel.findAll as jest.Mock).mockResolvedValue(payments);

      const result = await service.getByContract(10);

      expect(PaymentModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { contrato_id: 10 } })
      );
      expect(result).toHaveLength(2);
    });
  });

  // ─── getById ──────────────────────────────────────────────────────────────
  describe('getById', () => {
    it('retorna pagamento pelo id', async () => {
      const payment = makePayment();
      (PaymentModel.findByPk as jest.Mock).mockResolvedValue(payment);

      const result = await service.getById(1);
      expect(result).toBe(payment);
    });

    it('lança 404 quando não encontrado', async () => {
      (PaymentModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── updateStatus ─────────────────────────────────────────────────────────
  describe('updateStatus', () => {
    it('atualiza status para pago com data_pagamento', async () => {
      const payment = makePayment();
      (PaymentModel.findByPk as jest.Mock).mockResolvedValue(payment);

      await service.updateStatus(1, 'pago' as any, {
        charge_id: 'ch_test',
        payment_method: 'card',
      });

      expect(payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pago',
          data_pagamento: expect.any(Date),
          stripe_charge_id: 'ch_test',
          metodo_pagamento: 'card',
        })
      );
    });

    it('atualiza status com erro e incrementa tentativas', async () => {
      const payment = makePayment({ tentativas: 2 });
      (PaymentModel.findByPk as jest.Mock).mockResolvedValue(payment);

      await service.updateStatus(1, 'falhou' as any, {
        error: 'Cartão recusado',
      });

      expect(payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'falhou',
          erro_mensagem: 'Cartão recusado',
          tentativas: 3,
        })
      );
    });

    it('lança 404 quando pagamento não encontrado', async () => {
      (PaymentModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.updateStatus(999, 'pago' as any)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── findByStripePaymentIntent ────────────────────────────────────────────
  describe('findByStripePaymentIntent', () => {
    it('encontra pagamento pelo payment intent id', async () => {
      const payment = makePayment();
      (PaymentModel.findOne as jest.Mock).mockResolvedValue(payment);

      const result = await service.findByStripePaymentIntent('pi_test_123');

      expect(PaymentModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stripe_payment_intent_id: 'pi_test_123' },
        })
      );
      expect(result).toBe(payment);
    });

    it('retorna null quando não encontrado', async () => {
      (PaymentModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findByStripePaymentIntent('pi_unknown');
      expect(result).toBeNull();
    });
  });
});
