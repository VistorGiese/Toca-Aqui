import { Router } from 'express';
import { authMiddleware } from '../middleware/authmiddleware';
import { validate } from '../middleware/validate';
import { comprarIngresso, getMeusIngressos, getIngressoById } from '../controllers/IngressoController';
import { comprarIngressoSchema } from '../schemas/ingressoSchemas';

const router = Router();

router.post('/', authMiddleware, validate(comprarIngressoSchema), comprarIngresso);
router.get('/meus', authMiddleware, getMeusIngressos);
router.get('/:id', authMiddleware, getIngressoById);

export default router;
