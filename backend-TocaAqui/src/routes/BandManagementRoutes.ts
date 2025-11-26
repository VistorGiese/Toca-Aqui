import { Router } from 'express';
import {
  createBand,
  getBandDetails,
  inviteMemberToBand,
  respondToBandInvitation,
  getUserBands,
} from '../controllers/BandManagementController';
import { authMiddleware } from '../middleware/authmiddleware';
import { checkRolesOrAdmin } from '../middleware/authorizationMiddleware';
import { UserRole } from '../models/UserModel';

const router = Router();

router.use(authMiddleware);

router.post('/', checkRolesOrAdmin(UserRole.ARTIST), createBand);

router.get('/minhas-bandas', getUserBands);

router.get('/:id', getBandDetails);

router.post('/convidar', checkRolesOrAdmin(UserRole.ARTIST), inviteMemberToBand);

router.post('/convite/responder', respondToBandInvitation);

export default router;