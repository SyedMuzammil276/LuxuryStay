import mongoose from "mongoose";

import HousekeepingTask from "../models/HousekeepingTask.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import Reservation from "../models/Reservation.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import createNotification from "../utils/createNotification.js";
import sendTaskAssignedEmail from "../utils/sendTaskAssignedEmail.js";

const VALID_STATUSES = ["pending", "in_progress", "completed", "cancelled"];

const VALID_TASK_TYPES = [
  "checkout_cleaning",
  "routine_cleaning",
  "deep_cleaning",
  "inspection",
  "linen_change",
];

const VALID_PRIORITIES = ["low", "normal", "high", "urgent"];

const HOUSEKEEPING_ROLE = "housekeeping";
const MANAGEMENT_ROLES = ["admin", "manager", "receptionist"];
const CLOSED_STATUSES = ["completed", "cancelled"];


const STATUS_TRANSITIONS = {
  pending: ["in_progress", "completed"],
  in_progress: ["completed"],
};

const isValidId = (id) => mongoose.isValidObjectId(id);


const normalizeAssignee = (value) => (value === "" ? null : value);


const findAssignableUser = (userId) =>
  User.findOne({
    _id: userId,
    isActive: true,
    role: HOUSEKEEPING_ROLE,
  }).select("name email");

const TASK_POPULATE = [
  { path: "room", select: "roomNumber roomType status" },
  { path: "assignedTo", select: "name email" },
];


 async function notifyAssignee({ assignee, room, task, assignedBy }) {
  if (!assignee?.email) return;

  await sendTaskAssignedEmail({
    to: assignee.email,
    name: assignee.name,
    roomNumber: room.roomNumber,
    taskType: task.taskType,
    priority: task.priority,
    notes: task.notes,
    assignedBy,
  }).catch((err) =>
    console.error("Housekeeping assignment email failed:", err.message)
  );
}



async function notifyRoles({ roles, category = "room", ...payload }) {
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
        "Housekeeping notification failed:",
        result.reason?.message
      );
    }
  });

  return results.filter((result) => result.status === "fulfilled").length;
}



async function releaseRoomAfterTask(room, taskId) {
  if (!room || room.status !== "cleaning") return;


  const otherOpenTask = await HousekeepingTask.exists({
    room: room._id,
    _id: { $ne: taskId },
    status: { $in: ["pending", "in_progress"] },
  });

  if (otherOpenTask) return;

  const now = new Date();

  const activeStay = await Reservation.exists({
    room: room._id,
    status: "checked_in",
    checkInDate: { $lte: now },
    checkOutDate: { $gt: now },
  });

  if (activeStay) return;

  const openMaintenance = await MaintenanceRequest.exists({
    room: room._id,
    status: { $in: ["open", "in_progress"] },
  });

  if (openMaintenance) return;

  const upcomingReservation = await Reservation.exists({
    room: room._id,
    status: "confirmed",
    checkOutDate: { $gt: now },
  });

  room.status = upcomingReservation ? "reserved" : "available";
  await room.save();
}



