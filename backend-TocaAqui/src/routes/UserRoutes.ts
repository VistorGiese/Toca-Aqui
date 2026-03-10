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
  verifyEmail,
  uploadArtistPhoto,
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
import { uploadService } from '../services/UploadService';

const router = Router();

router.post('/registro', authLimiter, validate(registroSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.post('/esqueci-senha', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/redefinir-senha', validate(resetPasswordSchema), resetPassword);
router.get('/verificar-email', verifyEmail);
router.get('/perfil', authMiddleware, getUserProfile);
router.post('/perfil-estabelecimento', authMiddleware, validate(createEstablishmentProfileSchema), createEstablishmentProfile);
router.post('/perfil-artista', authMiddleware, validate(createArtistProfileSchema), createArtistProfile);
router.patch('/perfil-artista/:id/foto', authMiddleware, uploadService.uploadSingle, uploadArtistPhoto);

export default router;