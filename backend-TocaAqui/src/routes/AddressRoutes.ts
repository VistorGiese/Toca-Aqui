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

const router = Router();

router.use(authMiddleware);

router.post("/", createAddress);
router.get("/", getAddresses);
router.get("/:id", getAddressById);

router.put("/:id", checkOwnershipOrAdmin("Address", "id"), updateAddress);
router.delete("/:id", checkOwnershipOrAdmin("Address", "id"), deleteAddress);

export default router;
