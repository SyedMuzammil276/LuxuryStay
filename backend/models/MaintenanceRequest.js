import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ["plumbing", "electrical", "hvac", "furniture", "appliance", "safety", "other"],
      default: "other"
    },
    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "cancelled"], default: "open", index: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: Date,
    resolutionNotes: { type: String, trim: true, maxlength: 1500 }
  },
  { timestamps: true }
);

maintenanceRequestSchema.index({ status: 1, priority: 1, createdAt: -1 });

export default mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
