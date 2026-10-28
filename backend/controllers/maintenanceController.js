import mongoose from "mongoose";

import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import Reservation from "../models/Reservation.js";
import HousekeepingTask from "../models/HousekeepingTask.js";
import createNotification from "../utils/createNotification.js";
import sendMaintenanceAssignedEmail from "../utils/sendmaintenanceassignedemail.js";

const VALID_CATEGORIES = [
  "plumbing",
  "electrical",
  "hvac",
  "furniture",
  "appliance",
  "safety",
  "other",
];

const VALID_PRIORITIES = ["low", "normal", "high", "urgent"];

const VALID_STATUSES = ["open", "in_progress", "resolved", "cancelled"];

const MAINTENANCE_ROLE = "maintenance";
const MANAGEMENT_ROLES = ["admin", "manager", "receptionist"];
const CLOSED_STATUSES = ["resolved", "cancelled"];


const STATUS_TRANSITIONS = {
  open: ["in_progress", "resolved"],
  in_progress: ["resolved"],
};

const isValidId = (id) => mongoose.isValidObjectId(id);


const normalizeAssignee = (value) => (value === "" ? null : value);


const findAssignableUser = (userId) =>
  User.findOne({
    _id: userId,
    isActive: true,
    role: MAINTENANCE_ROLE,
  }).select("name email");

const REQUEST_POPULATE = [
  { path: "room", select: "roomNumber roomType status" },
  { path: "reportedBy", select: "name email" },
  { path: "assignedTo", select: "name email" },
];

const notificationType = (priority) =>
  priority === "urgent" || priority === "high" ? "warning" : "info";


async function notifyAssignee({
  assignee,
  room,
  request,
  assignedBy,
  createdBy,
}) {
  if (!assignee?._id) return;

  
  try {
    await createNotification({
      title: "Maintenance request assigned",
      message: `Maintenance request "${request.title}" for room ${room.roomNumber} has been assigned to you.`,
      category: "maintenance",
      type: notificationType(request.priority),
      targetRole: MAINTENANCE_ROLE,
      targetUser: assignee._id,
      createdBy,
      relatedModel: "MaintenanceRequest",
      relatedId: request._id,
      metadata: {
        maintenanceRequestId: request._id,
        roomId: room._id,
        assignedTo: assignee._id,
      },
    });
  } catch (err) {
    console.error(
      "Maintenance assignee notification failed:",
      err.message
    );
  }

  
  if (!assignee.email) return;

   await sendMaintenanceAssignedEmail({
    to: assignee.email,
    name: assignee.name,
    roomNumber: room.roomNumber,
    title: request.title,
    category: request.category,
    priority: request.priority,
    description: request.description,
    assignedBy,
  }).catch((err) =>
    console.error(
      "Maintenance assignment email failed:",
      err.message
    )
  );
}


async function notifyRoles({ roles, category = "maintenance", ...payload }) {
  const results = await Promise.allSettled(
    roles.map((role) =>
       createNotification({
        ...payload,
        category,
        targetRole: role,
      })
    )
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(
        "Maintenance notification failed:",
        result.reason?.message
      );
    }
  });

  return results.filter((result) => result.status === "fulfilled").length;
}


async function releaseRoomAfterRequest(room, requestId) {
  if (!room || room.status !== "maintenance") return;

 
  const otherOpenRequest = await MaintenanceRequest.exists({
    _id: { $ne: requestId },
    room: room._id,
    status: { $in: ["open", "in_progress"] },
  });

  if (otherOpenRequest) return;

  const activeStay = await Reservation.exists({
    room: room._id,
    status: "checked_in",
  });

  if (activeStay) {
    room.status = "occupied";
    await room.save();
    return;
  }

  const pendingCleaning = await HousekeepingTask.exists({
    room: room._id,
    status: { $in: ["pending", "in_progress"] },
  });

  if (pendingCleaning) {
    room.status = "cleaning";
    await room.save();
    return;
  }

  const upcomingReservation = await Reservation.exists({
    room: room._id,
    status: "confirmed",
    checkOutDate: { $gt: new Date() },
  });

  room.status = upcomingReservation ? "reserved" : "available";
  await room.save();
}



