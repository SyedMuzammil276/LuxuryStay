
import mongoose from "mongoose";
import Bill from "../models/Bill.js";
import Reservation from "../models/Reservation.js";
import AdditionalService from "../models/AdditionalService.js";
import Guest from "../models/Guest.js";
import createNotification from "../utils/createNotification.js";
import sendInvoiceEmail from "../utils/sendInvoiceEmail.js";
import sendPaymentEmail from "../utils/sendPaymentEmail.js";

const FRONT_DESK = ["admin", "manager", "receptionist"];

const isStaff = (user) => FRONT_DESK.includes(user.role);

const money = (amount) => Number(Number(amount).toFixed(2));


async function notifyBilling(title, message, bill, createdBy) {
  for (const role of FRONT_DESK) {
    await createNotification({
      title,
      message,
      type: "success",
      category: "billing",
      targetRole: role,
      createdBy,
      relatedModel: "Bill",
      relatedId: bill._id,
      metadata: {
        billId: bill._id,
        reservationId: bill.reservation,
        invoiceNumber: bill.invoiceNumber,
      },
    });
  }
}

export async function listBills(req, res) {
  try {
    if (req.user.role !== "guest" && !isStaff(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { paymentStatus, reservationId } = req.query;
    const filter = {};

    if (req.user.role === "guest") {
      filter.guest = req.user._id;
    }

    if (paymentStatus) {
      if (!["unpaid", "partial", "paid"].includes(paymentStatus)) {
        return res.status(400).json({ message: "Invalid paymentStatus" });
      }

      filter.paymentStatus = paymentStatus;
    }

    if (reservationId) {
      if (!mongoose.isValidObjectId(reservationId)) {
        return res.status(400).json({ message: "Invalid reservationId" });
      }

      filter.reservation = reservationId;
    }

    const bills = await Bill.find(filter)
      .populate("guest", "firstName lastName email phone")
      .populate("room", "roomNumber roomType pricePerNight")
      .populate("reservation", "confirmationCode checkInDate checkOutDate status")
      .populate("generatedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bills.length,
      bills,
    });
  } catch (error) {
    console.error("List bills:", error);
    return res.status(500).json({ message: "Could not fetch bills" });
  }
}

//
export async function getBill(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid bill ID" });
    }

    if (req.user.role !== "guest" && !isStaff(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bill = await Bill.findById(id)
      .populate("guest", "firstName lastName email phone")
      .populate("room", "roomNumber roomType pricePerNight")
      .populate("reservation", "confirmationCode checkInDate checkOutDate status")
      .populate("generatedBy", "name email");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (
      req.user.role === "guest" &&
      String(bill.guest?._id ?? bill.guest) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "You can get Only Your Bill" });
    }

    return res.status(200).json({ bill });
  } catch (error) {
    console.error("Get bill:", error);
    return res.status(500).json({ message: "Could not fetch bill" });
  }
}


