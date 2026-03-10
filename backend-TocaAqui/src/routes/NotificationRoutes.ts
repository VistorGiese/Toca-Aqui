import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/authmiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/:id/lida', markAsRead);
router.patch('/todas/lida', markAllAsRead);

export default router;
