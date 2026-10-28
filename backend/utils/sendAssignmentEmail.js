
import "dotenv/config";
import nodemailer from "nodemailer";

const { EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

const sendAssignmentEmail = async (staff, service, reservation) => {
    if (!staff?.email) {
        throw new Error("Housekeeping staff email is required");
    }

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
            <h2>New Additional Service Assigned</h2>

            <p>Dear ${staff.firstName || staff.name || "Housekeeping Staff"},</p>

            <p>A new additional service has been assigned to you.</p>

            <p><strong>Service:</strong> ${service.serviceName.replaceAll("_", " ")}</p>
            <p><strong>Quantity:</strong> ${service.quantity}</p>
            <p><strong>Status:</strong> ${service.status}</p>
            <p><strong>Reservation:</strong> ${reservation?.confirmationCode || "N/A"}</p>

            <p>Please check your dashboard to process this request.</p>

            <p>Regards,<br>LuxuryStay Hospitality Team</p>
        </div>
    `;

    const info = await transporter.sendMail({
        from: {
            name: "LuxuryStay Hospitality",
            address: EMAIL_USER,
        },
        to: staff.email,
        subject: "New Additional Service Assigned",
        html,
    });

    console.log("Assignment email sent:", info.messageId);

    return info;
};

export default sendAssignmentEmail;
