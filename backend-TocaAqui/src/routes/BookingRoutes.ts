import { Router } from "express";
import {
  createBooking,
  getBookings,
  getMeusAgendamentos,
  getBookingById,
  updateBooking,
  uploadBookingCover,
  deleteBooking,
  getByProximidade,
} from "../controllers/BookingController";
import { authMiddleware } from "../middleware/authmiddleware";
import { checkOwnership } from "../middleware/authorizationMiddleware";
import { validate } from "../middleware/validate";
import { createBookingSchema, updateBookingSchema } from "../schemas/bookingSchemas";
import BookingModel from "../models/BookingModel";
import EstablishmentProfileModel from "../models/EstablishmentProfileModel";
import { uploadService } from "../services/UploadService";
import { uploadLimiter } from "../middleware/rateLimiter";

const resolveBookingOwner = async (req: any): Promise<number | undefined> => {
  const booking = await BookingModel.findByPk(req.params.id);
  if (!booking) return undefined;
  const profile = await EstablishmentProfileModel.findByPk(booking.perfil_estabelecimento_id);
  return profile?.usuario_id;
};

const router = Router();

router.get("/proximidade", getByProximidade);

router.post("/", authMiddleware, validate(createBookingSchema), createBooking);

router.get("/meus", authMiddleware, getMeusAgendamentos);

router.get("/", authMiddleware, getBookings);

router.get("/:id", authMiddleware, getBookingById);

router.put("/:id", authMiddleware, checkOwnership(resolveBookingOwner), validate(updateBookingSchema), updateBooking);
router.patch("/:id/capa", authMiddleware, checkOwnership(resolveBookingOwner), uploadLimiter, uploadService.uploadSingle, uploadBookingCover);

router.delete("/:id", authMiddleware, checkOwnership(resolveBookingOwner), deleteBooking);

export default router;
