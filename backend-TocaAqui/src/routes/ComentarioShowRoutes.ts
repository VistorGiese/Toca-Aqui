import { Router } from 'express';
import { authMiddleware } from '../middleware/authmiddleware';
import { validate } from '../middleware/validate';
import {
  getComentarios,
  criarComentario,
  curtirComentario,
  excluirComentario,
} from '../controllers/ComentarioShowController';
import { criarComentarioSchema } from '../schemas/comentarioShowSchemas';

const router = Router();

router.get('/show/:agendamentoId', getComentarios);
router.post('/', authMiddleware, validate(criarComentarioSchema), criarComentario);
router.post('/:id/curtir', authMiddleware, curtirComentario);
router.delete('/:id', authMiddleware, excluirComentario);

export default router;
