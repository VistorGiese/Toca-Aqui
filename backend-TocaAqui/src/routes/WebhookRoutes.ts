import { Router } from 'express';
// STRIPE — previsto para produção, desativado no MVP/TCC
// import { handleStripeWebhook } from '../controllers/StripeWebhookController';

const router = Router();

// // Stripe webhook — recebe body raw (não JSON-parsed)
// router.post('/stripe', handleStripeWebhook);

export default router;
