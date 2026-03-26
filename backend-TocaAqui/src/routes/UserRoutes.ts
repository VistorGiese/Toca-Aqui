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
  uploadUserPhoto,
  savePreferencias,
  getPreferencias,
  alterarEmail,
  excluirConta,
} from '../controllers/UserController';
import { authMiddleware } from '../middleware/authmiddleware';
import { authLimiter, passwordResetLimiter, uploadLimiter } from '../middleware/rateLimiter';
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
router.post('/esqueci-senha', passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/redefinir-senha', validate(resetPasswordSchema), resetPassword);
router.get('/verificar-email', verifyEmail);
router.get('/perfil', authMiddleware, getUserProfile);
router.post('/perfil-estabelecimento', authMiddleware, validate(createEstablishmentProfileSchema), createEstablishmentProfile);
router.post('/perfil-artista', authMiddleware, validate(createArtistProfileSchema), createArtistProfile);
router.patch('/perfil-artista/:id/foto', authMiddleware, uploadLimiter, uploadService.uploadSingle, uploadArtistPhoto);
router.patch('/foto', authMiddleware, uploadLimiter, uploadService.uploadSingle, uploadUserPhoto);
router.post('/preferencias', authMiddleware, savePreferencias);
router.get('/preferencias', authMiddleware, getPreferencias);
router.put('/email', authMiddleware, alterarEmail);
router.delete('/conta', authMiddleware, excluirConta);

export default router;