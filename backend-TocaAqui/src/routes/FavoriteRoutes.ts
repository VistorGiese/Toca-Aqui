import { Router } from "express";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} from "../controllers/FavoriteController";
import { authMiddleware } from "../middleware/authmiddleware";
import { validate } from "../middleware/validate";
import { addFavoriteSchema } from "../schemas/favoriteSchemas";

const router = Router();

router.post("/", authMiddleware, validate(addFavoriteSchema), addFavorite);
router.delete("/:favoritavel_tipo/:favoritavel_id", authMiddleware, removeFavorite);
router.get("/", authMiddleware, getFavorites);
router.get("/:favoritavel_tipo/:favoritavel_id", authMiddleware, checkFavorite);

export default router;