import "dotenv/config";
import nodemailer from "nodemailer";

let transporter;


const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    return transporter;
};

const escapeHtml = (value = "") =>
    String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

const CONTENT = {
    confirmed: {
        subject: "Your reservation is confirmed",
        heading: "Reservation Confirmed",
        intro: "Thank you for choosing LuxuryStay Hospitality. Your reservation is confirmed."
    },
    updated: {
        subject: "Your reservation was updated",
        heading: "Reservation Updated",
        intro: "Your reservation has been updated. Please review the new details below."
    },
    cancelled: {
        subject: "Your reservation was cancelled",
        heading: "Reservation Cancelled",
        intro: "Your reservation has been cancelled. We hope to welcome you another time."
    }
};


const sendReservationEmail = async ({ type, guest, reservation, room }) => {
    const content = CONTENT[type];

    if (!content) {
        throw new Error(`Unknown reservation email type: ${type}`);
    }

    if (!guest?.email) {
        return;
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables");
    }

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #333;">
            <h2>${content.heading}</h2>

            <p>Dear ${escapeHtml(guest.firstName)},</p>

            <p>${content.intro}</p>

            <table style="border-collapse: collapse; margin: 16px 0;">
                <tr>
                    <td style="padding: 6px 16px 6px 0;"><strong>Confirmation code</strong></td>
                    <td>${escapeHtml(reservation.confirmationCode)}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 16px 6px 0;"><strong>Room</strong></td>
                    <td>${escapeHtml(room?.roomNumber)} (${escapeHtml(room?.roomType)})</td>
                </tr>
                <tr>
                    <td style="padding: 6px 16px 6px 0;"><strong>Check-in</strong></td>
                    <td>${formatDate(reservation.checkInDate)}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 16px 6px 0;"><strong>Check-out</strong></td>
                    <td>${formatDate(reservation.checkOutDate)}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 16px 6px 0;"><strong>Guests</strong></td>
                    <td>${escapeHtml(reservation.guestsCount)}</td>
                </tr>
            </table>

            <p>
                Regards,<br />
                <strong>LuxuryStay Hospitality Team</strong>
            </p>
        </div>
    `;

    await getTransporter().sendMail({
        from: {
            name: "LuxuryStay Hospitality",
            address: process.env.EMAIL_USER
        },
        to: guest.email,
        subject: `${content.subject} - ${reservation.confirmationCode}`,
        html
    });
};

export default sendReservationEmail;