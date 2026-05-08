// STRIPE — previsto para produção, desativado no MVP/TCC
// import { Request, Response } from 'express';
// import { stripeService } from '../services/StripeService';
// import { env } from '../config/env';

// export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
//   if (!env.STRIPE_WEBHOOK_SECRET) {
//     res.status(503).json({ error: 'Pagamentos não configurados' });
//     return;
//   }
//
//   const signature = req.headers['stripe-signature'] as string;
//
//   if (!signature) {
//     res.status(400).json({ error: 'Stripe signature header ausente' });
//     return;
//   }
//
//   try {
//     await stripeService.handleWebhook(req.body, signature);
//     res.json({ received: true });
//   } catch (error: any) {
//     console.error('[Stripe Webhook] Erro:', error.message);
//     res.status(400).json({ error: error.message });
//   }
// };
