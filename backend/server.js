
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connecDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import passwordRoutes from "./routes/passwordRoute.js";
import guestRoutes from "./routes/guestRoute.js";
import roomRoutes from "./routes/roomRoute.js";
import reportRoutes from "./routes/reportRoute.js";
import notificationRoutes from "./routes/notificationRoute.js";
import reservationRoutes from "./routes/reservationRoute.js";
import housekeepingRoutes from "./routes/housekeepingRoute.js";
import maintenanceRoutes from "./routes/maintenanceRoute.js";
import billingRoutes from "./routes/billingRoute.js";
import additionalServiceRoutes from "./routes/additionalServiceRoute.js";
import feedbackRoutes from "./routes/feedbackRoute.js";


dotenv.config();

const app = express()

app.use(cors());
app.use(express.json())

connecDB();

app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordRoutes);
app.use("/api/users", userRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/housekeeping", housekeepingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/additional-services", additionalServiceRoutes);
app.use("/api/feedback", feedbackRoutes);


app.get("/", (req,res) => {
    res.json({
        message: "Luxuray HMS is running"
    })

});

const PORT = process.env.PORT || 5000 


if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

export default app;