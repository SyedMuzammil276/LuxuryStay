import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  createHousekeepingTask,
  listHousekeepingTasks,
  updateHousekeepingTask,
  updateHousekeepingTaskStatus,
  getHousekeepingTaskById
} from "../controllers/housekeepingController.js";

const router = express.Router();

const viewAccess = ["admin", "manager", "receptionist", "housekeeping"];
const createAccess = ["admin", "manager", "receptionist"];
const manageAccess = ["admin", "manager"];
const statusAccess = ["admin", "manager", "receptionist", "housekeeping"];

router.use(authMiddleware);

router.route("/")
  .get(roleMiddleware(viewAccess), listHousekeepingTasks)
  .post(roleMiddleware(createAccess), createHousekeepingTask);

  router.get("/:id", roleMiddleware(viewAccess), getHousekeepingTaskById);


router.patch("/:id", roleMiddleware(manageAccess), updateHousekeepingTask);


router.patch("/:id/status", roleMiddleware(statusAccess), updateHousekeepingTaskStatus);

export default router;