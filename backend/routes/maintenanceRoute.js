import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  createMaintenanceRequest,
  listMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  updateMaintenanceRequestStatus
} from "../controllers/maintenanceController.js";

const router = express.Router();

const viewAccess = ["admin", "manager", "receptionist", "maintenance"];
const createAccess = ["admin", "manager", "receptionist"];
const manageAccess = ["admin", "manager", "receptionist"];
const statusAccess = ["maintenance"];

router.use(authMiddleware);

router.route("/")
  .get(roleMiddleware(viewAccess), listMaintenanceRequests)
  .post(roleMiddleware(createAccess), createMaintenanceRequest);


router.get("/:id", roleMiddleware(viewAccess), getMaintenanceRequestById);


router.patch("/:id", roleMiddleware(manageAccess), updateMaintenanceRequest);


router.patch("/:id/status", roleMiddleware(statusAccess), updateMaintenanceRequestStatus);

export default router;