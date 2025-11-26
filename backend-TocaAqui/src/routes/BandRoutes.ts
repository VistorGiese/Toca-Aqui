import { Router } from "express";
import {
  createBand,
  getBands,
  getBandById,
  updateBand,
  deleteBand,
} from "../controllers/BandController";
import { uploadService } from "../services/UploadService";
import { authMiddleware } from "../middleware/authmiddleware";
import { checkRolesOrAdmin, checkOwnershipOrAdmin } from "../middleware/authorizationMiddleware";
import { UserRole } from "../models/UserModel";

const router = Router();

router.get("/", getBands);
router.get("/:id", getBandById);

router.use(authMiddleware);

router.post("/", checkRolesOrAdmin(UserRole.ARTIST), uploadService.uploadSingle, createBand);

router.put("/:id", checkRolesOrAdmin(UserRole.ARTIST), checkOwnershipOrAdmin('Band', 'usuario_id'), uploadService.uploadSingle, updateBand);

router.delete("/:id", checkRolesOrAdmin(UserRole.ARTIST), checkOwnershipOrAdmin('Band', 'usuario_id'), deleteBand);

export default router;
