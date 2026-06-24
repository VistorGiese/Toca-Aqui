import { Router } from 'express';
import {
  getContract,
  getContractByEvent,
  getMyContracts,
  editContract,
  acceptContract,
  approvePdfContract,
  cancelContract,
  getContractHistory,
  completeContractHandler,
  avaliarEstabelecimento,
  avaliarArtista,
} from '../controllers/ContractController';
import { authMiddleware } from '../middleware/authmiddleware';
import { validate } from '../middleware/validate';
import { editContractSchema, cancelContractSchema } from '../schemas/contractSchemas';

const router = Router();

router.get('/meus', authMiddleware, getMyContracts);

router.get('/evento/:evento_id', authMiddleware, getContractByEvent);

router.get('/:id', authMiddleware, getContract);

router.put('/:id/editar', authMiddleware, validate(editContractSchema), editContract);

router.put('/:id/aceitar', authMiddleware, acceptContract);

router.put('/:id/aprovar-pdf', authMiddleware, approvePdfContract);

router.put('/:id/cancelar', authMiddleware, validate(cancelContractSchema), cancelContract);

router.get('/:id/historico', authMiddleware, getContractHistory);

router.put('/:id/concluir', authMiddleware, completeContractHandler);

router.post('/:id/avaliar', authMiddleware, avaliarEstabelecimento);

router.post('/:id/avaliar-artista', authMiddleware, avaliarArtista);

export default router;
