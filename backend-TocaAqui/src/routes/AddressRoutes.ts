import { Router } from "express";
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} from "../controllers/AddressController";
import { authMiddleware } from "../middleware/authmiddleware";
import { checkOwnershipOrAdmin } from "../middleware/authorizationMiddleware";
import { validate } from "../middleware/validate";
import { createAddressSchema, updateAddressSchema } from "../schemas/addressSchemas";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createAddressSchema), createAddress);
router.get("/", getAddresses);
router.get("/:id", getAddressById);

router.put("/:id", checkOwnershipOrAdmin("Address", "id"), validate(updateAddressSchema), updateAddress);
router.delete("/:id", checkOwnershipOrAdmin("Address", "id"), deleteAddress);

export default router;
