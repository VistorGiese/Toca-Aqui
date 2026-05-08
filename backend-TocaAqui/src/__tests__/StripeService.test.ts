process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../config/stripe', () => ({
  isStripeConfigured: jest.fn(),
  getStripe: jest.fn(),
}));

jest.mock('../config/env', () => ({
  env: { STRIPE_WEBHOOK_SECRET: 'whsec_test' },
}));

jest.mock('../models/ContractModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
  ContractStatus: { ACEITO: 'aceito', CONCLUIDO: 'concluido' },
}));

jest.mock('../models/PaymentModel', () => ({
  __esModule: true,
  default: {},
  PaymentStatus: { PAGO: 'pago', FALHOU: 'falhou', REEMBOLSADO: 'reembolsado', PENDENTE: 'pendente' },
  PaymentType: { SINAL: 'sinal', RESTANTE: 'restante' },
}));

jest.mock('../services/PaymentService', () => ({
  paymentService: {
    createPayment: jest.fn(),
    getById: jest.fn(),
    findByStripePaymentIntent: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

jest.mock('../services/NotificationService', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../models/NotificationModel', () => ({
  NotificationType: {
    PAGAMENTO_RECEBIDO: 'pagamento_recebido',
    PAGAMENTO_PENDENTE: 'pagamento_pendente',
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

jest.mock('../errors/AppError', () => ({
  AppError: class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

import { isStripeConfigured, getStripe } from '../config/stripe';
import { stripeService } from '../services/StripeService';
import ContractModel from '../models/ContractModel';
import { paymentService } from '../services/PaymentService';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';

const mockIsStripeConfigured = isStripeConfigured as jest.Mock;
const mockGetStripe = getStripe as jest.Mock;

const mockPaymentIntentsCreate = jest.fn();
const mockPaymentIntentsRetrieve = jest.fn();
const mockWebhooksConstructEvent = jest.fn();
const mockRefundsCreate = jest.fn();

const mockStripeInstance = {
  paymentIntents: { create: mockPaymentIntentsCreate, retrieve: mockPaymentIntentsRetrieve },
  webhooks: { constructEvent: mockWebhooksConstructEvent },
  refunds: { create: mockRefundsCreate },
};

const makeContrato = (overrides = {}) => ({
  id: 1,
  perfil_estabelecimento_id: 2,
  banda_id: 3,
  valor_sinal: 300,
  cache_total: 1000,
  data_pagamento_sinal: '2026-06-01',
  data_pagamento_restante: '2026-06-15',
  update: jest.fn(),
  ...overrides,
});

describe('StripeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStripe.mockReturnValue(mockStripeInstance);
    (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 10 });
    (BandMemberModel.findOne as jest.Mock).mockResolvedValue({ ArtistProfile: { usuario_id: 20 } });
  });

  // ─── createSignalPayment ───────────────────────────────────────────────────
  describe('createSignalPayment', () => {
    it('lança 503 quando Stripe não configurado', async () => {
      mockIsStripeConfigured.mockReturnValue(false);
      await expect(stripeService.createSignalPayment(1)).rejects.toMatchObject({ statusCode: 503 });
    });

    it('lança 404 quando contrato não encontrado', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(stripeService.createSignalPayment(99)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('lança 400 quando valor_sinal é zero ou negativo', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContrato({ valor_sinal: 0 }));
      await expect(stripeService.createSignalPayment(1)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('cria PaymentIntent e retorna paymentId e clientSecret', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContrato());
      mockPaymentIntentsCreate.mockResolvedValue({ id: 'pi_123', client_secret: 'cs_signal' });
      (paymentService.createPayment as jest.Mock).mockResolvedValue({ id: 10 });

      const result = await stripeService.createSignalPayment(1);

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 30000, currency: 'brl' })
      );
      expect(result).toEqual({ paymentId: 10, clientSecret: 'cs_signal' });
    });

    it('inclui metadata correta no PaymentIntent', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContrato());
      mockPaymentIntentsCreate.mockResolvedValue({ id: 'pi_123', client_secret: 'cs_signal' });
      (paymentService.createPayment as jest.Mock).mockResolvedValue({ id: 10 });

      await stripeService.createSignalPayment(1);

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ tipo: 'sinal', plataforma: 'toca_aqui' }),
        })
      );
    });
  });

  // ─── createBalancePayment ──────────────────────────────────────────────────
  describe('createBalancePayment', () => {
    it('lança 503 quando Stripe não configurado', async () => {
      mockIsStripeConfigured.mockReturnValue(false);
      await expect(stripeService.createBalancePayment(1)).rejects.toMatchObject({ statusCode: 503 });
    });

    it('lança 404 quando contrato não encontrado', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(stripeService.createBalancePayment(99)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('retorna {paymentId:0, clientSecret:""} quando valor restante <= 0', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContrato({ cache_total: 300, valor_sinal: 300 }));

      const result = await stripeService.createBalancePayment(1);

      expect(result).toEqual({ paymentId: 0, clientSecret: '' });
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    });

    it('cria PaymentIntent do restante com valor correto', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContrato({ cache_total: 1000, valor_sinal: 300 }));
      mockPaymentIntentsCreate.mockResolvedValue({ id: 'pi_456', client_secret: 'cs_balance' });
      (paymentService.createPayment as jest.Mock).mockResolvedValue({ id: 20 });

      const result = await stripeService.createBalancePayment(1);

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 70000, currency: 'brl' })
      );
      expect(result).toEqual({ paymentId: 20, clientSecret: 'cs_balance' });
    });
  });

  // ─── getPaymentClientSecret ────────────────────────────────────────────────
  describe('getPaymentClientSecret', () => {
    it('lança 503 quando Stripe não configurado', async () => {
      mockIsStripeConfigured.mockReturnValue(false);
      await expect(stripeService.getPaymentClientSecret(1)).rejects.toMatchObject({ statusCode: 503 });
    });

    it('lança 400 quando pagamento não possui stripe_payment_intent_id', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (paymentService.getById as jest.Mock).mockResolvedValue({ id: 1, stripe_payment_intent_id: null });
      await expect(stripeService.getPaymentClientSecret(1)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('lança 500 quando PaymentIntent não retorna client_secret', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (paymentService.getById as jest.Mock).mockResolvedValue({ id: 1, stripe_payment_intent_id: 'pi_123' });
      mockPaymentIntentsRetrieve.mockResolvedValue({ client_secret: null });
      await expect(stripeService.getPaymentClientSecret(1)).rejects.toMatchObject({ statusCode: 500 });
    });

    it('retorna client_secret com sucesso', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (paymentService.getById as jest.Mock).mockResolvedValue({ id: 1, stripe_payment_intent_id: 'pi_123' });
      mockPaymentIntentsRetrieve.mockResolvedValue({ client_secret: 'cs_test_secret' });

      const result = await stripeService.getPaymentClientSecret(1);
      expect(result).toBe('cs_test_secret');
    });
  });

  // ─── handleWebhook ─────────────────────────────────────────────────────────
  describe('handleWebhook', () => {
    const payload = Buffer.from('{}');
    const signature = 'sig_test';

    it('lança 503 quando Stripe não configurado', async () => {
      mockIsStripeConfigured.mockReturnValue(false);
      await expect(stripeService.handleWebhook(payload, signature)).rejects.toMatchObject({ statusCode: 503 });
    });

    it('lança 400 com assinatura de webhook inválida', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      mockWebhooksConstructEvent.mockImplementation(() => { throw new Error('invalid signature'); });
      await expect(stripeService.handleWebhook(payload, signature)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('processa payment_intent.succeeded e atualiza status para PAGO', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      const paymentIntent = { id: 'pi_123', latest_charge: 'ch_1', payment_method_types: ['card'] };
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: paymentIntent },
      });
      const mockPayment = { id: 5, contrato_id: 1, tipo: 'restante', valor: 700 };
      (paymentService.findByStripePaymentIntent as jest.Mock).mockResolvedValue(mockPayment);
      (paymentService.updateStatus as jest.Mock).mockResolvedValue(undefined);
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContrato());

      await stripeService.handleWebhook(payload, signature);

      expect(paymentService.updateStatus).toHaveBeenCalledWith(5, 'pago', expect.any(Object));
    });

    it('processa payment_intent.succeeded tipo SINAL e cria pagamento do restante', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      const paymentIntent = { id: 'pi_sinal', latest_charge: 'ch_2', payment_method_types: ['card'] };
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: paymentIntent },
      });
      const mockPayment = { id: 6, contrato_id: 1, tipo: 'sinal', valor: 300 };
      (paymentService.findByStripePaymentIntent as jest.Mock).mockResolvedValue(mockPayment);
      (paymentService.updateStatus as jest.Mock).mockResolvedValue(undefined);
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(makeContrato({ cache_total: 1000, valor_sinal: 300 }));
      mockPaymentIntentsCreate.mockResolvedValue({ id: 'pi_balance', client_secret: 'cs_balance' });
      (paymentService.createPayment as jest.Mock).mockResolvedValue({ id: 7 });

      await stripeService.handleWebhook(payload, signature);

      expect(mockPaymentIntentsCreate).toHaveBeenCalled();
    });

    it('não faz nada quando PaymentIntent não encontrado no banco (succeeded)', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_unknown' } },
      });
      (paymentService.findByStripePaymentIntent as jest.Mock).mockResolvedValue(null);

      await expect(stripeService.handleWebhook(payload, signature)).resolves.toBeUndefined();
      expect(paymentService.updateStatus).not.toHaveBeenCalled();
    });

    it('processa payment_intent.payment_failed e atualiza status para FALHOU', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      const paymentIntent = { id: 'pi_fail', last_payment_error: { message: 'Card declined' } };
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'payment_intent.payment_failed',
        data: { object: paymentIntent },
      });
      (paymentService.findByStripePaymentIntent as jest.Mock).mockResolvedValue({ id: 7 });
      (paymentService.updateStatus as jest.Mock).mockResolvedValue(undefined);

      await stripeService.handleWebhook(payload, signature);

      expect(paymentService.updateStatus).toHaveBeenCalledWith(7, 'falhou', { error: 'Card declined' });
    });

    it('processa charge.refunded e atualiza status para REEMBOLSADO', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'charge.refunded',
        data: { object: { payment_intent: 'pi_refund' } },
      });
      (paymentService.findByStripePaymentIntent as jest.Mock).mockResolvedValue({ id: 8 });
      (paymentService.updateStatus as jest.Mock).mockResolvedValue(undefined);

      await stripeService.handleWebhook(payload, signature);

      expect(paymentService.updateStatus).toHaveBeenCalledWith(8, 'reembolsado');
    });

    it('ignora eventos não tratados sem erro', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.created',
        data: { object: {} },
      });

      await expect(stripeService.handleWebhook(payload, signature)).resolves.toBeUndefined();
    });
  });

  // ─── refundPayment ─────────────────────────────────────────────────────────
  describe('refundPayment', () => {
    it('lança 503 quando Stripe não configurado', async () => {
      mockIsStripeConfigured.mockReturnValue(false);
      await expect(stripeService.refundPayment(1)).rejects.toMatchObject({ statusCode: 503 });
    });

    it('lança 400 quando pagamento não está com status PAGO', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (paymentService.getById as jest.Mock).mockResolvedValue({ id: 1, status: 'pendente', stripe_payment_intent_id: 'pi_1' });
      await expect(stripeService.refundPayment(1)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('lança 400 quando pagamento não possui stripe_payment_intent_id', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (paymentService.getById as jest.Mock).mockResolvedValue({ id: 1, status: 'pago', stripe_payment_intent_id: null });
      await expect(stripeService.refundPayment(1)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('cria reembolso total sem amount', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (paymentService.getById as jest.Mock).mockResolvedValue({ id: 1, status: 'pago', stripe_payment_intent_id: 'pi_paid' });
      mockRefundsCreate.mockResolvedValue({});

      await stripeService.refundPayment(1);

      expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: 'pi_paid' });
    });

    it('cria reembolso parcial com amount em centavos', async () => {
      mockIsStripeConfigured.mockReturnValue(true);
      (paymentService.getById as jest.Mock).mockResolvedValue({ id: 1, status: 'pago', stripe_payment_intent_id: 'pi_paid' });
      mockRefundsCreate.mockResolvedValue({});

      await stripeService.refundPayment(1, 150);

      expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: 'pi_paid', amount: 15000 });
    });
  });
});
