import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  createEstablishmentProfile,
  createArtistProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
} from '../controllers/UserController';
import { authMiddleware } from '../middleware/authmiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  registroSchema,
  loginSchema,
  createEstablishmentProfileSchema,
  createArtistProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/userSchemas';

const router = Router();

router.post('/registro', authLimiter, validate(registroSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.post('/esqueci-senha', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/redefinir-senha', validate(resetPasswordSchema), resetPassword);
router.get('/perfil', authMiddleware, getUserProfile);
router.post('/perfil-estabelecimento', authMiddleware, validate(createEstablishmentProfileSchema), createEstablishmentProfile);
router.post('/perfil-artista', authMiddleware, validate(createArtistProfileSchema), createArtistProfile);

export default router;