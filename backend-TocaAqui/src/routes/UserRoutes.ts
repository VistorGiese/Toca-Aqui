import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  createEstablishmentProfile,
  createArtistProfile,
  logoutUser,
} from '../controllers/UserController';
import { authMiddleware } from '../middleware/authmiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  registroSchema,
  loginSchema,
  createEstablishmentProfileSchema,
  createArtistProfileSchema,
} from '../schemas/userSchemas';

const router = Router();

router.post('/registro', authLimiter, validate(registroSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.get('/perfil', authMiddleware, getUserProfile);
router.post('/perfil-estabelecimento', authMiddleware, validate(createEstablishmentProfileSchema), createEstablishmentProfile);
router.post('/perfil-artista', authMiddleware, validate(createArtistProfileSchema), createArtistProfile);

export default router;