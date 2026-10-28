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

const sendVerificationEmail = async ({ guest, verifyUrl }) => {
    if (!guest?.email || !guest?.firstName || !verifyUrl) {
        throw new Error("Guest name, email and verifyUrl are required");
    }

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #333;">
            <h2>Verify your email</h2>

            <p>Dear ${escapeHtml(guest.firstName)},</p>

            <p>
                Thank you for choosing LuxuryStay Hospitality.
                Please confirm your email address by clicking the button below.
            </p>

            <p style="margin: 28px 0;">
                <a href="${escapeHtml(verifyUrl)}"
                   style="background:#b8860b;color:#fff;padding:12px 24px;
                          text-decoration:none;border-radius:6px;display:inline-block;">
                    Verify Email
                </a>
            </p>

            <p style="font-size: 13px; color: #666;">
                This link expires in 24 hours. If the button does
                not work, copy this link into your browser:<br />
                ${escapeHtml(verifyUrl)}
            </p>

            <p style="font-size: 13px; color: #666;">
                If you did not expect this email, you can ignore it.
            </p>

            <p>
                Regards,<br />
                <strong>LuxuryStay Hospitality Team</strong>
            </p>
        </div>
    `;

    const info = await transporter.sendMail({
        from: {
            name: "LuxuryStay Hospitality",
            address: EMAIL_USER,
        },
        to: guest.email,
        subject: "Verify your email - LuxuryStay Hospitality",
        html,
    });

    console.log("Verification email sent:", info.messageId);

    return info;
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

export default sendVerificationEmail;
