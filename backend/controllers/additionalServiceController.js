import mongoose from "mongoose";
import AdditionalService from "../models/AdditionalService.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import Guest from "../models/Guest.js";
import createNotification from "../utils/createNotification.js";
import sendServiceEmail from "../utils/sendServiceEmail.js";
import sendAssignmentEmail from "../utils/sendAssignmentEmail.js";

const SERVICE_PRICES = {
  food: 1500,
  laundry: 800,
  transportation: 2500,
  wake_up_call: 0,
  room_service: 1000,
};

const SERVICE_STATUSES = [
  "requested",
  "in_progress",
  "completed",
  "cancelled",
];

const FRONT_DESK = ["admin", "manager", "receptionist"];

const isStaff = user => FRONT_DESK.includes(user.role);



export async function createAdditionalService(req, res) {
  try {
    const { reservationId, serviceName, description = "", quantity} = req.body;

    if(!reservationId || !serviceName || !quantity){
      return res.status(400).json({
        message: "Reservation Id , Service Name and Quantity are required",
      })
    }


    if (!mongoose.isValidObjectId(reservationId)) {
      return res.status(400).json({
        message: "Valid reservationId is required",
      });
    }

    if (!Object.hasOwn(SERVICE_PRICES, serviceName)) {
      return res.status(400).json({
        message: "Invalid service name",
        availableServices: Object.keys(SERVICE_PRICES),
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      return res.status(400).json({
        message: "Quantity must be between 1 and 50",
      });
    }



    const reservation = await Reservation.findById(reservationId)
      .populate("room", "roomNumber");

    if (!reservation || ["cancelled", "no_show"].includes(reservation.status)) {
      return res.status(404).json({
        message: "Active reservation not found",
      });
    }


    if (req.user.role === "guest" && String(reservation.guest) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only request services for your own reservation",
      });
    }

    if (req.user.role === "guest" && reservation.status !== "checked_in") {
      return res.status(400).json({
        message: "You must check in before requesting services",
      });
    }

    if (!isStaff(req.user) && req.user.role !== "guest") {
      return res.status(403).json({
        message: "Access denied",
      });
    }


    const guest = await Guest.findById(reservation.guest)
      .select("firstName lastName email");

    if (!guest) {
      return res.status(404).json({
        message: "Guest not found",
      });
    }


    let unitPrice = SERVICE_PRICES[serviceName];

    if (isStaff(req.user) && req.body.unitPrice !== undefined) {
      unitPrice = Number(req.body.unitPrice);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 10000000) {
      return res.status(400).json({
        message: "Invalid service price",
      });
    }


    const service = await AdditionalService.create({
      reservation: reservation._id,
      guest: guest._id,
      serviceName,
      description: String(description).trim().slice(0, 500),
      quantity: qty,
      unitPrice,
      totalPrice: Number((qty * unitPrice).toFixed(2)),
      requestedBy: isStaff(req.user) ? req.user.role : "guest",
    });


    for (const role of FRONT_DESK) {
      await createNotification({
        title: "Additional Service Requested",
        message: `${serviceName.replaceAll("_", " ")} requested for reservation ${reservation.confirmationCode}.`,
        type: "info",
        category: "billing",
        targetRole: role,
        createdBy: isStaff(req.user) ? req.user._id : null,
        relatedModel: "AdditionalService",
        relatedId: service._id,
        metadata: {
          serviceId: service._id,
          reservationId: reservation._id,
        },
      });
    }


    if (guest?.email) {
      await sendServiceEmail(guest, service, reservation, "created")
        .catch(error => console.error("Service email failed:", error.message));
    }

    await service.populate([
      { path: "guest", select: "firstName lastName email phone" },
      { path: "reservation", select: "confirmationCode status" },
    ]);

    return res.status(201).json({
      message: "Additional service requested successfully",
      service,
    });

  } catch (error) {
    console.error("Create additional service:", error);

    return res.status(500).json({
      message: "Could not create additional service",
    });
  }
}



