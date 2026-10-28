import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  createReservation,
  listReservations,
  listMyReservations,
  getReservation,
  updateReservation,
  cancelReservation,
  markNoShow,
  checkIn,
  checkOut
} from "../controllers/reservationController.js";

const router = express.Router();

const frontDeskRoles = ["admin", "manager", "receptionist"];


const reservationRoles = [...frontDeskRoles, "guest"];

router.use(authMiddleware);


router.post("/", roleMiddleware(frontDeskRoles), createReservation);   
router.post("/my", roleMiddleware(["guest"]), createReservation);     

router.get("/", roleMiddleware(frontDeskRoles), listReservations);     
router.get("/my", roleMiddleware(["guest"]), listMyReservations);      
router.get("/:id", roleMiddleware(reservationRoles), getReservation);

router.put("/:id", roleMiddleware(reservationRoles), updateReservation);
router.patch("/:id/cancel", roleMiddleware(reservationRoles), cancelReservation);


router.patch("/:id/check-in", roleMiddleware(frontDeskRoles), checkIn);
router.patch("/:id/check-out", roleMiddleware(frontDeskRoles), checkOut);
router.patch("/:id/no-show", roleMiddleware(frontDeskRoles), markNoShow);

export default router;