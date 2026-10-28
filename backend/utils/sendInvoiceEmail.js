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


const sendInvoiceEmail = async ({ type = "invoice", guest, bill, reservation }) => {
    if (!guest?.email || !bill) {
        throw new Error("Guest email and bill are required");
    }

   


    const rows = (bill.services || []).map(service => `
        <tr>
            <td>${escapeHtml(service.serviceName.replaceAll("_", " "))}</td>
            <td>${Number(service.quantity || 0)}</td>
            <td>PKR ${Number(service.totalPrice || 0).toFixed(2)}</td>
        </tr>
    `).join("");

    
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
            <h2>LuxuryStay Invoice</h2>

            <p>Dear ${escapeHtml(guest.firstName || "Guest")},</p>

            <p><strong>Invoice:</strong> ${escapeHtml(bill.invoiceNumber)}</p>
            <p><strong>Reservation:</strong> ${escapeHtml(reservation?.confirmationCode || "N/A")}</p>
            <p><strong>Room Charges:</strong> PKR ${Number(bill.roomCharges || 0).toFixed(2)}</p>

            <h3>Additional Services</h3>

            <table border="1" cellpadding="8" cellspacing="0">
                <tr>
                    <th>Service</th>
                    <th>Quantity</th>
                    <th>Total</th>
                </tr>
                ${rows || "<tr><td colspan='3'>No additional services</td></tr>"}
            </table>

            <p><strong>Additional Charges:</strong> PKR ${Number(bill.additionalCharges || 0).toFixed(2)}</p>
            <p><strong>Tax:</strong> PKR ${Number(bill.taxAmount || 0).toFixed(2)}</p>

            <h3>Total: PKR ${Number(bill.totalAmount || 0).toFixed(2)}</h3>

            <p><strong>Paid:</strong> PKR ${Number(bill.amountPaid || 0).toFixed(2)}</p>
            <p><strong>Balance:</strong> PKR ${Math.max(0, Number(bill.totalAmount || 0) - Number(bill.amountPaid || 0)).toFixed(2)}</p>
            <p><strong>Status:</strong> ${escapeHtml(bill.paymentStatus || "Pending")}</p>

            <p>Thank you for choosing LuxuryStay Hospitality!</p>
        </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: {
                name: "LuxuryStay Hospitality",
                address: EMAIL_USER,
            },
            to: guest.email,
            subject: `LuxuryStay Invoice ${bill.invoiceNumber}`,
            html,
        });

        console.log("Invoice email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Invoice email failed:", error.message);
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

export default sendInvoiceEmail;