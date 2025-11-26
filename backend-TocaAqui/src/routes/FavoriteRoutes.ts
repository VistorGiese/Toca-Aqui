import { Router } from "express";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} from "../controllers/FavoriteController";
import { authMiddleware } from "../middleware/authmiddleware";

const router = Router();

router.post("/", authMiddleware, addFavorite);             
router.delete("/:banda_id", authMiddleware, removeFavorite);
router.get("/", authMiddleware, getFavorites);
router.get("/:banda_id", authMiddleware, checkFavorite);

export default router;