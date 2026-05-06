import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getUserStatistics,
  getEventStatistics,
  getBandStatistics,
  getDashboardMetrics,
  getEventsByEstablishment,
} from '../controllers/AdminController';
import { authMiddleware } from '../middleware/authmiddleware';
import { checkAdmin } from '../middleware/authorizationMiddleware';
import { adminLimiter } from '../middleware/rateLimiter';

const router = Router();


router.use(authMiddleware, checkAdmin(), adminLimiter);

router.get('/dashboard', getDashboardMetrics);

router.get('/usuarios/estatisticas', getUserStatistics);
router.get('/usuarios/:id', getUserById);
router.get('/usuarios', getAllUsers);

router.get('/eventos/estatisticas', getEventStatistics);
router.get('/eventos/estabelecimento/:id', getEventsByEstablishment);

router.get('/bandas/estatisticas', getBandStatistics);

export default router;
