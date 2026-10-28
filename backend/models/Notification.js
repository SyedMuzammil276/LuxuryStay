
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

   
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },

   
    category: {
      type: String,
      enum: [
        "general",
        "guest",
        "room",
        "reservation",
        "billing",
        "housekeeping",
        "maintenance",
        "system",
      ],
      default: "general",
    },

 
    read: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

   
    targetRole: {
      type: String,
      enum: [
        "all",
        "admin",
        "manager",
        "receptionist",
        "housekeeping",
        "maintenance",
        "guest",
      ],
      default: "all",
    },

   
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    relatedModel: {
      type: String,
      trim: true,
      default: null,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ read: 1, createdAt: -1 });

NotificationSchema.index({
  targetUser: 1,
  read: 1,
  createdAt: -1,
});

NotificationSchema.index({
  targetRole: 1,
  read: 1,
  createdAt: -1,
});

export default mongoose.model("Notification", NotificationSchema);
