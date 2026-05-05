import Stripe from 'stripe';
import { env } from './env';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não configurada. Configure no .env para usar pagamentos.');
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    });
  }

  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY;
}
