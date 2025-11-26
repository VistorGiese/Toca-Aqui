import { Router } from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from "../controllers/BookingController";
import { authMiddleware } from "../middleware/authmiddleware";
import { checkOwnershipOrAdmin, checkRolesOrAdmin } from "../middleware/authorizationMiddleware";
import { UserRole } from "../models/UserModel";

const router = Router();

router.post("/", authMiddleware, checkRolesOrAdmin(UserRole.ESTABLISHMENT_OWNER), createBooking);

router.get("/", authMiddleware, getBookings);

router.get("/:id", authMiddleware, getBookingById);

router.put("/:id", authMiddleware, checkOwnershipOrAdmin('Booking', 'perfil_estabelecimento_id'), updateBooking);

router.delete("/:id", authMiddleware, checkOwnershipOrAdmin('Booking', 'perfil_estabelecimento_id'), deleteBooking);

export default router;