export async function createMaintenanceRequest(req, res) {
  try {
    const {
      title,
      description,
      category = "other",
      priority = "normal",
    } = req.body;

   
    const roomId = req.body.roomId ?? req.body.room;

    const assignedToId = normalizeAssignee(req.body.assignedTo ?? null);

    if (
      !isValidId(roomId) ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "roomId, title and description are required",
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid category",
        validCategories: VALID_CATEGORIES,
      });
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
        validPriorities: VALID_PRIORITIES,
      });
    }

    if (assignedToId && !isValidId(assignedToId)) {
      return res.status(400).json({ message: "Invalid assignedTo user ID" });
    }

    const room = await Room.findOne({ _id: roomId, isActive: true });

    if (!room) {
      return res.status(404).json({ message: "Active room not found" });
    }

    let assignee = null;

    if (assignedToId) {
      assignee = await findAssignableUser(assignedToId);

      if (!assignee) {
        return res.status(400).json({
          message: "assignedTo must be an active maintenance staff member",
        });
      }
    }

    const request = await MaintenanceRequest.create({
      room: room._id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      assignedTo: assignee ? assignee._id : null,
      reportedBy: req.user._id,
    });

    room.status = "maintenance";
    await room.save();

   
 
await notifyRoles({
  roles: [MAINTENANCE_ROLE, ...MANAGEMENT_ROLES],
  title: "Maintenance request created",
  message: `Maintenance request "${request.title}" opened for room ${room.roomNumber}.`,
  category: "maintenance",
  type: notificationType(priority),
  createdBy: req.user._id,
  relatedModel: "MaintenanceRequest",
  relatedId: request._id,
  metadata: {
    maintenanceRequestId: request._id,
    roomId: room._id,
  },
});


   await request.populate(REQUEST_POPULATE);

if (assignee) {
  await notifyAssignee({
    assignee,
    room,
    request,
    assignedBy: req.user.name,
    createdBy: req.user._id,
  });
}

    return res.status(201).json({
      message: "Maintenance request created successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not create maintenance request",
      error: error.message,
    });
  }
}



export async function listMaintenanceRequests(req, res) {
  try {
    const filter = {};

    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          message: "Invalid status",
          validStatuses: VALID_STATUSES,
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.roomId) {
      if (!isValidId(req.query.roomId)) {
        return res.status(400).json({ message: "Invalid roomId" });
      }

      filter.room = req.query.roomId;
    }

    if (req.query.priority) {
      if (!VALID_PRIORITIES.includes(req.query.priority)) {
        return res.status(400).json({
          message: "Invalid priority",
          validPriorities: VALID_PRIORITIES,
        });
      }

      filter.priority = req.query.priority;
    }

    if (req.user.role === MAINTENANCE_ROLE) {
      
      filter.assignedTo = req.user._id;
    } else if (req.query.unassigned === "true") {
      
      filter.assignedTo = null;
    } else if (req.query.assignedTo) {
      if (!isValidId(req.query.assignedTo)) {
        return res.status(400).json({ message: "Invalid assignedTo" });
      }

      filter.assignedTo = req.query.assignedTo;
    }

    const requestedLimit = Number(req.query.limit) || 50;
    const limit = Math.min(100, Math.max(1, requestedLimit));

    const requests = await MaintenanceRequest.find(filter)
      .populate("room", "roomNumber roomType status")
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      message: "Maintenance requests fetched successfully",
      count: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not fetch maintenance requests",
      error: error.message,
    });
  }
}



export async function getMaintenanceRequestById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid maintenance request ID" });
    }

    const filter = { _id: id };

    
    if (req.user.role === MAINTENANCE_ROLE) {
      filter.assignedTo = req.user._id;
    }

    const request = await MaintenanceRequest.findOne(filter)
      .populate("room", "roomNumber roomType floor status")
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email");

    if (!request) {
      return res.status(404).json({
        message: "Maintenance request not found",
      });
    }

    return res.status(200).json({
      message: "Maintenance request fetched successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not fetch maintenance request",
      error: error.message,
    });
  }
}



