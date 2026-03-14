import { Response } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../errors/AppError';
import NotificationModel from '../models/NotificationModel';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);
  const userId = req.user.id;
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  const lida = req.query.lida !== undefined ? req.query.lida === 'true' : undefined;

  const where: any = { usuario_id: userId };
  if (lida !== undefined) where.lida = lida;

  const { count, rows } = await NotificationModel.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  res.json({
    data: rows,
    nao_lidas: await NotificationModel.count({ where: { usuario_id: userId, lida: false } }),
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);
  const userId = req.user.id;
  const notification = await NotificationModel.findOne({
    where: { id: req.params.id, usuario_id: userId },
  });

  if (!notification) throw new AppError('Notificação não encontrada', 404);

  await notification.update({ lida: true });
  res.json({ message: 'Notificação marcada como lida' });
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);
  const userId = req.user.id;
  const [updated] = await NotificationModel.update(
    { lida: true },
    { where: { usuario_id: userId, lida: false } }
  );
  res.json({ message: `${updated} notificação(ões) marcada(s) como lida(s)` });
});
