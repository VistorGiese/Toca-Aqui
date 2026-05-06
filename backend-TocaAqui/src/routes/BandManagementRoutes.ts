import { Router } from 'express';
import {
  createBand,
  getBandDetails,
  inviteMemberToBand,
  respondToBandInvitation,
  getUserBands,
} from '../controllers/BandManagementController';
import { authMiddleware } from '../middleware/authmiddleware';
import { checkHasArtistProfile } from '../middleware/authorizationMiddleware';
import { validate } from '../middleware/validate';
import { createBandSchema, inviteMemberSchema, respondInvitationSchema } from '../schemas/bandSchemas';

const router = Router();

router.use(authMiddleware);

router.post('/', checkHasArtistProfile(), validate(createBandSchema), createBand);

router.get('/minhas-bandas', getUserBands);

router.get('/:id', getBandDetails);

router.post('/convidar', checkHasArtistProfile(), validate(inviteMemberSchema), inviteMemberToBand);

router.post('/convite/responder', validate(respondInvitationSchema), respondToBandInvitation);

export default router;