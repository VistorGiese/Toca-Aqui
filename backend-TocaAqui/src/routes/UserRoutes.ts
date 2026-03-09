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

const router = Router();

router.post('/registro', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.get('/perfil', authMiddleware, getUserProfile);
router.post('/perfil-estabelecimento', authMiddleware, createEstablishmentProfile);
router.post('/perfil-artista', authMiddleware, createArtistProfile);

export default router;