import crypto from "node:crypto";
import mongoose from "mongoose";

import Guest from "../models/Guest.js";
import Room from "../models/Room.js";
import Reservation from "../models/Reservation.js";
import HousekeepingTask from "../models/HousekeepingTask.js";

import createNotification from "../utils/createNotification.js";
import sendReservationEmail from "../utils/sendReservationEmail.js";

const ACTIVE_RESERVATION_STATUSES = ["confirmed", "checked_in"];

const RESERVATION_STATUSES = [
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "no_show"
];

const FRONT_DESK_NOTIFY_ROLES = [
  "receptionist",
  "manager",
  "admin"
];

const RESERVATION_BODY_FIELDS = [
  "guestId",
  "roomId",
  "checkInDate",
  "checkOutDate",
  "guestsCount",
  "specialRequests"
];

const HOTEL_TIME_ZONE = "Asia/Karachi";

const findUnknownFields = (body, allowed) =>
  Object.keys(body ?? {}).filter(
    (key) => !allowed.includes(key)
  );

const isValidId = (id) =>
  mongoose.isValidObjectId(id);

const isGuestUser = (user) =>
  user.role === "guest";


const getHotelDateParts = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HOTEL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value);

  const part = (type) =>
    parts.find((item) => item.type === type)?.value;

  return {
    year: Number(part("year")),
    month: Number(part("month")),
    day: Number(part("day"))
  };
};


const toHotelCalendarDate = (value) => {
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (match) {
      const [, year, month, day] = match;

      const date = new Date(
        Date.UTC(
          Number(year),
          Number(month) - 1,
          Number(day)
        )
      );

      if (
        date.getUTCFullYear() !== Number(year) ||
        date.getUTCMonth() !== Number(month) - 1 ||
        date.getUTCDate() !== Number(day)
      ) {
        return null;
      }

      return date;
    }
  }

  const date =
    value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const { year, month, day } =
    getHotelDateParts(date);

  return new Date(
    Date.UTC(year, month - 1, day)
  );
};

const startOfToday = () =>
  toHotelCalendarDate(new Date());

const canAccessReservation = (user, reservation) =>
  !isGuestUser(user) ||
  String(
    reservation.guest?._id ?? reservation.guest
  ) === String(user._id);

const guestCanChange = (reservation) => {
  const checkInDate =
    toHotelCalendarDate(reservation.checkInDate);

  return Boolean(
    checkInDate &&
    checkInDate.getTime() > startOfToday().getTime()
  );
};

const notify = async (data) => {
  try {
    return await createNotification(data);
  } catch (error) {
    console.error(
      "Reservation notification error:",
      error.message
    );
    return null;
  }
};

const notifyRoles = async (roles, data) => {
  const results = await Promise.all(
    roles.map((role) =>
      notify({
        ...data,
        targetRole: role
      })
    )
  );

  return results.filter(Boolean).length;
};

const notifyFrontDesk = async (
  title,
  message,
  reservation,
  type = "info"
) => {
  const results = await Promise.all(
    FRONT_DESK_NOTIFY_ROLES.map((role) =>
      notify({
        title,
        message,
        category: "reservation",
        type,
        targetRole: role,
        relatedModel: "Reservation",
        relatedId: reservation._id,
        metadata: {
          reservationId: reservation._id,
          guestId:
            reservation.guest?._id ??
            reservation.guest,
          roomId:
            reservation.room?._id ??
            reservation.room
        }
      })
    )
  );

  return results.filter(Boolean).length;
};


const emailGuest = async (
  type,
  guest,
  reservation,
  room
) => {
  if (!guest?.email) return;

  await sendReservationEmail({
    type,
    guest,
    reservation,
    room
  }).catch((error) =>
    console.error(
      "Reservation email error:",
      error.message
    )
  );
};


function parseStayDates(
  checkInDate,
  checkOutDate,
  { allowPast = false } = {}
) {
  const checkIn =
    toHotelCalendarDate(checkInDate);

  const checkOut =
    toHotelCalendarDate(checkOutDate);

  if (!checkIn || !checkOut) {
    return {
      error:
        "Valid checkInDate and checkOutDate are required"
    };
  }

  if (checkOut <= checkIn) {
    return {
      error:
        "checkOutDate must be after checkInDate"
    };
  }

  if (
    !allowPast &&
    checkIn < startOfToday()
  ) {
    return {
      error: "checkInDate cannot be in the past"
    };
  }

  return { checkIn, checkOut };
}

