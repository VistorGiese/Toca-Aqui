import { Router } from "express";
import * as RatingController from "../controllers/RatingController";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import { checkOwnership } from "../middleware/authorizationMiddleware";
import Rating from "../models/RatingModel";

const router = Router();

router.post("/", authMiddleware, RatingController.createRating);

router.put("/:id", 
  authMiddleware, 
  checkOwnership(async (req: AuthRequest) => {
    const rating = await Rating.findByPk(req.params.id);
    return rating?.usuario_id || null;
  }),
  RatingController.updateRating
);

router.get("/:avaliavel_tipo/:avaliavel_id", RatingController.getRatings);

router.delete("/:id", 
  authMiddleware, 
  checkOwnership(async (req: AuthRequest) => {
    const rating = await Rating.findByPk(req.params.id);
    return rating?.usuario_id || null;
  }),
  RatingController.deleteRating
);

export default router;
