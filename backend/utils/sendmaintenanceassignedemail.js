import "dotenv/config";
import nodemailer from "nodemailer";

const { EMAIL_USER, EMAIL_PASS } = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
        "Missing EMAIL_USER or EMAIL_PASS in environment variables"
    );
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

const sendMaintenanceAssignedEmail = async ({
    to,
    name,
    roomNumber,
    title,
    category,
    priority,
    description,
    assignedBy,
}) => {
    if (!to || !name) {
        throw new Error("Assignee name and email are required");
    }

    const urgentPrefix = priority === "urgent" ? "[URGENT] " : "";

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #333;">
            <h2>New Maintenance Request Assigned</h2>

            <p>Dear ${escapeHtml(name)},</p>

            <p>
                A maintenance request has been assigned to you${
                    assignedBy ? ` by ${escapeHtml(assignedBy)}` : ""
                }.
            </p>

            <h3>Request Details</h3>

            <p><strong>Room:</strong> ${escapeHtml(roomNumber)}</p>
            <p><strong>Title:</strong> ${escapeHtml(title)}</p>
            <p><strong>Category:</strong> ${escapeHtml(category)}</p>
            <p><strong>Priority:</strong> ${escapeHtml(priority)}</p>
            ${
                description
                    ? `<p><strong>Description:</strong> ${escapeHtml(description)}</p>`
                    : ""
            }

            <p>
                Please log in to the system and update the request status
                once you start working on it.
            </p>

            <p>
                Regards,<br />
                <strong>LuxuryStay Hospitality Team</strong>
            </p>
        </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: {
                name: "LuxuryStay Hospitality",
                address: EMAIL_USER,
            },
            to,
            subject: `${urgentPrefix}New Maintenance Request: ${title} - Room ${roomNumber}`,
            html,
        });

        console.log("Maintenance assigned email sent:", info.messageId);

        return info;
    } catch (error) {
        console.error("Maintenance assigned email failed:", error.message);
        throw error;
    }
};

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return entities[char];
    });
}

export default sendMaintenanceAssignedEmail;