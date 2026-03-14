import { Router } from 'express';
import {
  listEstablishments,
  getEstablishment,
  updateEstablishment,
  deleteEstablishment,
  uploadEstablishmentPhotos,
  removeEstablishmentPhoto,
} from '../controllers/EstablishmentController';
import { authMiddleware } from '../middleware/authmiddleware';
import { checkOwnershipOrAdmin } from '../middleware/authorizationMiddleware';
import { uploadService } from '../services/UploadService';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', listEstablishments);
router.get('/:id', getEstablishment);

router.put('/:id', authMiddleware, checkOwnershipOrAdmin('EstablishmentProfile'), updateEstablishment);
router.delete('/:id', authMiddleware, checkOwnershipOrAdmin('EstablishmentProfile'), deleteEstablishment);

router.patch('/:id/fotos', authMiddleware, uploadLimiter, uploadService.uploadMultiple, uploadEstablishmentPhotos);
router.delete('/:id/fotos', authMiddleware, removeEstablishmentPhoto);

export default router;
