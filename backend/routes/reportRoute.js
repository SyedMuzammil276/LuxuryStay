import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { dashboardReport, roomReport, guestReport } from "../controllers/reportController.js";

const router = express.Router();
router.use(authMiddleware, roleMiddleware(["admin", "manager"]));
router.get("/dashboard", dashboardReport);
router.get("/rooms", roomReport);
router.get("/guests", guestReport);
export default router;
