process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';

jest.mock('../models/NotificationModel', () => ({
  __esModule: true,
  default: { create: jest.fn() },
  NotificationType: {
    APLICACAO_RECEBIDA: 'aplicacao_recebida',
    APLICACAO_ACEITA: 'aplicacao_aceita',
    APLICACAO_REJEITADA: 'aplicacao_rejeitada',
    CONVITE_BANDA: 'convite_banda',
    SISTEMA: 'sistema',
  },
}));

import { createNotification } from '../services/NotificationService';
import NotificationModel, { NotificationType } from '../models/NotificationModel';

describe('NotificationService — createNotification', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria notificação com todos os campos obrigatórios', async () => {
    (NotificationModel.create as jest.Mock).mockResolvedValueOnce({ id: 1 });

    await createNotification(
      5,
      NotificationType.APLICACAO_RECEBIDA,
      'Nova candidatura recebida'
    );

    expect(NotificationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario_id: 5,
        tipo: NotificationType.APLICACAO_RECEBIDA,
        mensagem: 'Nova candidatura recebida',
      })
    );
  });

  it('inclui referencia_tipo e referencia_id quando fornecidos', async () => {
    (NotificationModel.create as jest.Mock).mockResolvedValueOnce({ id: 2 });

    await createNotification(
      3,
      NotificationType.APLICACAO_ACEITA,
      'Parabéns, sua banda foi aceita!',
      'aplicacao',
      42
    );

    expect(NotificationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        referencia_tipo: 'aplicacao',
        referencia_id: 42,
      })
    );
  });

  it('não lança exceção quando NotificationModel.create falha (silencia erro)', async () => {
    (NotificationModel.create as jest.Mock).mockRejectedValueOnce(new Error('DB offline'));

    await expect(
      createNotification(1, NotificationType.SISTEMA, 'teste')
    ).resolves.toBeUndefined();
  });

  it('retorna void (Promise<void>) em caso de sucesso', async () => {
    (NotificationModel.create as jest.Mock).mockResolvedValueOnce({ id: 3 });

    const result = await createNotification(
      1,
      NotificationType.CONVITE_BANDA,
      'Você foi convidado para uma banda!'
    );

    expect(result).toBeUndefined();
  });
});