export async function updateMaintenanceRequest(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid maintenance request ID" });
    }

    const request = await MaintenanceRequest.findById(id).populate("room");

    if (!request) {
      return res.status(404).json({
        message: "Maintenance request not found",
      });
    }

    if (CLOSED_STATUSES.includes(request.status)) {
      return res.status(400).json({
        message: `A ${request.status} request cannot be updated`,
      });
    }

    const {
      status,
      title,
      description,
      category,
      priority,
      assignedTo,
      resolutionNotes,
    } = req.body;

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        validStatuses: VALID_STATUSES,
      });
    }

    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid category",
        validCategories: VALID_CATEGORIES,
      });
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
        validPriorities: VALID_PRIORITIES,
      });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || !description.trim())
    ) {
      return res.status(400).json({ message: "Description cannot be empty" });
    }

   
    const previousAssigneeId = request.assignedTo
      ? request.assignedTo.toString()
      : null;
    const previousStatus = request.status;

    let newAssignee = null;
    let unassign = false;

    if (assignedTo !== undefined) {
      const assignedToId = normalizeAssignee(assignedTo);

      if (assignedToId === null) {
        unassign = true;
      } else {
        if (!isValidId(assignedToId)) {
          return res.status(400).json({ message: "Invalid assignedTo user ID" });
        }

        const assignee = await findAssignableUser(assignedToId);

        if (!assignee) {
          return res.status(400).json({
            message: "assignedTo must be an active maintenance staff member",
          });
        }

        
        if (assignee._id.toString() !== previousAssigneeId) {
          newAssignee = assignee;
        }

        request.assignedTo = assignee._id;
      }
    }

    if (unassign) request.assignedTo = null;
    if (title !== undefined) request.title = title.trim();
    if (description !== undefined) request.description = description.trim();
    if (category !== undefined) request.category = category;
    if (priority !== undefined) request.priority = priority;
    if (resolutionNotes !== undefined) request.resolutionNotes = resolutionNotes;

    if (status !== undefined) {
      request.status = status;

      if (status === "resolved" && previousStatus !== "resolved") {
        request.resolvedAt = new Date();
      }
    }

    await request.save();

    const room = request.room;
    const statusChanged = status !== undefined && status !== previousStatus;

    if (statusChanged && CLOSED_STATUSES.includes(request.status)) {
      await releaseRoomAfterRequest(room, request._id);
    }

    await request.populate(REQUEST_POPULATE);

 if (newAssignee && room && !CLOSED_STATUSES.includes(request.status)) {
  try {
    await notifyRoles({
      roles: [MAINTENANCE_ROLE, ...MANAGEMENT_ROLES],
      title: "Maintenance request assigned",
      message: `Maintenance request "${request.title}" for room ${room.roomNumber} assigned to ${newAssignee.name}.`,
      category: "maintenance",
      type: notificationType(request.priority),
      createdBy: req.user._id,
      relatedModel: "MaintenanceRequest",
      relatedId: request._id,
      metadata: {
        maintenanceRequestId: request._id,
        roomId: room._id,
        assignedTo: newAssignee._id,
      },
    });
  } catch (err) {
    console.error(
      "Maintenance assignment notification failed:",
      err.message
    );
  }

  await notifyAssignee({
    assignee: newAssignee,
    room,
    request,
    assignedBy: req.user.name,
    createdBy: req.user._id,
  });
}
    return res.status(200).json({
      message: "Maintenance request updated successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update maintenance request",
      error: error.message,
    });
  }
}



export async function updateMaintenanceRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid maintenance request ID" });
    }

    if (resolutionNotes !== undefined && typeof resolutionNotes !== "string") {
      return res.status(400).json({
        message: "resolutionNotes must be a string",
      });
    }

    const request = await MaintenanceRequest.findById(id).populate("room");

    if (!request) {
      return res.status(404).json({
        message: "Maintenance request not found",
      });
    }

    if (
      !request.assignedTo ||
      request.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "This request is not assigned to you",
      });
    }

    const allowedStatuses = STATUS_TRANSITIONS[request.status] || [];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status change",
        currentStatus: request.status,
        allowedStatuses,
      });
    }

    request.status = status;

    if (resolutionNotes !== undefined) {
      request.resolutionNotes = resolutionNotes;
    }

    if (status === "resolved") {
      request.resolvedAt = new Date();
    }

    await request.save();

    if (status === "resolved") {
      await releaseRoomAfterRequest(request.room, request._id);
    }

    await request.populate(REQUEST_POPULATE);

    const statusLabel = status.replaceAll("_", " ");

    
await notifyRoles({
  roles: MANAGEMENT_ROLES,
  title: `Maintenance request ${statusLabel}`,
  message: `Room ${request.room?.roomNumber} request "${request.title}" marked ${statusLabel} by ${req.user.name}.`,
  category: "maintenance",
  type: status === "resolved" ? "success" : "info",
  createdBy: req.user._id,
  relatedModel: "MaintenanceRequest",
  relatedId: request._id,
  metadata: {
    maintenanceRequestId: request._id,
    roomId: request.room?._id,
    status,
  },
});

    return res.status(200).json({
      message: "Request status updated successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update request status",
      error: error.message,
    });
  }
}