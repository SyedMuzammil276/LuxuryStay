
import mongoose from "mongoose";

const AdditionalServiceSchema = new mongoose.Schema(
    {
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation",
            required: true
        },

        guest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guest",
            required: true
        },

        serviceName: {
            type: String,
            enum: [
                "food",
                "laundry",
                "transportation",
                "wake_up_call",
                "room_service"
            ],
            required: true
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },

        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "requested",
                "in_progress",
                "completed",
                "cancelled"
            ],
            default: "requested"
        },

        requestedBy: {
            type: String,
            enum: ["guest", "admin", "manager", "receptionist"],
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

AdditionalServiceSchema.index({
    reservation: 1,
    status: 1
});

export default mongoose.model(
    "AdditionalService",
    AdditionalServiceSchema
);
