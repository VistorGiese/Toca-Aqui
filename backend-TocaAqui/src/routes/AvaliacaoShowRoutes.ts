import { Router } from 'express';
import { authMiddleware } from '../middleware/authmiddleware';
import { validate } from '../middleware/validate';
import { criarAvaliacao, getAvaliacoesByShow } from '../controllers/AvaliacaoShowController';
import { criarAvaliacaoSchema } from '../schemas/avaliacaoShowSchemas';

const router = Router();

router.post('/', authMiddleware, validate(criarAvaliacaoSchema), criarAvaliacao);
router.get('/show/:agendamentoId', getAvaliacoesByShow);

export default router;
