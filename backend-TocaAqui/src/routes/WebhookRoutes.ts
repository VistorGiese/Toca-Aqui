import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/StripeWebhookController';

const router = Router();

// Stripe webhook — recebe body raw (não JSON-parsed)
router.post('/stripe', handleStripeWebhook);

export default router;
