import { Router } from "express";
import {
	applyBandToEvent,
	getBandApplicationsForEvent,
	acceptBandApplication,
	rejectBandApplication,
	getMyApplications,
} from "../controllers/BandApplicationController";
import { authMiddleware, AuthRequest } from "../middleware/authmiddleware";
import { checkOwnership } from "../middleware/authorizationMiddleware";
import BandApplicationModel from "../models/BandApplicationModel";
import BookingModel from "../models/BookingModel";
import EstablishmentProfileModel from "../models/EstablishmentProfileModel";
import { validate } from "../middleware/validate";
import { applyBandSchema } from "../schemas/bandApplicationSchemas";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(applyBandSchema), applyBandToEvent);

router.get("/minhas", getMyApplications);

router.get("/:evento_id", getBandApplicationsForEvent);

const checkEventOwnership = checkOwnership(async (req: AuthRequest) => {
	const application = await BandApplicationModel.findByPk(req.params.candidaturaId as string);
	if (!application) return undefined;

	const booking = await BookingModel.findByPk(application.evento_id);
	if (!booking) return undefined;

	const establishment = await EstablishmentProfileModel.findByPk(booking.perfil_estabelecimento_id);
	if (!establishment) return undefined;

	return establishment.usuario_id;
});

router.put("/:candidaturaId/aceitar", checkEventOwnership, acceptBandApplication);
router.put("/:candidaturaId/recusar", checkEventOwnership, rejectBandApplication);

export default router;
