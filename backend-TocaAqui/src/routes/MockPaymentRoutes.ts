import { Router } from 'express';
import { mockCriarSinal, mockConfirmarPagamento } from '../controllers/MockPaymentController';

const router = Router();

// @dev APENAS PARA DESENVOLVIMENTO E TCC — simula fluxo completo do Stripe

// Simula StripeService.createSignalPayment()
// Em produção: POST /pagamentos/contrato/:id/sinal
router.post('/mock-pagamento/sinal', mockCriarSinal);

// Simula webhook payment_intent.succeeded / payment_intent.payment_failed
// Em produção: POST /webhooks/stripe
router.post('/mock-pagamento/confirmar', mockConfirmarPagamento);

export default router;
