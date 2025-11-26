import { Router } from "express";
import * as FavoriteController from "../controllers/FavoriteController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, FavoriteController.addFavorite);

router.delete("/:favoritavel_tipo/:favoritavel_id", authMiddleware, FavoriteController.removeFavorite);

router.get("/", authMiddleware, FavoriteController.getFavorites);

router.get("/check/:favoritavel_tipo/:favoritavel_id", authMiddleware, FavoriteController.checkFavorite);

export default router;
