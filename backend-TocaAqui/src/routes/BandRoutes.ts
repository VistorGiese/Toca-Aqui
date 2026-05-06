import { Router } from "express";
import {
  getBands,
  getBandById,
  updateBand,
  deleteBand,
} from "../controllers/BandController";
import { uploadService } from "../services/UploadService";
import { authMiddleware } from "../middleware/authmiddleware";
import { checkHasArtistProfile, checkOwnership } from "../middleware/authorizationMiddleware";
import BandMemberModel from "../models/BandMemberModel";
import ArtistProfileModel from "../models/ArtistProfileModel";
import { AuthRequest } from "../middleware/authmiddleware";

const router = Router();

const resolveBandLeaderUserId = async (req: AuthRequest): Promise<number | undefined> => {
  const bandId = req.params.id;
  const leader = await BandMemberModel.findOne({
    where: { banda_id: bandId, e_lider: true, status: 'approved' },
    include: [{ model: ArtistProfileModel, as: 'ArtistProfile', attributes: ['usuario_id'] }],
  });
  return (leader as any)?.ArtistProfile?.usuario_id;
};

router.get("/", getBands);
router.get("/:id", getBandById);

router.use(authMiddleware);

router.put("/:id", checkHasArtistProfile(), checkOwnership(resolveBandLeaderUserId), uploadService.uploadSingle, updateBand);

router.delete("/:id", checkHasArtistProfile(), checkOwnership(resolveBandLeaderUserId), deleteBand);

export default router;
