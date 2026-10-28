
import Guest from "../models/Guest.js";
import Room from "../models/Room.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";


export async function dashboardReport(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalGuests,
      activeGuests,
      totalRooms,
      activeRooms,
      roomGroups,
      guestsAddedToday,
      roomsAddedToday,
      unreadNotifications,
      activeStaff,
    ] = await Promise.all([
      Guest.countDocuments(),

      Guest.countDocuments({ isActive: true }),

      Room.countDocuments(),

      Room.countDocuments({ isActive: true }),

      Room.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$status",
            totalRooms: { $sum: 1 },
          },
        },
      ]),

      Guest.countDocuments({
        createdAt: { $gte: today },
      }),

      Room.countDocuments({
        createdAt: { $gte: today },
      }),

      Notification.countDocuments({
        read: false,
        $or: [
          { targetRole: "all" },
          { targetRole: req.user.role },
        ],
      }),

      User.countDocuments({
        role: { $ne: "guest" },
        isActive: true,
      }),
    ]);


    const roomsByStatus = {};
    for (const group of roomGroups) {
      if (group._id) {
        const key = String(group._id).toLowerCase();
        roomsByStatus[key] = (roomsByStatus[key] || 0) + group.totalRooms;
      }
    }

    const occupiedRooms = roomsByStatus.occupied || 0;

    const occupancyRate = activeRooms
      ? Number(
          ((occupiedRooms / activeRooms) * 100).toFixed(2)
        )
      : 0;

    return res.status(200).json({
      message: "Dashboard report generated successfully",
      generatedAt: new Date().toISOString(),

      summary: {
        totalGuests,
        activeGuests,
        totalRooms,
        activeRooms,
        activeStaff,
        occupiedRooms,
        availableRooms: roomsByStatus.available || 0,
        reservedRooms: roomsByStatus.reserved || 0,
        maintenanceRooms: roomsByStatus.maintenance || 0,
        cleaningRooms: roomsByStatus.cleaning || 0,
        occupancyRate,
        unreadNotifications,
        guestsAddedToday,
        roomsAddedToday,
      },

      roomsByStatus,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not generate dashboard report",
      error: error.message,
    });
  }
}


export async function roomReport(req, res) {
  try {
    const rooms = await Room.aggregate([
      { $match: { isActive: true } },

      {
        $group: {
          _id: {
            roomType: "$roomType",
            status: "$status",
          },
          totalRooms: { $sum: 1 },
          averagePricePerNight: { $avg: "$pricePerNight" },
        },
      },

      {
        $project: {
          _id: 0,
          roomType: "$_id.roomType",
          status: "$_id.status",
          totalRooms: 1,
          averagePricePerNight: {
            $round: ["$averagePricePerNight", 2],
          },
        },
      },

      {
        $sort: {
          roomType: 1,
          status: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Room report generated successfully",
      totalGroups: rooms.length,
      rooms,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not generate room report",
      error: error.message,
    });
  }
}


export async function guestReport(req, res) {
  try {
    const guests = await Guest.aggregate([
      {
        $group: {
          _id: {
            active: "$isActive",
            month: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },
          },
          totalGuests: { $sum: 1 },
        },
      },

      { $sort: { "_id.month": -1 } },

      { $limit: 120 },

      {
        $project: {
          _id: 0,
          active: "$_id.active",
          month: "$_id.month",
          totalGuests: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Guest report generated successfully",
      totalGroups: guests.length,
      guests,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not generate guest report",
      error: error.message,
    });
  }
}