async function findReservationConflict(
  roomId,
  checkIn,
  checkOut,
  { excludeId = null, beforeId = null } = {}
) {
  const filter = {
    room: roomId,
    status: {
      $in: ACTIVE_RESERVATION_STATUSES
    },
    checkInDate: {
      $lt: checkOut
    },
    checkOutDate: {
      $gt: checkIn
    }
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  if (beforeId) {
    filter._id = { $lt: beforeId };
  }

  return Reservation.findOne(filter);
}

const isRoomBlockedForStay = (room, checkIn) =>
  checkIn.getTime() <= startOfToday().getTime() &&
  room.status === "maintenance";

async function releaseRoomIfFree(
  roomId,
  excludeReservationId
) {
  const stillBooked = await Reservation.exists({
    room: roomId,
    status: {
      $in: ACTIVE_RESERVATION_STATUSES
    },
    _id: {
      $ne: excludeReservationId
    },
    checkOutDate: {
      $gt: startOfToday()
    }
  });

  if (stillBooked) {
    return false;
  }

  const result = await Room.updateOne(
    {
      _id: roomId,
      status: "reserved"
    },
    {
      $set: { status: "available" }
    }
  );

  return result.modifiedCount > 0;
}

export async function createReservation(req, res) {
  try {
    const body = req.body ?? {};

    const unknownFields = findUnknownFields(
      body,
      RESERVATION_BODY_FIELDS
    );

    if (unknownFields.length) {
      return res.status(400).json({
        message: "Unknown field(s) in request body",
        unknownFields,
        allowedFields: RESERVATION_BODY_FIELDS
      });
    }

    const {
      roomId,
      checkInDate,
      checkOutDate,
      guestsCount = 1,
      specialRequests
    } = body;

    const isGuest = isGuestUser(req.user);

    const guestId = isGuest
      ? req.user._id
      : body.guestId;

    if (
      !isValidId(guestId) ||
      !isValidId(roomId)
    ) {
      return res.status(400).json({
        message:
          "Valid guestId and roomId are required"
      });
    }

    const dates = parseStayDates(
      checkInDate,
      checkOutDate
    );

    if (dates.error) {
      return res.status(400).json({
        message: dates.error
      });
    }

    const count = Number(guestsCount);

    if (
      !Number.isInteger(count) ||
      count < 1
    ) {
      return res.status(400).json({
        message:
          "guestsCount must be a positive whole number"
      });
    }

    const [guest, room] = await Promise.all([
      Guest.findOne({
        _id: guestId,
        isActive: true
      }),
      Room.findOne({
        _id: roomId,
        isActive: true
      })
    ]);

    if (!guest) {
      return res.status(404).json({
        message: "Active guest not found"
      });
    }

    if (!room) {
      return res.status(404).json({
        message: "Active room not found"
      });
    }

    if (isGuest && !guest.emailVerified) {
      return res.status(403).json({
        message:
          "Verify your email before booking"
      });
    }

    if (count > room.capacity) {
      return res.status(400).json({
        message:
          "Guest count exceeds room capacity"
      });
    }

    if (
      isRoomBlockedForStay(
        room,
        dates.checkIn
      )
    ) {
      return res.status(409).json({
        message:
          `Room is currently ${room.status}`
      });
    }

    const conflict =
      await findReservationConflict(
        room._id,
        dates.checkIn,
        dates.checkOut
      );

    if (conflict) {
      return res.status(409).json({
        message:
          "Room is already reserved for some or all of these dates",
        ...(!isGuest && {
          conflictingReservationId: conflict._id
        })
      });
    }

    const reservation =
      await Reservation.create({
        confirmationCode:
          `LS-${crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase()}`,
        guest: guest._id,
        room: room._id,
        checkInDate: dates.checkIn,
        checkOutDate: dates.checkOut,
        guestsCount: count,
        specialRequests,
        createdBy: isGuest
          ? undefined
          : req.user._id,
        bookedBy: req.user.role
      });

    const earlierClash =
      await findReservationConflict(
        room._id,
        dates.checkIn,
        dates.checkOut,
        { beforeId: reservation._id }
      );

    if (earlierClash) {
      await reservation.deleteOne();

      return res.status(409).json({
        message:
          "Room was just booked by someone else for these dates"
      });
    }

    if (room.status === "available") {
      room.status = "reserved";
      await room.save();
    }

    if (isGuest) {
      await notifyFrontDesk(
        "New online reservation",
        `Reservation ${reservation.confirmationCode} was created for room ${room.roomNumber}.`,
        reservation
      );
    } else {
      await notifyRoles(
        FRONT_DESK_NOTIFY_ROLES,
        {
          title: "Reservation confirmed",
          message:
            "A reservation has been confirmed.",
          category: "reservation",
          type: "success",
          createdBy: req.user._id,
          relatedModel: "Reservation",
          relatedId: reservation._id,
          metadata: {
            reservationId: reservation._id,
            roomId:
              reservation.room?._id ??
              reservation.room
          }
        }
      );
    }

    emailGuest(
      "confirmed",
      guest,
      reservation,
      room
    );

    await reservation.populate([
      {
        path: "guest",
        select:
          "firstName lastName email phone"
      },
      {
        path: "room",
        select: "roomNumber roomType"
      }
    ]);

    return res.status(201).json({
      message: "Reservation created successfully",
      reservation
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Confirmation code conflict; please retry"
      });
    }

    return res.status(500).json({
      message: "Could not create reservation",
      error: error.message
    });
  }
}