export async function createHousekeepingTask(req, res) {
  try {
    const {
      taskType = "routine_cleaning",
      priority = "normal",
      notes,
      reservation: reservationId = null,
    } = req.body;


    const roomId = req.body.roomId ?? req.body.room;

    const assignedToId = normalizeAssignee(req.body.assignedTo ?? null);

    if (!isValidId(roomId)) {
      return res.status(400).json({ message: "Valid roomId is required" });
    }

    if (!VALID_TASK_TYPES.includes(taskType)) {
      return res.status(400).json({
        message: "Invalid task type",
        validTaskTypes: VALID_TASK_TYPES,
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

    if (reservationId) {
      if (!isValidId(reservationId)) {
        return res.status(400).json({ message: "Invalid reservation ID" });
      }

      const reservationExists = await Reservation.exists({
        _id: reservationId,
        room: room._id,
      });

      if (!reservationExists) {
        return res.status(404).json({
          message: "Reservation not found for this room",
        });
      }
    }

    let assignee = null;

    if (assignedToId) {
      assignee = await findAssignableUser(assignedToId);

      if (!assignee) {
        return res.status(400).json({
          message: "assignedTo must be an active housekeeping staff member",
        });
      }
    }

    const task = await HousekeepingTask.create({
      room: room._id,
      taskType,
      priority,
      reservation: reservationId || null,
      assignedTo: assignee ? assignee._id : null,
      notes,
      createdBy: req.user._id,
    });

    const unavailableStatuses = ["occupied", "maintenance", "reserved"];

    if (!unavailableStatuses.includes(room.status)) {
      room.status = "cleaning";
      await room.save();
    }


    await notifyRoles({
      roles: MANAGEMENT_ROLES,
      title: "Housekeeping task created",
      message: `${taskType.replaceAll("_", " ")} task created for room ${room.roomNumber}.`,
      type: "info",
      category: "housekeeping",
      createdBy: req.user._id,
      relatedModel: "HousekeepingTask",
      relatedId: task._id,
      metadata: {
        taskId: task._id,
        roomId: room._id,
        assignedTo: assignee?._id ?? null,
      },
    });

    if (assignee) {
      await createNotification({
        title: "New housekeeping task assigned",
        message: `${taskType.replaceAll("_", " ")} task assigned to you for room ${room.roomNumber}.`,
        type: "info",
        category: "housekeeping",
        createdBy: req.user._id,
        targetRole: HOUSEKEEPING_ROLE,
        targetUser: assignee._id,
        relatedModel: "HousekeepingTask",
        relatedId: task._id,
        metadata: {
          taskId: task._id,
          roomId: room._id,
          assignedTo: assignee._id,
        },
      });
    }

    await task.populate(TASK_POPULATE);


    if (assignee) {
      notifyAssignee({
        assignee,
        room,
        task,
        assignedBy: req.user.name,
      });
    }

    return res.status(201).json({
      message: "Housekeeping task created successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not create housekeeping task",
      error: error.message,
    });
  }
}



export async function listHousekeepingTasks(req, res) {
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

    if (req.user.role === HOUSEKEEPING_ROLE) {

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

    const tasks = await HousekeepingTask.find(filter)
      .populate("room", "roomNumber roomType status")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("reservation", "confirmationCode checkInDate checkOutDate")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      message: "Housekeeping tasks fetched successfully",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not fetch housekeeping tasks",
      error: error.message,
    });
  }
}



export async function getHousekeepingTaskById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const filter = { _id: id };


    if (req.user.role === HOUSEKEEPING_ROLE) {
      filter.assignedTo = req.user._id;
    }

    const task = await HousekeepingTask.findOne(filter)
      .populate("room", "roomNumber roomType floor status")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("reservation", "confirmationCode checkInDate checkOutDate");

    if (!task) {
      return res.status(404).json({ message: "Housekeeping task not found" });
    }

    return res.status(200).json({
      message: "Housekeeping task fetched successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not fetch housekeeping task",
      error: error.message,
    });
  }
}