export async function listAdditionalServices(req, res) {
  try {
    const { reservationId, status } = req.query;

    const filter = {};


    if (reservationId) {
      if (!mongoose.isValidObjectId(reservationId)) {
        return res.status(400).json({
          message: "Invalid reservationId",
        });
      }

      filter.reservation = reservationId;
    }


    if (status) {

      if (!SERVICE_STATUSES.includes(status)) {
        return res.status(400).json({
          message: "Invalid service status",
          validStatuses: SERVICE_STATUSES,
        });
      }

      filter.status = status;
    }


  if (req.user.role === "guest") {
  filter.guest = req.user._id;
} else if (isStaff(req.user)) {
  
} else if (req.user.role === "housekeeping") {
  
  filter.assignedTo = req.user._id;
} else {
  return res.status(403).json({
    message: "Access denied",
  });
}

    const services = await AdditionalService.find(filter)
      .populate(
        "reservation",
        "confirmationCode checkInDate checkOutDate status"
      )
      .populate("guest", "firstName lastName email phone")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: services.length,
      services,
    });

  } catch (error) {
    console.error("List additional services:", error);

    return res.status(500).json({
      message: "Could not fetch additional services",
    });
  }
}



export async function getAdditionalService(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid service ID",
      });
    }

    const filter = { _id: id };

    
    if (req.user.role === "guest") {
      filter.guest = req.user._id;
    }

    
    else if (req.user.role === "housekeeping") {
      filter.assignedTo = req.user._id;
    }

    
    else if (!isStaff(req.user)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const service = await AdditionalService.findOne(filter)
      .populate(
        "reservation",
        "confirmationCode checkInDate checkOutDate status"
      )
      .populate("guest", "firstName lastName email phone")
      .populate("assignedTo", "name email role");

    if (!service) {
      return res.status(404).json({
        message: "Additional service not found",
      });
    }

    return res.status(200).json({
      service,
    });
  } catch (error) {
    console.error("Get additional service:", error);

    return res.status(500).json({
      message: "Could not fetch additional service",
    });
  }
}







export async function  updateAdditionalService(req, res) {
    try {
        const { id } = req.params;
        const {
            description,
            quantity,
            unitPrice,
            assignedTo,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid service ID",
            });
        }

        const service = await AdditionalService.findById(id);

        if (!service) {
            return res.status(404).json({
                message: "Additional service not found",
            });
        }

        if (["completed", "cancelled"].includes(service.status)) {
            return res.status(400).json({
                message: "Completed or cancelled services cannot be updated",
            });
        }

        if (
            description === undefined &&
            quantity === undefined &&
            unitPrice === undefined &&
            assignedTo === undefined
        ) {
            return res.status(400).json({
                message: "Provide at least one field to update",
            });
        }

        let assignedUser = null;
        let assignmentChanged = false;

        if (assignedTo !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
                return res.status(400).json({
                    message: "Invalid housekeeping staff ID",
                });
            }

            assignedUser = await User.findOne({
                _id: assignedTo,
                role: "housekeeping",
            });

            if (!assignedUser) {
                return res.status(400).json({
                    message: "Housekeeping staff not found",
                });
            }

            assignmentChanged =
                !service.assignedTo ||
                service.assignedTo.toString() !== assignedUser._id.toString();

            service.assignedTo = assignedUser._id;
        }

        if (description !== undefined) {
            service.description = description;
        }

        if (quantity !== undefined) {
            if (
                !Number.isInteger(Number(quantity)) ||
                Number(quantity) < 1 ||
                Number(quantity) > 50
            ) {
                return res.status(400).json({
                    message: "Quantity must be between 1 and 50",
                });
            }

            service.quantity = Number(quantity);
        }

        if (unitPrice !== undefined) {
            if (
                !Number.isFinite(Number(unitPrice)) ||
                Number(unitPrice) < 0 ||
                Number(unitPrice) > 10000000
            ) {
                return res.status(400).json({
                    message: "Invalid unit price",
                });
            }

            service.unitPrice = Number(unitPrice);
        }

        service.totalPrice = service.quantity * service.unitPrice;

        await service.save();

        const reservation = await Reservation.findById(
            service.reservation
        ).populate("room");

        if (assignmentChanged) {
            for (const role of FRONT_DESK) {
                await createNotification({
                    category: "billing",
                    title: "Additional Service Assigned",
                    message: `Additional service ${service.serviceName.replaceAll("_", " ")} has been assigned to housekeeping.`,
                    targetRole: role,
                    createdBy: req.user._id,
                    relatedModel: "AdditionalService",
                    relatedId: service._id,
                    metadata: {
                        serviceId: service._id,
                        assignedTo: assignedUser._id,
                    },
                });
            }

            
            if (assignedUser.email) {
                await sendAssignmentEmail(
                    assignedUser,
                    service,
                    reservation
                );
            }
        }

        const updatedService = await AdditionalService.findById(service._id)
            .populate("guest")
            .populate("assignedTo")
            .populate({
                path: "reservation",
                populate: { path: "room" },
            });

        return res.status(200).json({
            message: assignmentChanged
                ? "Service updated and assigned successfully"
                : "Additional service updated successfully",
            service: updatedService,
        });
    } catch (error) {
        console.error("Update additional service error:", error);

        return res.status(500).json({
            message: "Failed to update additional service",
            error: error.message,
        });
    }
};



