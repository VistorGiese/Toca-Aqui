import { Router } from "express";
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} from "../controllers/AddressController";
import { authMiddleware, AuthRequest } from "../middleware/authmiddleware";
import { checkOwnership } from "../middleware/authorizationMiddleware";
import { validate } from "../middleware/validate";
import { createAddressSchema, updateAddressSchema } from "../schemas/addressSchemas";
import EstablishmentProfileModel from "../models/EstablishmentProfileModel";

const router = Router();

const resolveAddressOwnerUserId = async (req: AuthRequest): Promise<number | undefined> => {
  const addressId = req.params.id;
  const profile = await EstablishmentProfileModel.findOne({
    where: { endereco_id: addressId },
    attributes: ['usuario_id'],
  });
  return profile?.usuario_id;
};

router.use(authMiddleware);

router.post("/", validate(createAddressSchema), createAddress);
router.get("/", getAddresses);
router.get("/:id", getAddressById);

router.put("/:id", checkOwnership(resolveAddressOwnerUserId), validate(updateAddressSchema), updateAddress);
router.delete("/:id", checkOwnership(resolveAddressOwnerUserId), deleteAddress);

export default router;
