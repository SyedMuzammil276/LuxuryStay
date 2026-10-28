
import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            unique: true,
            sparse: true
        },

        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation",
            required: true,
            unique: true
        },

        guest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guest",
            required: true
        },

        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },

        nights: {
            type: Number,
            required: true,
            min: 1
        },

        roomCharges: {
            type: Number,
            required: true,
            min: 0
        },

        services: [
            {
                serviceName: String,
                description: String,
                quantity: {
                    type: Number,
                    min: 1
                },
                unitPrice: {
                    type: Number,
                    min: 0
                },
                totalPrice: {
                    type: Number,
                    min: 0
                }
            }
        ],

        additionalCharges: {
            type: Number,
            default: 0,
            min: 0
        },

        taxRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        taxAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        amountPaid: {
            type: Number,
            default: 0,
            min: 0
        },

        paymentStatus: {
            type: String,
            enum: ["unpaid", "partial", "paid"],
            default: "unpaid"
        },

        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Bill", BillSchema);
