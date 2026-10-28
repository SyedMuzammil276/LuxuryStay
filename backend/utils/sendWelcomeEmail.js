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

const sendWelcomeEmail = async (user) => {
    if (!user?.email || !user?.name) {
        throw new Error("User name and email are required");
    }

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #333;">
            <h2>Welcome to LuxuryStay Hospitality!</h2>

            <p>Dear ${escapeHtml(user.name)},</p>

            <p>
                Your staff account has been successfully created
                in the LuxuryStay Hotel Management System.
            </p>

            <h3>Account Details</h3>

            <p><strong>Name:</strong> ${escapeHtml(user.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>

            <p>
                For your login credentials, please contact
                your administrator.
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
            to: user.email,
            subject: "Welcome to LuxuryStay Hospitality",
            html,
        });

        console.log("Welcome email sent:", info.messageId);

        return info;
    } catch (error) {
        console.error("Welcome email failed:", error.message);
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

export default sendWelcomeEmail;