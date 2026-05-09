import cron from 'node-cron';
import { Op } from 'sequelize';
import BookingModel, { BookingStatus } from '../models/BookingModel';
import ContractModel, { ContractStatus } from '../models/ContractModel';
import PaymentModel, { PaymentStatus } from '../models/PaymentModel';
import { createNotification } from './NotificationService';
import { NotificationType } from '../models/NotificationModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import redisService from '../config/redis';

const markPastEventsAsRealizado = async () => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    const [updated] = await BookingModel.update(
      { status: BookingStatus.REALIZADO },
      {
        where: {
          status: { [Op.in]: [BookingStatus.PENDENTE, BookingStatus.ACEITO] },
          [Op.or]: [
            { data_show: { [Op.lt]: todayStr } },
            { data_show: todayStr, horario_fim: { [Op.lte]: currentTime } },
          ],
        },
      }
    );

    if (updated > 0) {
      console.log(`[CronService] ${updated} evento(s) marcado(s) como realizado.`);
      await redisService.invalidatePattern('agendamentos:*');
    }
  } catch (error) {
    console.error('[CronService] Erro ao atualizar status de eventos:', error);
  }
};

/**
 * Marca contratos como concluídos quando:
 * - O evento já passou
 * - O contrato está aceito
 * - Todos os pagamentos estão pagos
 */
const completeFinishedContracts = async () => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    const contratosAceitos = await ContractModel.findAll({
      where: {
        status: ContractStatus.ACEITO,
        [Op.or]: [
          { data_evento: { [Op.lt]: todayStr } },
          { data_evento: todayStr, horario_fim: { [Op.lte]: currentTime } },
        ],
      },
      include: [{
        association: 'Payments',
        required: false,
      }],
    });

    for (const contrato of contratosAceitos) {
      const payments = (contrato as any).Payments as PaymentModel[];

      // Verificar se todos os pagamentos estão pagos (ou não há pagamentos)
      const allPaid = !payments.length || payments.every(p => p.status === PaymentStatus.PAGO);

      if (allPaid) {
        await contrato.update({ status: ContractStatus.CONCLUIDO });
        console.log(`[CronService] Contrato ${contrato.id} concluído.`);
      }
    }

    await redisService.invalidatePattern('contratos:*');
  } catch (error) {
    console.error('[CronService] Erro ao concluir contratos:', error);
  }
};

/**
 * Envia lembretes de pagamento para vencimentos próximos (3 dias).
 */
const sendPaymentReminders = async () => {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const todayStr = today.toISOString().split('T')[0];
    const futureStr = threeDaysFromNow.toISOString().split('T')[0];

    const pendingPayments = await PaymentModel.findAll({
      where: {
        status: PaymentStatus.PENDENTE,
        data_vencimento: {
          [Op.between]: [todayStr, futureStr],
        },
      },
      include: [{ association: 'Contract' }],
    });

    for (const payment of pendingPayments) {
      const contrato = (payment as any).Contract as ContractModel;
      if (!contrato) continue;

      const msg = `Lembrete: pagamento de R$ ${Number(payment.valor).toFixed(2)} (${payment.tipo}) vence em ${payment.data_vencimento}.`;

      // Notificar estabelecimento
      const estab = await EstablishmentProfileModel.findByPk(contrato.perfil_estabelecimento_id);
      if (estab) {
        await createNotification(estab.usuario_id, NotificationType.PAGAMENTO_PENDENTE, msg, 'pagamento', payment.id!);
      }

      // Notificar contratado (artista individual ou líder de banda)
      if (contrato.artista_id) {
        const artista = await ArtistProfileModel.findByPk(contrato.artista_id);
        if (artista) {
          await createNotification(artista.usuario_id, NotificationType.PAGAMENTO_PENDENTE, msg, 'pagamento', payment.id!);
        }
      } else if (contrato.banda_id) {
        const lider = await BandMemberModel.findOne({
          where: { banda_id: contrato.banda_id, e_lider: true },
          include: [{ association: 'ArtistProfile', attributes: ['usuario_id'] }],
        });
        const liderUserId = (lider as any)?.ArtistProfile?.usuario_id;
        if (liderUserId) {
          await createNotification(liderUserId, NotificationType.PAGAMENTO_PENDENTE, msg, 'pagamento', payment.id!);
        }
      }
    }
  } catch (error) {
    console.error('[CronService] Erro ao enviar lembretes de pagamento:', error);
  }
};

export const initCronJobs = () => {
  // Roda a cada 15 minutos — marca eventos encerrados como realizados
  cron.schedule('*/15 * * * *', markPastEventsAsRealizado, {
    timezone: 'America/Sao_Paulo',
  });

  // Roda a cada 15 minutos — conclui contratos de eventos encerrados
  cron.schedule('*/15 * * * *', completeFinishedContracts, {
    timezone: 'America/Sao_Paulo',
  });

  // Roda todo dia às 09:00 — envia lembretes de pagamento
  cron.schedule('0 9 * * *', sendPaymentReminders, {
    timezone: 'America/Sao_Paulo',
  });

  console.log('[CronService] Jobs agendados.');

  // Executa imediatamente na inicialização para cobrir eventos perdidos
  markPastEventsAsRealizado();
  completeFinishedContracts();
};
