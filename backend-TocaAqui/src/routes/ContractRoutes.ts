import { Router } from 'express';
import {
  getContract,
  getContractByEvent,
  getMyContracts,
  editContract,
  acceptContract,
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

// Listar meus contratos
router.get('/meus', authMiddleware, getMyContracts);

// Buscar contrato por evento
router.get('/evento/:evento_id', authMiddleware, getContractByEvent);

// Buscar contrato por ID
router.get('/:id', authMiddleware, getContract);

// Editar contrato (campos editáveis, ambas as partes)
router.put('/:id/editar', authMiddleware, validate(editContractSchema), editContract);

// Aceitar contrato
router.put('/:id/aceitar', authMiddleware, acceptContract);

// Cancelar contrato
router.put('/:id/cancelar', authMiddleware, validate(cancelContractSchema), cancelContract);

// Histórico de edições do contrato
router.get('/:id/historico', authMiddleware, getContractHistory);

// Concluir contrato (apenas contratante)
router.put('/:id/concluir', authMiddleware, completeContractHandler);

// Artista avalia estabelecimento após contrato concluído
router.post('/:id/avaliar', authMiddleware, avaliarEstabelecimento);

// Estabelecimento avalia artista apos contrato concluido
router.post('/:id/avaliar-artista', authMiddleware, avaliarArtista);

export default router;
