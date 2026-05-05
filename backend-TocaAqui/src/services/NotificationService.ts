import NotificationModel, { NotificationType } from '../models/NotificationModel';

export const createNotification = async (
  usuario_id: number,
  tipo: NotificationType,
  mensagem: string,
  referencia_tipo?: string,
  referencia_id?: number
): Promise<void> => {
  try {
    await NotificationModel.create({ usuario_id, tipo, mensagem, referencia_tipo, referencia_id });
  } catch (error) {
    console.error('[NotificationService] Erro ao criar notificação:', error);
  }
};
