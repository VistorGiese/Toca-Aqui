import { Router } from 'express';
import {
  listEstablishments,
  getEstablishment,
  updateEstablishment,
  deleteEstablishment,
} from '../controllers/EstablishmentController';
import { authMiddleware } from '../middleware/authmiddleware';
import { checkOwnershipOrAdmin } from '../middleware/authorizationMiddleware';

const router = Router();

router.get('/', listEstablishments);
router.get('/:id', getEstablishment);

router.put('/:id', authMiddleware, checkOwnershipOrAdmin('EstablishmentProfile'), updateEstablishment);
router.delete('/:id', authMiddleware, checkOwnershipOrAdmin('EstablishmentProfile'), deleteEstablishment);

export default router;