export async function updateHousekeepingTask(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await HousekeepingTask.findById(id).populate("room");

    if (!task) {
      return res.status(404).json({ message: "Housekeeping task not found" });
    }

    if (CLOSED_STATUSES.includes(task.status)) {
      return res.status(400).json({
        message: `A ${task.status} task cannot be updated`,
      });
    }

    const { status, taskType, priority, assignedTo, notes } = req.body;

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        validStatuses: VALID_STATUSES,
      });
    }

    if (taskType !== undefined && !VALID_TASK_TYPES.includes(taskType)) {
      return res.status(400).json({
        message: "Invalid task type",
        validTaskTypes: VALID_TASK_TYPES,
      });
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
        validPriorities: VALID_PRIORITIES,
      });
    }


    const previousAssigneeId = task.assignedTo
      ? task.assignedTo.toString()
      : null;
    const previousStatus = task.status;

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
            message: "assignedTo must be an active housekeeping staff member",
          });
        }


        if (assignee._id.toString() !== previousAssigneeId) {
          newAssignee = assignee;
        }

        task.assignedTo = assignee._id;
      }
    }

    if (unassign) task.assignedTo = null;
    if (taskType !== undefined) task.taskType = taskType;
    if (priority !== undefined) task.priority = priority;
    if (notes !== undefined) task.notes = notes;

    if (status !== undefined) {
      task.status = status;

      if (status === "completed" && previousStatus !== "completed") {
        task.completedAt = new Date();
      }
    }

    await task.save();

    const room = task.room;
    const statusChanged = status !== undefined && status !== previousStatus;

    if (statusChanged && CLOSED_STATUSES.includes(task.status)) {
      await releaseRoomAfterTask(room, task._id);
    }

    await task.populate(TASK_POPULATE);

    if (newAssignee && room && !CLOSED_STATUSES.includes(task.status)) {
      try {

        await notifyRoles({
          roles: MANAGEMENT_ROLES,
          title: "Housekeeping task assigned",
          message: `${task.taskType.replaceAll("_", " ")} task for room ${room.roomNumber} assigned to ${newAssignee.name}.`,
          type: "info",
          category: "housekeeping",
          createdBy: req.user._id,
          relatedModel: "HousekeepingTask",
          relatedId: task._id,
          metadata: {
            taskId: task._id,
            roomId: room._id,
            assignedTo: newAssignee._id,
          },
        });


        await createNotification({
          title: "New housekeeping task assigned",
          message: `${task.taskType.replaceAll("_", " ")} task assigned to you for room ${room.roomNumber}.`,
          type: "info",
          category: "housekeeping",
          createdBy: req.user._id,
          targetRole: HOUSEKEEPING_ROLE,
          targetUser: newAssignee._id,
          relatedModel: "HousekeepingTask",
          relatedId: task._id,
          metadata: {
            taskId: task._id,
            roomId: room._id,
            assignedTo: newAssignee._id,
          },
        });


        notifyAssignee({
          assignee: newAssignee,
          room,
          task,
          assignedBy: req.user.name,
        });
      } catch (err) {
        console.error(
          "Housekeeping assignment notification failed:",
          err.message
        );
      }
    }
    return res.status(200).json({
      message: "Housekeeping task updated successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update housekeeping task",
      error: error.message,
    });
  }
}



export async function updateHousekeepingTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await HousekeepingTask.findById(id).populate("room");

    if (!task) {
      return res.status(404).json({ message: "Housekeeping task not found" });
    }

    const isPrivileged = ["admin", "manager", "receptionist"].includes(req.user.role);

    if (
      !isPrivileged &&
      (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        message: "This task is not assigned to you",
      });
    }

    const allowedStatuses = STATUS_TRANSITIONS[task.status] || [];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status change",
        currentStatus: task.status,
        allowedStatuses,
      });
    }

    task.status = status;

    if (status === "completed") {
      task.completedAt = new Date();
    }

    await task.save();

    if (status === "completed") {
      await releaseRoomAfterTask(task.room, task._id);
    }

    await task.populate(TASK_POPULATE);

    const statusLabel = status.replaceAll("_", " ");


    await notifyRoles({
      roles: MANAGEMENT_ROLES,
      title: `Housekeeping task ${statusLabel}`,
      message: `Room ${task.room?.roomNumber} ${task.taskType.replaceAll("_", " ")} task marked ${statusLabel} by ${req.user.name}.`,
      type: status === "completed" ? "success" : "info",
      category: "housekeeping",
      createdBy: req.user._id,
      relatedModel: "HousekeepingTask",
      relatedId: task._id,
      metadata: {
        taskId: task._id,
        roomId: task.room?._id,
        status,
      },
    });


    return res.status(200).json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update task status",
      error: error.message,
    });
  }
}