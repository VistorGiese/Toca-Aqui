import { Router } from 'express';
import {
  getPublicShows,
  getConfirmedShows,
  getShowById,
  getShowsDestaque,
  searchShows,
} from '../controllers/ShowController';

const router = Router();

router.get('/destaque', getShowsDestaque);
router.get('/confirmados', getConfirmedShows);
router.get('/buscar', searchShows);
router.get('/', getPublicShows);
router.get('/:id', getShowById);

export default router;
