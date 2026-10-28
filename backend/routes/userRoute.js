import express from "express";

import { createStaff, getAllUser, getUserbyId, toggleStaffStatus, updateStaff } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["admin"]), createStaff);

router.get("/getAllUser", authMiddleware, roleMiddleware(["admin"]), getAllUser);

router.get("/:id", authMiddleware, roleMiddleware(["admin"]), getUserbyId);

router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateStaff);

router.patch("/:id/status", authMiddleware, roleMiddleware(["admin"]), toggleStaffStatus)



export default router;