
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    createGuest,
    listGuests,
    getGuest,
    updateGuest,
    deleteGuest,
    verifyGuestEmail,
    resendVerificationPublic,
    resendVerificationStaff,
} from "../controllers/guestController.js";

const router = express.Router();

const adminManagerReceptionist = [
    "admin",
    "manager",
    "receptionist"
];

const allStaff = [
    "admin",
    "manager",
    "receptionist",
    "housekeeping",
    "maintenance"
];

router.post("/register", createGuest);




router.get("/verify-email/:token", verifyGuestEmail);
router.post("/resend-verification", resendVerificationPublic);

router.get(
    "/",
    authMiddleware,
    roleMiddleware(adminManagerReceptionist),
    listGuests
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(adminManagerReceptionist),
    getGuest
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(adminManagerReceptionist),
    createGuest
);

router.post(
    "/:id/resend-verification",
    authMiddleware,
    roleMiddleware(adminManagerReceptionist),
    resendVerificationStaff
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(adminManagerReceptionist),
    updateGuest
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["admin"]),
    deleteGuest
);

export default router;