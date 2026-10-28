import mongoose from "mongoose";

const housekeepingTaskSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation", default: null },
    taskType: {
      type: String,
      enum: ["checkout_cleaning", "routine_cleaning", "deep_cleaning", "inspection", "linen_change"],
      default: "routine_cleaning"
    },
    status: { type: String, enum: ["pending", "in_progress", "completed", "cancelled"], default: "pending", index: true },
    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, trim: true, maxlength: 1500 },
    completedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

housekeepingTaskSchema.index({ status: 1, priority: 1, createdAt: -1 });

export default mongoose.model("HousekeepingTask", housekeepingTaskSchema);
