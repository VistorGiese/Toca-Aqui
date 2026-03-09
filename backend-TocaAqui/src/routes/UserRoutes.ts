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

const router = Router();


router.post('/registro', registerUser);
router.post('/login', loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.get('/perfil', authMiddleware, getUserProfile);
router.post('/perfil-estabelecimento', authMiddleware, createEstablishmentProfile);
router.post('/perfil-artista', authMiddleware, createArtistProfile);

export default router;