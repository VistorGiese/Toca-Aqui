process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('node-cron', () => ({
  __esModule: true,
  default: { schedule: jest.fn() },
}));

jest.mock('../models/BookingModel', () => ({
  __esModule: true,
  default: { update: jest.fn() },
  BookingStatus: { PENDENTE: 'pendente', ACEITO: 'aceito', REALIZADO: 'realizado' },
}));

jest.mock('../models/ContractModel', () => ({
  __esModule: true,
  default: { findAll: jest.fn() },
  ContractStatus: { ACEITO: 'aceito', CONCLUIDO: 'concluido' },
}));

jest.mock('../models/PaymentModel', () => ({
  __esModule: true,
  default: { findAll: jest.fn() },
  PaymentStatus: { PAGO: 'pago', PENDENTE: 'pendente' },
}));

jest.mock('../services/NotificationService', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../models/NotificationModel', () => ({
  NotificationType: { PAGAMENTO_PENDENTE: 'pagamento_pendente' },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/BandMemberModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));

jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
  },
}));

import cron from 'node-cron';
import BookingModel from '../models/BookingModel';
import ContractModel from '../models/ContractModel';
import PaymentModel from '../models/PaymentModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import { createNotification } from '../services/NotificationService';
import redisService from '../config/redis';
import { initCronJobs } from '../services/CronService';

const mockSchedule = cron.schedule as jest.Mock;

// Captura as callbacks agendadas pelo cron
const captureCallbacks = (): Function[] => {
  const captured: Function[] = [];
  mockSchedule.mockImplementation((_pattern: string, cb: Function) => {
    captured.push(cb);
  });
  return captured;
};

// Aguarda microtasks pendentes
const flushAsync = () => new Promise((r) => setTimeout(r, 10));

