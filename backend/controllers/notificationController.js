
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const VALID_TYPES = ["info", "success", "warning", "error"];

const VALID_CATEGORIES = [
  "general",
  "guest",
  "room",
  "reservation",
  "service",
  "billing",
  "housekeeping",
  "maintenance",
  "system",
];

const VALID_TARGET_ROLES = [
  "all",
  "admin",
  "manager",
  "receptionist",
  "housekeeping",
  "maintenance",
  "guest",
];

const MANAGER_ALLOWED_ROLES = [
  "receptionist",
  "housekeeping",
  "maintenance",
];

const getNotificationFilter = (user) => ({
  $or: [
    { targetUser: user._id },
    {
      targetUser: null,
      $or: [
        { targetRole: "all" },
        { targetRole: user.role },
      ],
    },
  ],
});

export async function listNotifications(req, res) {
  try {
    const filter = getNotificationFilter(req.user);

    if (req.query.read !== undefined) {
      if (!["true", "false"].includes(req.query.read)) {
        return res.status(400).json({
          message: "read must be true or false",
        });
      }

      filter.read = req.query.read === "true";
    }

    if (req.query.category) {
      if (!VALID_CATEGORIES.includes(req.query.category)) {
        return res.status(400).json({
          message: "Invalid notification category",
          validCategories: VALID_CATEGORIES,
        });
      }

      filter.category = req.query.category;
    }

    const page = Math.max(
      1,
      Math.floor(Number(req.query.page)) || 1
    );

    const requestedLimit = Math.floor(Number(req.query.limit)) || 50;
    const limit = Math.min(100, Math.max(1, requestedLimit));
    const skip = (page - 1) * limit;

    const [notifications, total, unread] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email"),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        ...filter,
        read: false,
      }),
    ]);

    return res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      total,
      unread,
      page,
      pages: Math.ceil(total / limit),
      notifications,
    });
  } catch (error) {
    console.error("List notifications error:", error);

    return res.status(500).json({
      message: "Could not fetch notifications",
    });
  }
}

export async function createManualNotification(req, res) {
  try {
    const {
      title,
      message,
      type = "info",
      category = "general",
      targetRole = "all",
      targetUser = null,
      relatedModel = null,
      relatedId = null,
      metadata = {},
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    if (title.trim().length > 160 || message.trim().length > 2000) {
      return res.status(400).json({
        message: "Title or message exceeds the allowed length",
      });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        message: "Invalid notification type",
        validTypes: VALID_TYPES,
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid notification category",
        validCategories: VALID_CATEGORIES,
      });
    }

    if (!VALID_TARGET_ROLES.includes(targetRole)) {
      return res.status(400).json({
        message: "Invalid target role",
        validTargetRoles: VALID_TARGET_ROLES,
      });
    }

    if (
      req.user.role === "manager" &&
      !MANAGER_ALLOWED_ROLES.includes(targetRole)
    ) {
      return res.status(403).json({
        message:
          "Managers can only target receptionist, housekeeping, or maintenance",
      });
    }

    if (
      targetUser !== null &&
      (typeof targetUser !== "string" ||
        !mongoose.isValidObjectId(targetUser))
    ) {
      return res.status(400).json({
        message: "Invalid target user ID",
      });
    }

    if (targetUser) {
      const recipient = await User.findById(targetUser).select("_id role");

      if (!recipient) {
        return res.status(404).json({
          message: "Target user not found",
        });
      }

      if (req.user.role === "manager") {
        if (!MANAGER_ALLOWED_ROLES.includes(recipient.role)) {
          return res.status(403).json({
            message: "Managers cannot target this user",
          });
        }
      }
    }

    if (relatedId !== null && !mongoose.isValidObjectId(relatedId)) {
      return res.status(400).json({
        message: "Invalid related record ID",
      });
    }

    if (
      relatedModel !== null &&
      (typeof relatedModel !== "string" ||
        !relatedModel.trim())
    ) {
      return res.status(400).json({
        message: "Invalid related model",
      });
    }

    if (
      !metadata ||
      typeof metadata !== "object" ||
      Array.isArray(metadata)
    ) {
      return res.status(400).json({
        message: "Metadata must be an object",
      });
    }

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type,
      category,
      targetRole: targetUser ? "all" : targetRole,
      targetUser,
      relatedModel: relatedModel?.trim() || null,
      relatedId,
      metadata,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      message: "Could not create notification",
    });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        ...getNotificationFilter(req.user),
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      message: "Could not update notification",
    });
  }
}

export async function markAllRead(req, res) {
  try {
    const filter = {
      ...getNotificationFilter(req.user),
      read: false,
    };

    const result = await Notification.updateMany(filter, {
      $set: {
        read: true,
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      message: "Could not update notifications",
    });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      ...getNotificationFilter(req.user),
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      message: "Could not delete notification",
    });
  }
}