export async function updateAdditionalServiceStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid service ID",
      });
    }

    if (!SERVICE_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid service status",
        validStatuses: SERVICE_STATUSES,
      });
    }

    const service = await AdditionalService.findById(id)
      .populate("reservation", "confirmationCode")
      .populate("guest", "firstName lastName email");

    if (!service) {
      return res.status(404).json({
        message: "Additional service not found",
      });
    }


    if (
      !isStaff(req.user) &&
      (
        req.user.role === "guest" ||
        String(service.assignedTo) !== String(req.user._id)
      )
    ) {
      return res.status(403).json({
        message: "You can only update services assigned to you",
      });
    }

    if (["completed", "cancelled"].includes(service.status)) {
      return res.status(400).json({
        message: "Completed or cancelled services cannot be changed",
      });
    }

    service.status = status;
    await service.save();

    for (const role of FRONT_DESK) {
      await createNotification({
        title: "Additional Service Status Updated",
        message: `${service.serviceName.replaceAll("_", " ")} for reservation ${service.reservation.confirmationCode} is now ${status}.`,
        type: "info",
        category: "billing",
        targetRole: role,
        createdBy: req.user._id,
        relatedModel: "AdditionalService",
        relatedId: service._id,
        metadata: {
          serviceId: service._id,
          reservationId: service.reservation._id,
        },
      });
    }

    if (service.guest?.email) {
      await sendServiceEmail(service.guest, service, service.reservation, "updated").catch(error =>
        console.error("Service email failed:", error.message)
      );
    }

    await service.populate("assignedTo", "name email role");

    return res.status(200).json({
      message: "Service status updated successfully",
      service,
    });

  } catch (error) {
    console.error("Update additional service status:", error);

    return res.status(500).json({
      message: "Could not update service status",
    });
  }
}





export async function cancelAdditionalService(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid service ID",
            });
        }

        const service = await AdditionalService.findById(id)
            .populate("reservation", "confirmationCode");

        if (!service) {
            return res.status(404).json({
                message: "Additional service not found",
            });
        }

       
        if (
            req.user.role === "guest" &&
            String(service.guest) !== String(req.user._id)
        ) {
            return res.status(403).json({
                message: "You can only cancel your own service requests",
            });
        }

       
        if (
            req.user.role === "guest" &&
            service.status !== "requested"
        ) {
            return res.status(400).json({
                message: "You can only cancel a service that has not started",
            });
        }

       
        if (!isStaff(req.user) && req.user.role !== "guest") {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        if (["completed", "cancelled"].includes(service.status)) {
            return res.status(400).json({
                message: "This service cannot be cancelled",
            });
        }

        service.status = "cancelled";
        await service.save();

      
        for (const role of FRONT_DESK) {
            await createNotification({
                title: "Additional Service Cancelled",
                message: `${service.serviceName.replaceAll("_", " ")} for reservation ${service.reservation.confirmationCode} has been cancelled.`,
                type: "info",
                category: "billing",
                targetRole: role,
                createdBy: req.user._id,
                relatedModel: "AdditionalService",
                relatedId: service._id,
                metadata: {
                    serviceId: service._id,
                    reservationId: service.reservation._id,
                },
            });
        }

          if (service.guest?.email) {
      await sendServiceEmail(service.guest, service, service.reservation, "cancelled").catch(error =>
        console.error("Service email failed:", error.message)
      );
    }

        return res.status(200).json({
            message: "Additional service cancelled successfully",
            service,
        });

    } catch (error) {
        console.error("Cancel additional service:", error);

        return res.status(500).json({
            message: "Could not cancel service",
        });
    }
}


export { SERVICE_PRICES };