describe('CronService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── initCronJobs ──────────────────────────────────────────────────────────
  describe('initCronJobs', () => {
    it('agenda exatamente 3 cron jobs', () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([0]);
      (ContractModel.findAll as jest.Mock).mockResolvedValue([]);
      captureCallbacks();

      initCronJobs();

      expect(mockSchedule).toHaveBeenCalledTimes(3);
    });

    it('agenda jobs com timezone America/Sao_Paulo', () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([0]);
      (ContractModel.findAll as jest.Mock).mockResolvedValue([]);
      captureCallbacks();

      initCronJobs();

      const calls = mockSchedule.mock.calls;
      calls.forEach((call) => {
        expect(call[2]).toMatchObject({ timezone: 'America/Sao_Paulo' });
      });
    });
  });

  // ─── markPastEventsAsRealizado ─────────────────────────────────────────────
  describe('markPastEventsAsRealizado (executado imediatamente por initCronJobs)', () => {
    it('atualiza eventos passados para REALIZADO', async () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([3]);
      (ContractModel.findAll as jest.Mock).mockResolvedValue([]);
      captureCallbacks();

      initCronJobs();
      await flushAsync();

      expect(BookingModel.update).toHaveBeenCalledWith(
        { status: 'realizado' },
        expect.objectContaining({ where: expect.any(Object) })
      );
    });

    it('invalida cache de agendamentos quando eventos foram atualizados', async () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([2]);
      (ContractModel.findAll as jest.Mock).mockResolvedValue([]);
      captureCallbacks();

      initCronJobs();
      await flushAsync();

      expect(redisService.invalidatePattern).toHaveBeenCalledWith('agendamentos:*');
    });

    it('não invalida cache quando nenhum evento foi atualizado', async () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([0]);
      (ContractModel.findAll as jest.Mock).mockResolvedValue([]);
      captureCallbacks();

      initCronJobs();
      await flushAsync();

      expect(redisService.invalidatePattern).not.toHaveBeenCalledWith('agendamentos:*');
    });

    it('captura erros internos sem lançar exceção', async () => {
      (BookingModel.update as jest.Mock).mockRejectedValue(new Error('DB error'));
      (ContractModel.findAll as jest.Mock).mockResolvedValue([]);
      captureCallbacks();

      await expect(async () => {
        initCronJobs();
        await flushAsync();
      }).not.toThrow();
    });
  });

  // ─── completeFinishedContracts ─────────────────────────────────────────────
  describe('completeFinishedContracts (executado imediatamente por initCronJobs)', () => {
    it('conclui contratos passados com todos os pagamentos PAGO', async () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([0]);
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      (ContractModel.findAll as jest.Mock).mockResolvedValue([
        { id: 1, Payments: [{ status: 'pago' }, { status: 'pago' }], update: mockUpdate },
      ]);
      captureCallbacks();

      initCronJobs();
      await flushAsync();

      expect(mockUpdate).toHaveBeenCalledWith({ status: 'concluido' });
    });

    it('conclui contrato sem nenhum pagamento', async () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([0]);
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      (ContractModel.findAll as jest.Mock).mockResolvedValue([
        { id: 2, Payments: [], update: mockUpdate },
      ]);
      captureCallbacks();

      initCronJobs();
      await flushAsync();

      expect(mockUpdate).toHaveBeenCalledWith({ status: 'concluido' });
    });

    it('não conclui contratos com pagamento pendente', async () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([0]);
      const mockUpdate = jest.fn();
      (ContractModel.findAll as jest.Mock).mockResolvedValue([
        { id: 3, Payments: [{ status: 'pago' }, { status: 'pendente' }], update: mockUpdate },
      ]);
      captureCallbacks();

      initCronJobs();
      await flushAsync();

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('invalida cache de contratos após processar', async () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([0]);
      (ContractModel.findAll as jest.Mock).mockResolvedValue([]);
      captureCallbacks();

      initCronJobs();
      await flushAsync();

      expect(redisService.invalidatePattern).toHaveBeenCalledWith('contratos:*');
    });

    it('captura erros internos sem lançar exceção', async () => {
      (BookingModel.update as jest.Mock).mockResolvedValue([0]);
      (ContractModel.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));
      captureCallbacks();

      await expect(async () => {
        initCronJobs();
        await flushAsync();
      }).not.toThrow();
    });
  });

  // ─── sendPaymentReminders ──────────────────────────────────────────────────
  describe('sendPaymentReminders (cron callback capturado)', () => {
    let sendReminders: Function;

    beforeEach(() => {
      (BookingModel.update as jest.Mock).mockResolvedValue([0]);
      (ContractModel.findAll as jest.Mock).mockResolvedValue([]);

      const callbacks = captureCallbacks();
      initCronJobs();
      // Terceiro schedule registrado é o sendPaymentReminders (0 9 * * *)
      sendReminders = callbacks[2];
    });

    it('envia notificação para pagamentos vencendo em até 3 dias', async () => {
      const mockContrato = { id: 1, perfil_estabelecimento_id: 5 };
      (PaymentModel.findAll as jest.Mock).mockResolvedValue([
        { id: 10, valor: 500, tipo: 'sinal', data_vencimento: '2026-05-09', Contract: mockContrato },
      ]);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 10 });

      await sendReminders();

      expect(createNotification).toHaveBeenCalledWith(
        10,
        'pagamento_pendente',
        expect.stringContaining('500.00'),
        'pagamento',
        10
      );
    });

    it('não envia notificação quando não há pagamentos pendentes', async () => {
      (PaymentModel.findAll as jest.Mock).mockResolvedValue([]);

      await sendReminders();

      expect(createNotification).not.toHaveBeenCalled();
    });

    it('ignora pagamento sem contrato associado', async () => {
      (PaymentModel.findAll as jest.Mock).mockResolvedValue([
        { id: 11, valor: 200, tipo: 'restante', data_vencimento: '2026-05-09', Contract: null },
      ]);

      await sendReminders();

      expect(createNotification).not.toHaveBeenCalled();
    });

    it('ignora pagamento quando estabelecimento não encontrado', async () => {
      const mockContrato = { id: 2, perfil_estabelecimento_id: 99 };
      (PaymentModel.findAll as jest.Mock).mockResolvedValue([
        { id: 12, valor: 300, tipo: 'sinal', data_vencimento: '2026-05-09', Contract: mockContrato },
      ]);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      await sendReminders();

      expect(createNotification).not.toHaveBeenCalled();
    });

    it('captura erros internos sem lançar exceção', async () => {
      (PaymentModel.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(sendReminders()).resolves.toBeUndefined();
    });
  });
});