export async function listReservations(req, res) {
  try {
    const filter = {};

    if (req.query.status) {
      if (!RESERVATION_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          message: "Invalid status",
          validStatuses: RESERVATION_STATUSES
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.guestId) {
      if (!isValidId(req.query.guestId)) {
        return res.status(400).json({
          message: "Invalid guestId"
        });
      }

      filter.guest = req.query.guestId;
    }

    if (req.query.roomId) {
      if (!isValidId(req.query.roomId)) {
        return res.status(400).json({
          message: "Invalid roomId"
        });
      }

      filter.room = req.query.roomId;
    }

    if (req.query.confirmationCode) {
      filter.confirmationCode = String(
        req.query.confirmationCode
      )
        .trim()
        .toUpperCase();
    }

    const from = req.query.from
      ? toHotelCalendarDate(req.query.from)
      : null;

    const to = req.query.to
      ? toHotelCalendarDate(req.query.to)
      : null;

    if (
      (req.query.from && !from) ||
      (req.query.to && !to)
    ) {
      return res.status(400).json({
        message: "Invalid from/to date"
      });
    }

    if (from || to) {
      filter.checkInDate = {
        ...(from && { $gte: from }),
        ...(to && {
          $lt: new Date(
            to.getTime() + 24 * 60 * 60 * 1000
          )
        })
      };
    }

    if (isGuestUser(req.user)) {
      filter.guest = req.user._id;
    }

    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 20)
    );

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate("guest", "firstName lastName email phone")
        .populate("room", "roomNumber roomType status")
        .populate("createdBy", "name email")
        .sort({ checkInDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      Reservation.countDocuments(filter)
    ]);

    return res.json({
      message: "Reservations fetched successfully",
      count: reservations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      reservations
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not fetch reservations",
      error: error.message
    });
  }
}


export async function listMyReservations(req, res) {
  try {
    const filter = {
      guest: req.user._id
    };

    if (req.query.status) {
      if (!RESERVATION_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          message: "Invalid status",
          validStatuses: RESERVATION_STATUSES
        });
      }

      filter.status = req.query.status;
    }

    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 20)
    );

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate("room", "roomNumber roomType")
        .sort({ checkInDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      Reservation.countDocuments(filter)
    ]);

    return res.json({
      message: "Your reservations fetched successfully",
      count: reservations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      reservations
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not fetch your reservations",
      error: error.message
    });
  }
}


export async function getReservation(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID"
      });
    }

    let query = Reservation.findById(req.params.id)
      .populate(
        "guest",
        "firstName lastName email phone address"
      )
      .populate("room", "roomNumber roomType status");

    if (!isGuestUser(req.user)) {
      query = query.populate("createdBy", "name email");
    }

    const reservation = await query;

    if (
      !reservation ||
      !canAccessReservation(req.user, reservation)
    ) {
      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    return res.json({ reservation });
  } catch (error) {
    return res.status(500).json({
      message: "Could not fetch reservation",
      error: error.message
    });
  }
  
}