export async function generateBill(req, res) {
  try {
    const { reservationId } = req.body;

    if (!mongoose.isValidObjectId(reservationId)) {
      return res.status(400).json({
        message: "A valid reservationId is required",
      });
    }

    const reservation = await Reservation.findById(reservationId)
      .populate("guest", "firstName lastName email phone")
      .populate("room", "roomNumber roomType pricePerNight");

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status !== "checked_out") {
      return res.status(400).json({
        message: "A bill can only be generated after check-out",
      });
    }

    if (!reservation.guest || !reservation.room) {
      return res.status(400).json({
        message: "Guest or room information is missing",
      });
    }

  
    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(reservation.checkOutDate) -
          new Date(reservation.checkInDate)) /
          86400000
      )
    );

    const roomCharges = money(
      nights * Number(reservation.room.pricePerNight)
    );


    const serviceRecords = await AdditionalService.find({
      reservation: reservation._id,
      status: "completed",
    }).sort({ createdAt: 1 });

    const services = serviceRecords.map((service) => ({
      serviceName: service.serviceName,
      description: service.description || "",
      quantity: service.quantity,
      unitPrice: service.unitPrice,
      totalPrice: money(service.quantity * service.unitPrice),
    }));

    const additionalCharges = money(
      services.reduce((total, service) => total + service.totalPrice, 0)
    );

  
    const taxRate =
      req.body.taxRate === undefined
        ? Math.max(
            0,
            Math.min(100, Number(process.env.BILLING_TAX_RATE || 0))
          )
        : Number(req.body.taxRate);

    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return res.status(400).json({
        message: "taxRate must be between 0 and 100",
      });
    }

    const taxAmount = money(
      ((roomCharges + additionalCharges) * taxRate) / 100
    );

    const totalAmount = money(
      roomCharges + additionalCharges + taxAmount
    );

    // Check existing bill
    let bill = await Bill.findOne({ reservation: reservation._id });
    const isNew = !bill;

    if (bill?.paymentStatus === "paid" && bill.totalAmount !== totalAmount) {
      return res.status(409).json({
        message: "This bill is already paid and cannot be recalculated",
      });
    }

    const amountPaid = bill?.amountPaid || 0;

    
    bill = await Bill.findOneAndUpdate(
      { reservation: reservation._id },
      {
        $set: {
          invoiceNumber:
            bill?.invoiceNumber ||
            `LS-${Date.now().toString().slice(-8)}-${String(
              reservation.confirmationCode
            ).slice(-4)}`,
          reservation: reservation._id,
          guest: reservation.guest._id,
          room: reservation.room._id,
          nights,
          roomCharges,
          services,
          additionalCharges,
          taxRate,
          taxAmount,
          totalAmount,
          amountPaid,
          paymentStatus:
            amountPaid >= totalAmount
              ? "paid"
              : amountPaid > 0
                ? "partial"
                : "unpaid",
          generatedBy: req.user._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    
    await notifyBilling(
      isNew ? "Invoice generated" : "Invoice updated",
      `Invoice ${bill.invoiceNumber} total is PKR ${bill.totalAmount}.`,
      bill,
      req.user._id
    );

   
    if (reservation.guest.email) {
      await sendInvoiceEmail({
        type: "invoice",
        guest: reservation.guest,
        bill,
        reservation,
      }).catch((error) =>
        console.error("Invoice email failed:", error.message)
      );
    }

    await bill.populate([
      { path: "guest", select: "firstName lastName email phone" },
      { path: "room", select: "roomNumber roomType pricePerNight" },
      {
        path: "reservation",
        select: "confirmationCode checkInDate checkOutDate status",
      },
    ]);

    return res.status(isNew ? 201 : 200).json({
      message: isNew
        ? "Invoice generated successfully"
        : "Invoice recalculated successfully",
      bill,
    });
  } catch (error) {
    console.error("Generate bill:", error);
    return res.status(500).json({ message: "Could not generate invoice" });
  }
}



export async function recordPayment(req, res) {
  try {
    const { id } = req.params;
    const payment = Number(req.body.amount);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid bill ID",
      });
    }

    if (!Number.isFinite(payment) || payment <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero",
      });
    }

    const bill = await Bill.findById(id);

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    if (bill.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Invoice is already paid",
      });
    }

    const remaining = money(bill.totalAmount - bill.amountPaid);

    if (payment > remaining) {
      return res.status(400).json({
        message: `Payment cannot exceed outstanding balance of PKR ${remaining}`,
      });
    }

    bill.amountPaid = money(bill.amountPaid + payment);

    bill.paymentStatus =
      bill.amountPaid >= bill.totalAmount ? "paid" : "partial";

    await bill.save();

    const outstandingBalance = money(
      bill.totalAmount - bill.amountPaid
    );

    await notifyBilling(
      "Payment recorded",
      `PKR ${payment.toFixed(2)} payment recorded for invoice ${bill.invoiceNumber}. Balance: PKR ${outstandingBalance}.`,
      bill,
      req.user._id
    );

    const guest = await Guest.findById(bill.guest).select(
      "firstName lastName email"
    );

    if (guest?.email) {
      try {
        await sendPaymentEmail(guest, bill);
      } catch (error) {
        console.error("Payment email failed:", error.message);
      }
    } else {
      console.log("Payment email skipped: Guest email not found");
    }

    return res.status(200).json({
      message: "Payment recorded successfully",
      bill,
      outstandingBalance,
    });
  } catch (error) {
    console.error("Record payment:", error);
    return res.status(500).json({
      message: "Could not record payment",
    });
  }
}
