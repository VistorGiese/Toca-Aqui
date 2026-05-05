import { Router } from 'express';
import {
  getPublicShows,
  getShowById,
  getShowsDestaque,
  searchShows,
} from '../controllers/ShowController';

const router = Router();

router.get('/destaque', getShowsDestaque);
router.get('/buscar', searchShows);
router.get('/', getPublicShows);
router.get('/:id', getShowById);

export default router;
