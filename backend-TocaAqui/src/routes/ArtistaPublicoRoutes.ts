import { Router } from 'express';
import { authMiddleware } from '../middleware/authmiddleware';
import {
  seguirOuDesseguir,
  getPerfilPublico,
  getArtistasQueSigo,
} from '../controllers/SeguidorArtistaController';

const router = Router();

router.get('/seguindo', authMiddleware, getArtistasQueSigo);
router.get('/:id/publico', getPerfilPublico);
router.post('/:id/seguir', authMiddleware, seguirOuDesseguir);

export default router;
