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
import { validate } from "../middleware/validate";
import { createBookingSchema, updateBookingSchema } from "../schemas/bookingSchemas";

const router = Router();

router.post("/", authMiddleware, checkRolesOrAdmin(UserRole.ESTABLISHMENT_OWNER), validate(createBookingSchema), createBooking);

router.get("/", authMiddleware, getBookings);

router.get("/:id", authMiddleware, getBookingById);

router.put("/:id", authMiddleware, checkOwnershipOrAdmin('Booking', 'perfil_estabelecimento_id'), validate(updateBookingSchema), updateBooking);

router.delete("/:id", authMiddleware, checkOwnershipOrAdmin('Booking', 'perfil_estabelecimento_id'), deleteBooking);

export default router;
