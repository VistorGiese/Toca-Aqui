import { Router } from 'express';
import { authMiddleware } from '../middleware/authmiddleware';
import { validate } from '../middleware/validate';
import {
  getComentarios,
  criarComentario,
  curtirComentario,
} from '../controllers/ComentarioShowController';
import { criarComentarioSchema } from '../schemas/comentarioShowSchemas';

const router = Router();

router.get('/show/:agendamentoId', getComentarios);
router.post('/', authMiddleware, validate(criarComentarioSchema), criarComentario);
router.post('/:id/curtir', authMiddleware, curtirComentario);

export default router;
