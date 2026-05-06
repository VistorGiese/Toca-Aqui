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
  resendVerificationEmail,
  uploadArtistPhoto,
  uploadArtistPressKit,
  uploadUserPhoto,
  savePreferencias,
  getPreferencias,
  alterarEmail,
  alterarNome,
  atualizarIndisponibilidades,
  atualizarPerfilArtista,
  excluirConta,
  getMinhasPaginas,
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
router.post('/reenviar-verificacao', passwordResetLimiter, validate(forgotPasswordSchema), resendVerificationEmail);
router.get('/perfil', authMiddleware, getUserProfile);
router.get('/minhas-paginas', authMiddleware, getMinhasPaginas);
router.post('/perfil-estabelecimento', authMiddleware, validate(createEstablishmentProfileSchema), createEstablishmentProfile);
router.post('/perfil-artista', authMiddleware, validate(createArtistProfileSchema), createArtistProfile);
router.patch('/perfil-artista/:id', authMiddleware, atualizarPerfilArtista);
router.patch('/perfil-artista/:id/foto', authMiddleware, uploadLimiter, uploadService.uploadSingle, uploadArtistPhoto);
router.patch('/perfil-artista/:id/press-kit', authMiddleware, uploadLimiter, uploadService.uploadMultiple, uploadArtistPressKit);
router.patch('/perfil-artista/:id/indisponibilidades', authMiddleware, atualizarIndisponibilidades);
router.patch('/foto', authMiddleware, uploadLimiter, uploadService.uploadSingle, uploadUserPhoto);
router.post('/preferencias', authMiddleware, savePreferencias);
router.get('/preferencias', authMiddleware, getPreferencias);
router.put('/email', authMiddleware, alterarEmail);
router.put('/nome', authMiddleware, alterarNome);
router.delete('/conta', authMiddleware, excluirConta);

export default router;