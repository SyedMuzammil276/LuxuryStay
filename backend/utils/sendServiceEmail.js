
import "dotenv/config";
import nodemailer from "nodemailer";

const { EMAIL_USER, EMAIL_PASS } = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char]);

const sendServiceEmail = async (guest, service, reservation, event = "updated") => {
    if (!guest?.email) {
        throw new Error("Guest email is required");
    }

    const emailContent = {
        created: {
            subject: "LuxuryStay Additional Service Requested",
            heading: "Additional Service Requested",
            message: "Your additional service request has been received successfully.",
        },
        updated: {
            subject: "LuxuryStay Additional Service Update",
            heading: "Additional Service Update",
            message: "Your additional service request has been updated.",
        },
        cancelled: {
            subject: "LuxuryStay Additional Service Cancelled",
            heading: "Additional Service Cancelled",
            message: "Your additional service request has been cancelled.",
        },
    };

    const content = emailContent[event] || emailContent.updated;

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
            <h2>${content.heading}</h2>

            <p>Dear ${escapeHtml(guest.firstName || "Guest")},</p>
            <p>${content.message}</p>

            <p><strong>Service:</strong> ${escapeHtml(
                service.serviceName.replaceAll("_", " ")
            )}</p>
            <p><strong>Status:</strong> ${escapeHtml(service.status)}</p>
            <p><strong>Quantity:</strong> ${service.quantity}</p>
            <p><strong>Total:</strong> PKR ${Number(service.totalPrice || 0).toFixed(2)}</p>
            <p><strong>Reservation:</strong> ${escapeHtml(
                reservation?.confirmationCode || "N/A"
            )}</p>

            <p>Regards,<br>LuxuryStay Hospitality Team</p>
        </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: {
                name: "LuxuryStay Hospitality",
                address: EMAIL_USER,
            },
            to: guest.email,
            subject: content.subject,
            html,
        });

        console.log("Service email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Service email failed:", error.message);
        throw error;
    }
};

export default sendServiceEmail;
