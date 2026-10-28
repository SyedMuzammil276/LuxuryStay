import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { listNotifications, createManualNotification, markNotificationRead, markAllRead, deleteNotification } from "../controllers/notificationController.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", listNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markNotificationRead);
router.delete("/:id", deleteNotification);
router.post("/", roleMiddleware(["admin", "manager"]), createManualNotification);
export default router;
