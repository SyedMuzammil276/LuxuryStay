import express from "express";

import { submitFeedback, getFeedback } from "../controllers/feedbackController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


router.post("/", authMiddleware, roleMiddleware(["guest"]), submitFeedback);


router.get("/", authMiddleware, roleMiddleware(["admin", "manager"]) ,getFeedback);

export default router;