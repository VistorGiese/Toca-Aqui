import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';
import ContractModel, { ContractStatus, StatusPagamento } from '../models/ContractModel';
import { paymentService } from '../services/PaymentService';
import { PaymentStatus, PaymentType } from '../models/PaymentModel';
import { createNotification } from '../services/NotificationService';
import { NotificationType } from '../models/NotificationModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';

/**
 * @dev APENAS PARA DESENVOLVIMENTO E TCC
 *
 * Simula o fluxo completo do Stripe sem chamar APIs externas.
 * Em produção, substituir por:
 *   - POST /pagamentos/contrato/:id/sinal   → createSignalPayment (StripeService)
 *   - POST /webhooks/stripe                 → handleStripeWebhook (StripeWebhookController)
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function notificarAmbosLados(
  contrato: ContractModel,
  tipo: NotificationType,
  mensagem: string
): Promise<void> {
  // Notificar estabelecimento
  const estab = await EstablishmentProfileModel.findByPk(contrato.perfil_estabelecimento_id);
  if (estab) {
    await createNotification(estab.usuario_id, tipo, mensagem, 'contrato', contrato.id);
  }

  // Notificar artista individual
  if (contrato.artista_id) {
    const artista = await ArtistProfileModel.findByPk(contrato.artista_id);
    if (artista) {
      await createNotification(artista.usuario_id, tipo, mensagem, 'contrato', contrato.id);
    }
  }

  // Notificar líder da banda
  if (contrato.banda_id) {
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

// ─── Endpoint 1: criar pagamento do sinal ────────────────────────────────────

/**
 * @dev Simula StripeService.createSignalPayment()
 *
 * POST /dev/mock-pagamento/sinal
 * Body: { contrato_id: number }
 *
 * Cria o registro de pagamento do sinal na tabela `pagamentos` com status
 * pendente e retorna um mock de client_secret (em produção seria o Stripe).
 */
export const mockCriarSinal = asyncHandler(async (req: Request, res: Response) => {
  const { contrato_id } = req.body;

  if (!contrato_id) {
    throw new AppError('contrato_id é obrigatório', 400);
  }

  const contrato = await ContractModel.findByPk(contrato_id);
  if (!contrato) throw new AppError('Contrato não encontrado', 404);

  if (contrato.status !== ContractStatus.ACEITO) {
    throw new AppError(
      `Pagamento só pode ser iniciado em contratos aceitos. Status atual: '${contrato.status}'`,
      403
    );
  }

  const valorSinal = Number(contrato.valor_sinal);
  if (valorSinal <= 0) throw new AppError('Valor do sinal deve ser positivo', 400);

  const mockPaymentIntentId = `mock_pi_sinal_${contrato_id}_${Date.now()}`;

  const payment = await paymentService.createPayment({
    contrato_id,
    tipo: PaymentType.SINAL,
    valor: valorSinal,
    data_vencimento: contrato.data_pagamento_sinal || undefined,
    stripe_payment_intent_id: mockPaymentIntentId,
  });

  res.status(201).json({
    message: 'Pagamento de sinal criado (mock)',
    paymentId: payment.id,
    clientSecret: `mock_secret_${mockPaymentIntentId}`,
    valor: valorSinal,
  });
});

// ─── Endpoint 2: confirmar pagamento (simula webhook) ────────────────────────

/**
 * @dev Simula o webhook do Stripe (payment_intent.succeeded / payment_intent.payment_failed)
 *
 * POST /dev/mock-pagamento/confirmar
 * Body: { payment_id: number, status: 'pago' | 'falhou' }
 *
 * Processa o resultado do pagamento:
 * - pago:   atualiza payment para PAGO, cria pagamento do restante se era sinal,
 *           notifica ambas as partes, atualiza status_pagamento do contrato
 * - falhou: atualiza payment para FALHOU, notifica ambas as partes,
 *           atualiza status_pagamento do contrato para 'falhou'
 */
export const mockConfirmarPagamento = asyncHandler(async (req: Request, res: Response) => {
  const { payment_id, status } = req.body;

  if (!payment_id || !status) {
    throw new AppError('payment_id e status são obrigatórios', 400);
  }

  if (status !== 'pago' && status !== 'falhou') {
    throw new AppError("status deve ser 'pago' ou 'falhou'", 400);
  }

  const payment = await paymentService.getById(payment_id);
  if (payment.status !== PaymentStatus.PENDENTE) {
    throw new AppError(
      `Pagamento não pode ser processado: status atual é '${payment.status}'`,
      403
    );
  }

  const contrato = await ContractModel.findByPk(payment.contrato_id);
  if (!contrato) throw new AppError('Contrato não encontrado', 404);

  // ── Pagamento aprovado ───────────────────────────────────────────────────
  if (status === 'pago') {
    await paymentService.updateStatus(payment.id!, PaymentStatus.PAGO, {
      charge_id: `mock_ch_${payment.id}_${Date.now()}`,
      payment_method: 'mock_card',
    });

    await notificarAmbosLados(
      contrato,
      NotificationType.PAGAMENTO_RECEBIDO,
      `Pagamento de R$ ${Number(payment.valor).toFixed(2)} (${payment.tipo}) confirmado para o contrato.`
    );

    // Se era o sinal, criar o pagamento do restante
    if (payment.tipo === PaymentType.SINAL) {
      const valorRestante = Number(contrato.cache_total) - Number(contrato.valor_sinal);

      if (valorRestante > 0) {
        const mockIntentRestante = `mock_pi_restante_${contrato.id}_${Date.now()}`;

        await paymentService.createPayment({
          contrato_id: contrato.id,
          tipo: PaymentType.RESTANTE,
          valor: valorRestante,
          data_vencimento: contrato.data_pagamento_restante || undefined,
          stripe_payment_intent_id: mockIntentRestante,
        });

        await notificarAmbosLados(
          contrato,
          NotificationType.PAGAMENTO_PENDENTE,
          `Sinal confirmado! Pagamento restante de R$ ${valorRestante.toFixed(2)} disponível.`
        );
      } else {
        // Sinal cobre 100% do cachê — contrato totalmente pago
        await contrato.update({ status_pagamento: StatusPagamento.PAGO });
      }
    }

    // Se era o restante, contrato está totalmente pago
    if (payment.tipo === PaymentType.RESTANTE) {
      await contrato.update({ status_pagamento: StatusPagamento.PAGO });
    }

    return res.status(200).json({
      message: 'Pagamento confirmado com sucesso (mock)',
      payment: await paymentService.getById(payment.id!),
      contrato,
    });
  }

  // ── Pagamento reprovado ──────────────────────────────────────────────────
  await paymentService.updateStatus(payment.id!, PaymentStatus.FALHOU, {
    error: 'Pagamento recusado (simulado por mock)',
  });

  await contrato.update({ status_pagamento: StatusPagamento.FALHOU });

  await notificarAmbosLados(
    contrato,
    NotificationType.PAGAMENTO_FALHOU,
    `Falha no pagamento de R$ ${Number(payment.valor).toFixed(2)} (${payment.tipo}). Verifique os dados e tente novamente.`
  );

  return res.status(200).json({
    message: 'Falha de pagamento processada (mock)',
    payment: await paymentService.getById(payment.id!),
    contrato,
  });
});
