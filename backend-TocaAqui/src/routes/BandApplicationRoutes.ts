import { Router } from "express";
import {
	applyBandToEvent,
	getBandApplicationsForEvent
} from "../controllers/BandApplicationController";
import { acceptBandApplication } from "../controllers/BandApplicationController";
import { authMiddleware, AuthRequest } from "../middleware/authmiddleware";
import { checkRolesOrAdmin, checkOwnership } from "../middleware/authorizationMiddleware";
import { UserRole } from "../models/UserModel";
import BandApplicationModel from "../models/BandApplicationModel";
import BookingModel from "../models/BookingModel";
import EstablishmentProfileModel from "../models/EstablishmentProfileModel";
import { validate } from "../middleware/validate";
import { applyBandSchema } from "../schemas/bandApplicationSchemas";

const router = Router();

router.use(authMiddleware);

router.post("/", checkRolesOrAdmin(UserRole.ARTIST), validate(applyBandSchema), applyBandToEvent);

router.get("/:evento_id", getBandApplicationsForEvent);

const checkEventOwnership = checkOwnership(async (req: AuthRequest) => {
	const application = await BandApplicationModel.findByPk(req.params.id as string);
	if (!application) return undefined;

	const booking = await BookingModel.findByPk(application.evento_id);
	if (!booking) return undefined;

	const establishment = await EstablishmentProfileModel.findByPk(booking.perfil_estabelecimento_id);
	if (!establishment) return undefined;

	return establishment.usuario_id;
});

router.put("/:id/aceitar", checkEventOwnership, acceptBandApplication);

export default router;
