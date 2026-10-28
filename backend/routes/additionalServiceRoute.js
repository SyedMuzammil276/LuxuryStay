
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  listAdditionalServices,
  createAdditionalService,
  getAdditionalService,
  updateAdditionalServiceStatus,
  updateAdditionalService,
  cancelAdditionalService,
} from "../controllers/additionalServiceController.js";

const router = express.Router();

const frontDeskRoles = ["admin", "manager", "receptionist"];

const serviceRoles = [...frontDeskRoles, "guest"];
const statusRoles = [...frontDeskRoles, "housekeeping"];

router.use(authMiddleware);


router.post(
  "/",
  roleMiddleware(serviceRoles),
  createAdditionalService
);


router.get(
  "/",
  roleMiddleware([...serviceRoles, "housekeeping"]),
  listAdditionalServices
);

router.get(
  "/:id",
  roleMiddleware([...frontDeskRoles, "guest", "housekeeping"]),
  getAdditionalService
);



router.patch(
  "/:id",
  roleMiddleware(frontDeskRoles),
  updateAdditionalService
);


router.patch(
  "/:id/status",
  roleMiddleware(statusRoles),
  updateAdditionalServiceStatus
);


router.patch(
  "/:id/cancel",
  roleMiddleware(serviceRoles),
  cancelAdditionalService
);

export default router;
