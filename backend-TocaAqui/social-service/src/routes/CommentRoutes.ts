import { Router } from "express";
import * as CommentController from "../controllers/CommentController";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import { checkOwnership } from "../middleware/authorizationMiddleware";
import Comment from "../models/CommentModel";

const router = Router();

router.post("/", authMiddleware, CommentController.createComment);

router.get("/:comentavel_tipo/:comentavel_id", CommentController.getComments);

router.delete("/:id", 
  authMiddleware, 
  checkOwnership(async (req: AuthRequest) => {
    const comment = await Comment.findByPk(req.params.id);
    return comment?.usuario_id || null;
  }),
  CommentController.deleteComment
);

export default router;
