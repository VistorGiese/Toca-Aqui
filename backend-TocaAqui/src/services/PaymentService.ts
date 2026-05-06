import PaymentModel, { PaymentStatus, PaymentType } from '../models/PaymentModel';
import ContractModel from '../models/ContractModel';
import { AppError } from '../errors/AppError';

export interface CreatePaymentData {
  contrato_id: number;
  tipo: PaymentType;
  valor: number;
  data_vencimento?: Date;
  stripe_payment_intent_id?: string;
}

export class PaymentService {
  async createPayment(data: CreatePaymentData): Promise<PaymentModel> {
    return PaymentModel.create({
      ...data,
      status: PaymentStatus.PENDENTE,
      tentativas: 0,
    });
  }

  async getByContract(contratoId: number): Promise<PaymentModel[]> {
    return PaymentModel.findAll({
      where: { contrato_id: contratoId },
      order: [['created_at', 'ASC']],
    });
  }

  async getById(paymentId: number): Promise<PaymentModel> {
    const payment = await PaymentModel.findByPk(paymentId, {
      include: [{ association: 'Contract' }],
    });
    if (!payment) throw new AppError('Pagamento não encontrado', 404);
    return payment;
  }

  async updateStatus(
    paymentId: number,
    status: PaymentStatus,
    stripeData?: { charge_id?: string; payment_method?: string; error?: string }
  ): Promise<PaymentModel> {
    const payment = await PaymentModel.findByPk(paymentId);
    if (!payment) throw new AppError('Pagamento não encontrado', 404);

    const updateData: Partial<PaymentModel> = { status } as any;

    if (status === PaymentStatus.PAGO) {
      (updateData as any).data_pagamento = new Date();
    }
    if (stripeData?.charge_id) {
      (updateData as any).stripe_charge_id = stripeData.charge_id;
    }
    if (stripeData?.payment_method) {
      (updateData as any).metodo_pagamento = stripeData.payment_method;
    }
    if (stripeData?.error) {
      (updateData as any).erro_mensagem = stripeData.error;
      (updateData as any).tentativas = payment.tentativas + 1;
    }

    await payment.update(updateData as any);
    return payment.reload();
  }

  async findByStripePaymentIntent(paymentIntentId: string): Promise<PaymentModel | null> {
    return PaymentModel.findOne({
      where: { stripe_payment_intent_id: paymentIntentId },
      include: [{ association: 'Contract' }],
    });
  }
}

export const paymentService = new PaymentService();
