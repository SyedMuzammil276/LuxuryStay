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

const sendPaymentEmail = async (guest, bill) => {
    if (!guest?.email || !bill) {
        throw new Error("Guest email and bill are required");
    }

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
            <h2>Payment Confirmation</h2>

            <p>Dear ${escapeHtml(guest.firstName || "Guest")},</p>

            <p>Your payment record has been updated successfully.</p>

            <p><strong>Invoice:</strong> ${escapeHtml(bill.invoiceNumber)}</p>
            <p><strong>Total Bill:</strong> PKR ${Number(bill.totalAmount || 0).toFixed(2)}</p>
            <p><strong>Amount Paid:</strong> PKR ${Number(bill.amountPaid || 0).toFixed(2)}</p>
            <p><strong>Remaining Balance:</strong> PKR ${Math.max(0, Number(bill.totalAmount || 0) - Number(bill.amountPaid || 0)).toFixed(2)}</p>
            <p><strong>Payment Status:</strong> ${escapeHtml(bill.paymentStatus || "Pending")}</p>

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
            subject: `Payment Confirmation - ${bill.invoiceNumber}`,
            html,
        });

        console.log("Payment email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Payment email failed:", error.message);
        throw error;
    }
};

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char]);
}

export default sendPaymentEmail;