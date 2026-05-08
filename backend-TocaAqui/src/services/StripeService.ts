import { getStripe, isStripeConfigured } from '../config/stripe';
import { env } from '../config/env';
import ContractModel, { ContractStatus } from '../models/ContractModel';
import { PaymentStatus, PaymentType } from '../models/PaymentModel';
import { paymentService } from './PaymentService';
import { createNotification } from './NotificationService';
import { NotificationType } from '../models/NotificationModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import { AppError } from '../errors/AppError';

export class StripeService {
  /**
   * Cria o pagamento do sinal quando o contrato é aceito por ambas as partes.
   */
  async createSignalPayment(contractId: number): Promise<{ paymentId: number; clientSecret: string }> {
    if (!isStripeConfigured()) throw new AppError('Stripe não configurado. Configure STRIPE_SECRET_KEY para habilitar pagamentos.', 503);

    const contrato = await ContractModel.findByPk(contractId);
    if (!contrato) throw new AppError('Contrato não encontrado', 404);

    const valorSinal = Number(contrato.valor_sinal);
    if (valorSinal <= 0) throw new AppError('Valor do sinal deve ser positivo', 400);

    const stripe = getStripe();

    // Criar PaymentIntent no Stripe (valor em centavos)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(valorSinal * 100),
      currency: 'brl',
      metadata: {
        contrato_id: String(contractId),
        tipo: 'sinal',
        plataforma: 'toca_aqui',
      },
    });

    // Criar registro de pagamento
    const payment = await paymentService.createPayment({
      contrato_id: contractId,
      tipo: PaymentType.SINAL,
      valor: valorSinal,
      data_vencimento: contrato.data_pagamento_sinal || undefined,
      stripe_payment_intent_id: paymentIntent.id,
    });

    return {
      paymentId: payment.id!,
      clientSecret: paymentIntent.client_secret!,
    };
  }

  /**
   * Cria o pagamento do restante após o sinal ser confirmado.
   */
  async createBalancePayment(contractId: number): Promise<{ paymentId: number; clientSecret: string }> {
    if (!isStripeConfigured()) throw new AppError('Stripe não configurado. Configure STRIPE_SECRET_KEY para habilitar pagamentos.', 503);

    const contrato = await ContractModel.findByPk(contractId);
    if (!contrato) throw new AppError('Contrato não encontrado', 404);

    const valorRestante = Number(contrato.cache_total) - Number(contrato.valor_sinal);
    if (valorRestante <= 0) return { paymentId: 0, clientSecret: '' };

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(valorRestante * 100),
      currency: 'brl',
      metadata: {
        contrato_id: String(contractId),
        tipo: 'restante',
        plataforma: 'toca_aqui',
      },
    });

    const payment = await paymentService.createPayment({
      contrato_id: contractId,
      tipo: PaymentType.RESTANTE,
      valor: valorRestante,
      data_vencimento: contrato.data_pagamento_restante || undefined,
      stripe_payment_intent_id: paymentIntent.id,
    });

    return {
      paymentId: payment.id!,
      clientSecret: paymentIntent.client_secret!,
    };
  }

  /**
   * Retorna o client_secret de um PaymentIntent existente para o frontend confirmar.
   */
  async getPaymentClientSecret(paymentId: number): Promise<string> {
    if (!isStripeConfigured()) throw new AppError('Stripe não configurado. Configure STRIPE_SECRET_KEY para habilitar pagamentos.', 503);

    const payment = await paymentService.getById(paymentId);
    if (!payment.stripe_payment_intent_id) {
      throw new AppError('Pagamento não possui PaymentIntent associado', 400);
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);

    if (!paymentIntent.client_secret) {
      throw new AppError('Não foi possível recuperar client_secret', 500);
    }

    return paymentIntent.client_secret;
  }

  /**
   * Processa webhook do Stripe para atualizar status dos pagamentos.
   */
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!isStripeConfigured()) throw new AppError('Stripe não configurado. Configure STRIPE_SECRET_KEY para habilitar pagamentos.', 503);

    const stripe = getStripe();

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      throw new AppError('Assinatura de webhook inválida', 400);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;

      case 'charge.refunded':
        await this.handleRefund(event.data.object);
        break;

      default:
        console.log(`[Stripe Webhook] Evento não tratado: ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    const payment = await paymentService.findByStripePaymentIntent(paymentIntent.id);
    if (!payment) {
      console.warn(`[Stripe] PaymentIntent ${paymentIntent.id} não encontrado no banco`);
      return;
    }

    await paymentService.updateStatus(payment.id!, PaymentStatus.PAGO, {
      charge_id: paymentIntent.latest_charge,
      payment_method: paymentIntent.payment_method_types?.[0],
    });

    const contrato = await ContractModel.findByPk(payment.contrato_id);
    if (!contrato) return;

    // Notificar ambas as partes
    await this.notifyBothParties(
      contrato,
      NotificationType.PAGAMENTO_RECEBIDO,
      `Pagamento de R$ ${Number(payment.valor).toFixed(2)} (${payment.tipo}) confirmado para o contrato.`
    );

    // Se era sinal, criar pagamento do restante
    if (payment.tipo === PaymentType.SINAL) {
      const valorRestante = Number(contrato.cache_total) - Number(contrato.valor_sinal);
      if (valorRestante > 0) {
        await this.createBalancePayment(contrato.id);

        await this.notifyBothParties(
          contrato,
          NotificationType.PAGAMENTO_PENDENTE,
          `Sinal confirmado! Pagamento restante de R$ ${valorRestante.toFixed(2)} disponível.`
        );
      }
    }
  }

  private async handlePaymentFailure(paymentIntent: any): Promise<void> {
    const payment = await paymentService.findByStripePaymentIntent(paymentIntent.id);
    if (!payment) return;

    await paymentService.updateStatus(payment.id!, PaymentStatus.FALHOU, {
      error: paymentIntent.last_payment_error?.message || 'Pagamento falhou',
    });

    const contrato = await ContractModel.findByPk(payment.contrato_id);
    if (!contrato) return;

    const msg = `Falha no pagamento de R$ ${Number(payment.valor).toFixed(2)} (${payment.tipo}). Verifique os dados de pagamento e tente novamente.`;
    await this.notifyBothParties(contrato, NotificationType.PAGAMENTO_FALHOU, msg);
  }

  private async handleRefund(charge: any): Promise<void> {
    const payment = await paymentService.findByStripePaymentIntent(charge.payment_intent);
    if (!payment) return;

    await paymentService.updateStatus(payment.id!, PaymentStatus.REEMBOLSADO);
  }

  /**
   * Cria um reembolso total ou parcial.
   */
  async refundPayment(paymentId: number, amount?: number): Promise<void> {
    if (!isStripeConfigured()) throw new AppError('Stripe não configurado. Configure STRIPE_SECRET_KEY para habilitar pagamentos.', 503);

    const payment = await paymentService.getById(paymentId);
    if (payment.status !== PaymentStatus.PAGO) {
      throw new AppError('Apenas pagamentos confirmados podem ser reembolsados', 400);
    }
    if (!payment.stripe_payment_intent_id) {
      throw new AppError('Pagamento não possui PaymentIntent', 400);
    }

    const stripe = getStripe();
    const refundData: any = { payment_intent: payment.stripe_payment_intent_id };
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    await stripe.refunds.create(refundData);
    // Status será atualizado via webhook (charge.refunded)
  }

  private async notifyBothParties(
    contrato: ContractModel,
    tipo: NotificationType,
    mensagem: string
  ): Promise<void> {
    // Notificar estabelecimento
    const estab = await EstablishmentProfileModel.findByPk(contrato.perfil_estabelecimento_id);
    if (estab) {
      await createNotification(estab.usuario_id, tipo, mensagem, 'contrato', contrato.id);
    }

    // Notificar líder da banda
    const lider = await BandMemberModel.findOne({
      where: { banda_id: contrato.banda_id, e_lider: true },
      include: [{ association: 'ArtistProfile', attributes: ['usuario_id'] }],
    });
    const liderUserId = (lider as any)?.ArtistProfile?.usuario_id;
    if (liderUserId) {
      await createNotification(liderUserId, tipo, mensagem, 'contrato', contrato.id);
    }
  }
}

export const stripeService = new StripeService();