export async function updateReservation(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID"
      });
    }

    const body = req.body ?? {};

    const unknownFields = findUnknownFields(
      body,
      RESERVATION_BODY_FIELDS
    );

    if (unknownFields.length) {
      return res.status(400).json({
        message: "Unknown field(s) in request body",
        unknownFields,
        allowedFields: RESERVATION_BODY_FIELDS
      });
    }

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "Send at least one field to update",
        allowedFields: RESERVATION_BODY_FIELDS
      });
    }

    const reservation = await Reservation.findById(
      req.params.id
    );

    if (
      !reservation ||
      !canAccessReservation(req.user, reservation)
    ) {
      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    if (reservation.status !== "confirmed") {
      return res.status(409).json({
        message: "Only confirmed reservations can be edited"
      });
    }

    if (
      isGuestUser(req.user) &&
      !guestCanChange(reservation)
    ) {
      return res.status(409).json({
        message:
          "This reservation can no longer be changed online. Please contact the front desk."
      });
    }

    const nextGuestId = isGuestUser(req.user)
      ? reservation.guest
      : body.guestId ?? reservation.guest;

    const nextRoomId =
      body.roomId ?? reservation.room;

    const nextCheckInInput =
      body.checkInDate ?? reservation.checkInDate;

    const nextCheckOutInput =
      body.checkOutDate ?? reservation.checkOutDate;

    if (
      !isValidId(nextGuestId) ||
      !isValidId(nextRoomId)
    ) {
      return res.status(400).json({
        message: "Invalid guestId or roomId"
      });
    }

    const dates = parseStayDates(
      nextCheckInInput,
      nextCheckOutInput,
      { allowPast: true }
    );

    if (dates.error) {
      return res.status(400).json({
        message: dates.error
      });
    }

    const oldCheckIn = toHotelCalendarDate(
      reservation.checkInDate
    );

    const checkInChanged =
      dates.checkIn.getTime() !== oldCheckIn.getTime();

    if (
      checkInChanged &&
      dates.checkIn < startOfToday()
    ) {
      return res.status(400).json({
        message: "checkInDate cannot be in the past"
      });
    }

    const [guest, room] = await Promise.all([
      Guest.findOne({
        _id: nextGuestId,
        isActive: true
      }),

      Room.findOne({
        _id: nextRoomId,
        isActive: true
      })
    ]);

    if (!guest) {
      return res.status(404).json({
        message: "Active guest not found"
      });
    }

    if (!room) {
      return res.status(404).json({
        message: "Active room not found"
      });
    }

    const oldRoomId = String(reservation.room);
    const roomChanged =
      oldRoomId !== String(room._id);

    if (
      roomChanged &&
      isRoomBlockedForStay(room, dates.checkIn)
    ) {
      return res.status(409).json({
        message: `Room is currently ${room.status}`
      });
    }

    const count = Number(
      body.guestsCount ?? reservation.guestsCount
    );

    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > room.capacity
    ) {
      return res.status(400).json({
        message: "guestsCount must be between 1 and room capacity"
      });
    }

    const conflict = await findReservationConflict(
      room._id,
      dates.checkIn,
      dates.checkOut,
      { excludeId: reservation._id }
    );

    if (conflict) {
      return res.status(409).json({
        message: "Room is already reserved for these dates"
      });
    }

    reservation.guest = guest._id;
    reservation.room = room._id;
    reservation.checkInDate = dates.checkIn;
    reservation.checkOutDate = dates.checkOut;
    reservation.guestsCount = count;

    if (body.specialRequests !== undefined) {
      reservation.specialRequests = body.specialRequests;
    }

    await reservation.save();

    if (roomChanged) {
      if (room.status === "available") {
        room.status = "reserved";
        await room.save();
      }

      await releaseRoomIfFree(
        oldRoomId,
        reservation._id
      );
    }

    if (isGuestUser(req.user)) {
      await notifyFrontDesk(
        "Reservation updated by guest",
        `Reservation ${reservation.confirmationCode} was updated by the guest.`,
        reservation
      );
    } else {
      await notifyRoles(
        FRONT_DESK_NOTIFY_ROLES,
        {
          title: "Reservation updated",
          message: "A reservation has been updated.",
          category: "reservation",
          type: "info",
          createdBy: req.user._id,
          relatedModel: "Reservation",
          relatedId: reservation._id,
          metadata: {
            reservationId: reservation._id,
            roomId:
              reservation.room?._id ??
              reservation.room
          }
        }
      );

      await notify({
        title: "Reservation updated",
        message:
          `Your reservation ${reservation.confirmationCode} has been updated by the staff.`,
        category: "reservation",
        type: "info",
        targetRole: "guest",
        targetUser: guest._id,
        relatedModel: "Reservation",
        relatedId: reservation._id,
        metadata: {
          reservationId: reservation._id,
          roomId:
            reservation.room?._id ??
            reservation.room
        }
      });
    }

    emailGuest(
      "updated",
      guest,
      reservation,
      room
    );

    await reservation.populate([
      {
        path: "guest",
        select: "firstName lastName email phone"
      },
      {
        path: "room",
        select: "roomNumber roomType status"
      }
    ]);

    return res.json({
      message: "Reservation updated successfully",
      reservation
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update reservation",
      error: error.message
    });
  }
}


