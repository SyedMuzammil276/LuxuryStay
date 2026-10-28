import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getCurrentUser, LoginUser, LogoutUser } from "../controllers/authController.js";


const router = express.Router();


router.post("/login", LoginUser);


router.post("/logout", authMiddleware ,LogoutUser)

router.get("/me", authMiddleware, getCurrentUser);
export default router