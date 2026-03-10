import cron from 'node-cron';
import { Op } from 'sequelize';
import BookingModel, { BookingStatus } from '../models/BookingModel';
import redisService from '../config/redis';

const markPastEventsAsRealizado = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const [updated] = await BookingModel.update(
      { status: BookingStatus.REALIZADO },
      {
        where: {
          data_show: { [Op.lt]: today },
          status: { [Op.in]: [BookingStatus.PENDENTE, BookingStatus.ACEITO] },
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

export const initCronJobs = () => {
  // Roda todo dia às 00:05
  cron.schedule('5 0 * * *', markPastEventsAsRealizado, {
    timezone: 'America/Sao_Paulo',
  });

  console.log('[CronService] Jobs agendados.');

  // Executa imediatamente na inicialização para cobrir eventos perdidos
  markPastEventsAsRealizado();
};