export async function cancelReservation(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID"
      });
    }

    const reservation = await Reservation.findById(
      req.params.id
    )
      .populate("room")
      .populate("guest", "firstName lastName email");

    if (
      !reservation ||
      !canAccessReservation(req.user, reservation)
    ) {
      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    if (reservation.status !== "confirmed") {
      return res.status(409).json({
        message: "Only confirmed reservations can be cancelled"
      });
    }

    const isGuest = isGuestUser(req.user);

    if (isGuest && !guestCanChange(reservation)) {
      return res.status(409).json({
        message:
          "This reservation can no longer be cancelled online. Please contact the front desk."
      });
    }

    const reason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim().slice(0, 500)
        : undefined;

    reservation.status = "cancelled";
    reservation.cancelledAt = new Date();
    reservation.cancelledBy = req.user.role;

    if (reason) {
      reservation.cancellationReason = reason;
    }

    await reservation.save();

    const released = await releaseRoomIfFree(
      reservation.room._id,
      reservation._id
    );

    if (released) {
      reservation.room.status = "available";
    }

    if (isGuest) {
      await notifyFrontDesk(
        "Reservation cancelled by guest",
        `Reservation ${reservation.confirmationCode} was cancelled by the guest.`,
        reservation,
        "warning"
      );
    } else {
      await notifyRoles(
        FRONT_DESK_NOTIFY_ROLES,
        {
          title: "Reservation cancelled",
          message: "A reservation has been cancelled.",
          category: "reservation",
          type: "warning",
          createdBy: req.user._id,
          relatedModel: "Reservation",
          relatedId: reservation._id,
          metadata: {
            reservationId: reservation._id,
            roomId:
              reservation.room?._id ??
              reservation.room
          }
        }
      );

      await notify({
        title: "Reservation cancelled",
        message:
          `Your reservation ${reservation.confirmationCode} has been cancelled by the staff.`,
        category: "reservation",
        type: "warning",
        targetRole: "guest",
        targetUser: reservation.guest._id,
        relatedModel: "Reservation",
        relatedId: reservation._id,
        metadata: {
          reservationId: reservation._id,
          roomId:
            reservation.room?._id ??
            reservation.room
        }
      });
    }

    emailGuest(
      "cancelled",
      reservation.guest,
      reservation,
      reservation.room
    );

    return res.json({
      message: "Reservation cancelled successfully",
      reservation
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not cancel reservation",
      error: error.message
    });
  }
}


export async function markNoShow(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID"
      });
    }

    const reservation = await Reservation.findById(
      req.params.id
    ).populate("room");

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    if (reservation.status !== "confirmed") {
      return res.status(409).json({
        message:
          "Only confirmed reservations can be marked as no-show"
      });
    }

    const checkInDate = toHotelCalendarDate(
      reservation.checkInDate
    );

    const today = startOfToday();

    if (!checkInDate) {
      return res.status(400).json({
        message: "Invalid reservation check-in date"
      });
    }

    if (checkInDate >= today) {
      return res.status(409).json({
        message: "The check-in day has not passed yet"
      });
    }

    reservation.status = "no_show";
    await reservation.save();

    const released = await releaseRoomIfFree(
      reservation.room._id,
      reservation._id
    );

    if (released) {
      reservation.room.status = "available";
      await reservation.room.save();
    }

    await notifyRoles(
      FRONT_DESK_NOTIFY_ROLES,
      {
        title: "Reservation marked as no-show",
        message: "A guest has been marked as a no-show.",
        category: "reservation",
        type: "warning",
        createdBy: req.user._id,
        relatedModel: "Reservation",
        relatedId: reservation._id,
        metadata: {
          reservationId: reservation._id,
          roomId:
            reservation.room?._id ??
            reservation.room
        }
      }
    );

    return res.json({
      message: "Reservation marked as no-show",
      reservation
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not mark reservation as no-show",
      error: error.message
    });
  }
}


