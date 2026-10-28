import mongoose from "mongoose";


const ACTOR_ROLES = ["admin", "manager", "receptionist", "guest"];

const reservationSchema = new mongoose.Schema(
  {
    confirmationCode: { type: String, required: true, unique: true, index: true },

    guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest", required: true, index: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },

    checkInDate: { type: Date, required: true, index: true },
    checkOutDate: {
      type: Date,
      required: true,
      index: true,
      validate: {
        validator: function (value) {
          return !this.checkInDate || value > this.checkInDate;
        },
        message: "checkOutDate must be after checkInDate"
      }
    },

    status: {
      type: String,
      enum: ["confirmed", "checked_in", "checked_out", "cancelled", "no_show"],
      default: "confirmed",
      index: true
    },

    guestsCount: { type: Number, min: 1, required: true, default: 1 },
    specialRequests: { type: String, trim: true, maxlength: 1000 },


    checkedInAt: Date,
    checkedOutAt: Date,

 
    cancelledAt: Date,
    cancelledBy: { type: String, enum: ACTOR_ROLES },
    cancellationReason: { type: String, trim: true, maxlength: 500 },


    bookedBy: { type: String, enum: ACTOR_ROLES },


    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


reservationSchema.virtual("nights").get(function () {
  if (!this.checkInDate || !this.checkOutDate) return undefined;
  return Math.round((this.checkOutDate - this.checkInDate) / 86400000);
});

reservationSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1, status: 1 });
reservationSchema.index({ guest: 1, checkInDate: -1 });

export default mongoose.model("Reservation", reservationSchema);