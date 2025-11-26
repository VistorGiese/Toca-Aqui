import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  createEstablishmentProfile,
  createArtistProfile,
} from '../controllers/UserController';
import { authMiddleware } from '../middleware/authmiddleware';

const router = Router();


router.post('/registro', registerUser);
router.post('/login', loginUser);
router.get('/perfil', authMiddleware, getUserProfile);
router.post('/perfil-estabelecimento', authMiddleware, createEstablishmentProfile);
router.post('/perfil-artista', authMiddleware, createArtistProfile);

export default router;