export async function checkIn(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID"
      });
    }

    const reservation = await Reservation.findById(
      req.params.id
    ).populate("room");

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    if (reservation.status !== "confirmed") {
      return res.status(409).json({
        message: "Reservation is not awaiting check-in"
      });
    }

    const today = startOfToday();
    const checkInDate = toHotelCalendarDate(
      reservation.checkInDate
    );
    const checkOutDate = toHotelCalendarDate(
      reservation.checkOutDate
    );

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "Invalid reservation dates"
      });
    }

    if (today < checkInDate) {
      return res.status(409).json({
        message: "Check-in date has not started yet"
      });
    }

    if (today >= checkOutDate) {
      return res.status(409).json({
        message: "The stay period has already ended"
      });
    }

    if (
      !reservation.room.isActive ||
      ["maintenance", "cleaning", "occupied"].includes(
        reservation.room.status
      )
    ) {
      return res.status(409).json({
        message:
          `Room cannot be checked in while it is ${reservation.room.status}`
      });
    }

    const conflict = await Reservation.findOne({
      _id: {
        $ne: reservation._id
      },
      room: reservation.room._id,
      status: "checked_in"
    });

    if (conflict) {
      return res.status(409).json({
        message:
          "Room is already occupied by another active reservation"
      });
    }

    reservation.status = "checked_in";
    reservation.checkedInAt = new Date();

    await reservation.save();

    reservation.room.status = "occupied";
    await reservation.room.save();

    await notifyRoles(
      FRONT_DESK_NOTIFY_ROLES,
      {
        title: "Guest checked in",
        message: "A guest has checked in.",
        category: "reservation",
        type: "success",
        createdBy: req.user._id,
        relatedModel: "Reservation",
        relatedId: reservation._id,
        metadata: {
          reservationId: reservation._id,
          guestId:
            reservation.guest?._id ??
            reservation.guest,
          roomId: reservation.room._id
        }
      }
    );

    return res.json({
      message: "Check-in completed successfully",
      reservation
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not check in guest",
      error: error.message
    });
  }
}



export async function checkOut(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID"
      });
    }

    const reservation = await Reservation.findById(
      req.params.id
    ).populate("room");

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    if (reservation.status !== "checked_in") {
      return res.status(409).json({
        message:
          "Only checked-in reservations can be checked out"
      });
    }

    const room = reservation.room;

    reservation.status = "checked_out";
    reservation.checkedOutAt = new Date();

    await reservation.save();

    room.status = "cleaning";
    await room.save();

    const task = await HousekeepingTask.create({
      room: room._id,
      reservation: reservation._id,
      taskType: "checkout_cleaning",
      priority: "high",
      notes:
        `Prepare room after checkout for reservation ${reservation.confirmationCode}`,
      createdBy: req.user._id
    });

    await Promise.all([
      notifyRoles(
        ["housekeeping"],
        {
          title: "Guest checked out",
          message:
            "A guest has checked out. The room needs cleaning.",
          category: "housekeeping",
          type: "info",
          createdBy: req.user._id,
          relatedModel: "Reservation",
          relatedId: reservation._id,
          metadata: {
            reservationId: reservation._id,
            roomId: room._id,
            taskId: task._id
          }
        }
      ),

      notifyRoles(
        FRONT_DESK_NOTIFY_ROLES,
        {
          title: "Guest checked out",
          message: "A guest has checked out successfully.",
          category: "reservation",
          type: "success",
          createdBy: req.user._id,
          relatedModel: "Reservation",
          relatedId: reservation._id,
          metadata: {
            reservationId: reservation._id,
            roomId: room._id
          }
        }
      )
    ]);

    return res.json({
      message:
        "Check-out completed. Room moved to cleaning and a housekeeping task was created.",
      reservation,
      housekeepingTask: task
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not check out guest",
      error: error.message
    });
  }
}  