import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { createRoom, listRooms, getRoom, updateRoom, deleteRoom } from "../controllers/roomController.js";

const router = express.Router();
// Public room list for landing / information page
router.get("/public", listRooms);

router.use(authMiddleware, roleMiddleware(["admin", "manager", "receptionist", "housekeeping", "maintenance", "guest"]));
router.post("/create", roleMiddleware(["admin", "manager"]), createRoom);
router.get("/", listRooms);
router.get("/:id", getRoom);
router.put("/update/:id", roleMiddleware(["admin", "manager"]), updateRoom);
router.patch(
  "/:id/status",
  roleMiddleware(["admin", "manager", "receptionist", "housekeeping", "maintenance"]),
  (req, res, next) => {
    req.body = { status: req.body?.status };
    next();
  },
  updateRoom
);
router.delete("/:id", roleMiddleware(["admin", "manager"]), deleteRoom);
export default router;
