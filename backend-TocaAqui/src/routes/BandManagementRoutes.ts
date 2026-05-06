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
import { validate } from '../middleware/validate';
import { createBandSchema, inviteMemberSchema, respondInvitationSchema } from '../schemas/bandSchemas';

const router = Router();

router.use(authMiddleware);

router.post('/', checkRolesOrAdmin(UserRole.ARTIST), validate(createBandSchema), createBand);

router.get('/minhas-bandas', getUserBands);

router.get('/:id', getBandDetails);

router.post('/convidar', checkRolesOrAdmin(UserRole.ARTIST), validate(inviteMemberSchema), inviteMemberToBand);

router.post('/convite/responder', validate(respondInvitationSchema), respondToBandInvitation);

export default router;