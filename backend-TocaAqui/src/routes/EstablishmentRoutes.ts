import { Router } from 'express';
import {
  listEstablishments,
  getEstablishment,
  updateEstablishment,
  deleteEstablishment,
  uploadEstablishmentPhotos,
  removeEstablishmentPhoto,
} from '../controllers/EstablishmentController';
import {
  listMembers,
  addMember,
  removeMember,
} from '../controllers/EstablishmentMemberController';
import { authMiddleware } from '../middleware/authmiddleware';
import {
  checkEstablishmentAccess,
  checkEstablishmentOwnerOnly,
} from '../middleware/authorizationMiddleware';
import { uploadService } from '../services/UploadService';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// Rotas públicas
router.get('/', listEstablishments);
router.get('/:id', getEstablishment);

// Rotas protegidas — owner ou admin membro
router.put('/:id', authMiddleware, checkEstablishmentAccess(), updateEstablishment);
router.delete('/:id', authMiddleware, checkEstablishmentOwnerOnly(), deleteEstablishment);

router.patch('/:id/fotos', authMiddleware, checkEstablishmentAccess(), uploadLimiter, uploadService.uploadMultiple, uploadEstablishmentPhotos);
router.delete('/:id/fotos', authMiddleware, checkEstablishmentAccess(), removeEstablishmentPhoto);

// Membros/gerenciadores
router.get('/:id/membros', authMiddleware, checkEstablishmentAccess(), listMembers);
router.post('/:id/membros', authMiddleware, checkEstablishmentOwnerOnly(), addMember);
router.delete('/:id/membros/:usuarioId', authMiddleware, checkEstablishmentOwnerOnly(), removeMember);

export default router;
