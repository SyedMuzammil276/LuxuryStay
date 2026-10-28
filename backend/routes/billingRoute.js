import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { listBills, getBill, generateBill, recordPayment } from "../controllers/billingController.js";

const router = express.Router();
const frontDeskRoles = ["admin", "manager", "receptionist"];
router.use(authMiddleware);
router.get("/", listBills);
router.get("/:id", getBill);
router.post("/generate", roleMiddleware(frontDeskRoles), generateBill);
router.patch("/:id/payment", roleMiddleware(frontDeskRoles), recordPayment);
export default router;
