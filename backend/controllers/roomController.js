import Room from "../models/Room.js";
import createNotification from "../utils/createNotification.js";


const MANAGEMENT_ROLES = ["admin", "manager", "receptionist"];

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
      console.error("Room notification failed:", result.reason?.message);
    }
  });

  return results.filter((result) => result.status === "fulfilled").length;
}


const validStatuses = [
  "available",
  "occupied",
  "reserved",
  "maintenance",
  "cleaning"
];

export async function createRoom(req, res) {
  try {
    const {
      roomNumber,
      roomType,
      floor,
      capacity,
      pricePerNight,
      status,
      amenities,
      description,
      isActive
    } = req.body;

    if (
      roomNumber === undefined ||
      pricePerNight === undefined
    ) {
      return res.status(400).json({
        message: "roomNumber and pricePerNight are required"
      });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      floor,
      capacity,
      pricePerNight,
      status,
      amenities,
      description,
      isActive
    });


await notifyRoles({
  roles: MANAGEMENT_ROLES,
  title: "Room added",
  message: `Room ${room.roomNumber} was added.`,
  category: "room",
  type: "success",
  createdBy: req.user._id,
  relatedModel: "Room",
  relatedId: room._id,
  metadata: {
    roomId: room._id,
  },
});


    return res.status(201).json({
      message: "Room created successfully",
      room
    });
    
  } catch (e) {
    return res
      .status(e.code === 11000 ? 409 : 400)
      .json({
        message:
          e.code === 11000
            ? "Room number already exists"
            : "Could not create room",
        error: e.message
      });
  }
}

export async function listRooms(req, res) {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.roomType) {
      filter.roomType = req.query.roomType;
    }

    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === "true";
    }

    const rooms = await Room.find(filter).sort({
      roomNumber: 1
    });

    return res.json({
      message: "Rooms fetched successfully",
      count: rooms.length,
      rooms
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server error",
      error: e.message
    });
  }
}

export async function getRoom(req, res) {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    return res.json({ room });
  } catch (e) {
    return res.status(400).json({
      message: "Invalid room ID",
      error: e.message
    });
  }
}

export async function updateRoom(req, res) {
  try {
    const allowed = [
      "roomNumber",
      "roomType",
      "floor",
      "capacity",
      "pricePerNight",
      "status",
      "amenities",
      "description",
      "isActive"
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) =>
        allowed.includes(key)
      )
    );

    if (
      updates.status &&
      !validStatuses.includes(updates.status)
    ) {
      return res.status(400).json({
        message: "Invalid room status",
        validStatuses
      });
    }

    const old = await Room.findById(req.params.id);

    if (!old) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    const previousStatus = old.status;

    Object.assign(old, updates);

    await old.save();

  
if (updates.status && updates.status !== previousStatus) {
  await notifyRoles({
    roles: MANAGEMENT_ROLES,
    title: "Room status changed",
    message: `Room ${old.roomNumber} changed from ${previousStatus} to ${old.status}.`,
    category: "room",
    type: old.status === "maintenance" ? "warning" : "info",
    createdBy: req.user._id,
    relatedModel: "Room",
    relatedId: old._id,
    metadata: {
      roomId: old._id,
      previousStatus,
      status: old.status,
    },
  });
} else {
  await notifyRoles({
    roles: MANAGEMENT_ROLES,
    title: "Room updated",
    message: `Room ${old.roomNumber} was updated.`,
    category: "room",
    type: "info",
    createdBy: req.user._id,
    relatedModel: "Room",
    relatedId: old._id,
    metadata: {
      roomId: old._id,
    },
  });
}


    return res.json({
      message: "Room updated successfully",
      room: old
    });
  } catch (e) {
    return res
      .status(e.code === 11000 ? 409 : 400)
      .json({
        message:
          e.code === 11000
            ? "Room number already exists"
            : "Could not update room",
        error: e.message
      });
  }
}

export async function deleteRoom(req, res) {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    if (
      room.status === "occupied" ||
      room.status === "reserved"
    ) {
      return res.status(409).json({
        message:
          "Occupied or reserved rooms cannot be deleted; change the status first"
      });
    }

    await room.deleteOne();


await notifyRoles({
  roles: MANAGEMENT_ROLES,
  title: "Room removed",
  message: `Room ${room.roomNumber} was removed from inventory.`,
  category: "room",
  type: "warning",
  createdBy: req.user._id,
  relatedModel: "Room",
  relatedId: room._id,
  metadata: {
    roomId: room._id,
  },
});


    return res.json({
      message: "Room deleted successfully"
    });
  } catch (e) {
    return res.status(400).json({
      message: "Could not delete room",
      error: e.message
    });
  }
}