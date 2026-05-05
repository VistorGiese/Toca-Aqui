process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/NotificationModel', () => ({
  __esModule: true,
  default: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  NotificationType: {
    CONTRATO_ATUALIZADO: 'contrato_atualizado',
  },
}));

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/NotificationController';
import NotificationModel from '../models/NotificationModel';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

describe('NotificationController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── getNotifications ─────────────────────────────────────────────────────
  describe('getNotifications', () => {
    it('retorna notificações paginadas', async () => {
      const req = makeReq({ user: { id: 1 }, query: {} });
      const res = mockRes();

      (NotificationModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: [{ id: 1 }, { id: 2 }],
      });
      (NotificationModel.count as jest.Mock).mockResolvedValue(1);

      getNotifications(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          nao_lidas: 1,
          pagination: expect.objectContaining({ total: 2 }),
        })
      );
    });

    it('filtra por status lida', async () => {
      const req = makeReq({ user: { id: 1 }, query: { lida: 'true' } });
      const res = mockRes();

      (NotificationModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });
      (NotificationModel.count as jest.Mock).mockResolvedValue(0);

      getNotifications(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(NotificationModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ lida: true }),
        })
      );
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, query: {} });
      const res = mockRes();

      getNotifications(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── markAsRead ───────────────────────────────────────────────────────────
  describe('markAsRead', () => {
    it('marca notificação como lida', async () => {
      const notification = { id: 1, update: jest.fn().mockResolvedValue(undefined) };
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      (NotificationModel.findOne as jest.Mock).mockResolvedValue(notification);

      markAsRead(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(notification.update).toHaveBeenCalledWith({ lida: true });
      expect(res.json).toHaveBeenCalledWith({ message: 'Notificação marcada como lida' });
    });

    it('passa AppError 404 quando não encontrada', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '999' } });
      const res = mockRes();

      (NotificationModel.findOne as jest.Mock).mockResolvedValue(null);

      markAsRead(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '1' } });
      const res = mockRes();

      markAsRead(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── markAllAsRead ────────────────────────────────────────────────────────
  describe('markAllAsRead', () => {
    it('marca todas como lidas e retorna contagem', async () => {
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (NotificationModel.update as jest.Mock).mockResolvedValue([5]);

      markAllAsRead(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(NotificationModel.update).toHaveBeenCalledWith(
        { lida: true },
        { where: { usuario_id: 1, lida: false } }
      );
      expect(res.json).toHaveBeenCalledWith({ message: '5 notificação(ões) marcada(s) como lida(s)' });
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined });
      const res = mockRes();

      markAllAsRead(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });
});
