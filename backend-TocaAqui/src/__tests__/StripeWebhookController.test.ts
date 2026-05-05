process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

jest.mock('../services/StripeService', () => ({
  stripeService: {
    handleWebhook: jest.fn(),
  },
}));

jest.mock('../config/env', () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
    NODE_ENV: 'test',
  },
}));

import { Request, Response } from 'express';
import { handleStripeWebhook } from '../controllers/StripeWebhookController';
import { stripeService } from '../services/StripeService';

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('StripeWebhookController', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('handleStripeWebhook', () => {
    it('processa webhook com sucesso e retorna received: true', async () => {
      const req = {
        headers: { 'stripe-signature': 'sig_test_123' },
        body: Buffer.from('payload'),
      } as unknown as Request;
      const res = mockRes();

      (stripeService.handleWebhook as jest.Mock).mockResolvedValue(undefined);

      await handleStripeWebhook(req, res);

      expect(stripeService.handleWebhook).toHaveBeenCalledWith(
        req.body,
        'sig_test_123'
      );
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('retorna 400 quando stripe-signature header ausente', async () => {
      const req = {
        headers: {},
        body: Buffer.from('payload'),
      } as unknown as Request;
      const res = mockRes();

      await handleStripeWebhook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Stripe signature header ausente' });
    });

    it('retorna 400 quando handleWebhook lança erro', async () => {
      const req = {
        headers: { 'stripe-signature': 'sig_invalid' },
        body: Buffer.from('payload'),
      } as unknown as Request;
      const res = mockRes();

      (stripeService.handleWebhook as jest.Mock).mockRejectedValue(
        new Error('Assinatura inválida')
      );

      await handleStripeWebhook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Assinatura inválida' });
    });

    it('retorna 503 quando STRIPE_WEBHOOK_SECRET não está configurado', async () => {
      // Mock env sem webhook secret
      const envModule = require('../config/env');
      const originalSecret = envModule.env.STRIPE_WEBHOOK_SECRET;
      envModule.env.STRIPE_WEBHOOK_SECRET = '';

      const req = {
        headers: { 'stripe-signature': 'sig_test' },
        body: Buffer.from('payload'),
      } as unknown as Request;
      const res = mockRes();

      await handleStripeWebhook(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({ error: 'Pagamentos não configurados' });

      // Restaurar
      envModule.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    });
  });
});
