
import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendPasswordResetEmail = async ({
    user,
    code,
    expiresInMinutes
}) => {
    await transporter.sendMail({
        from: `"LuxuryStay Hospitality" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Code - LuxuryStay",

        text: `Hello ${user.firstName || user.name || "Guest"},

Your password reset code is: ${code}

This code expires in ${expiresInMinutes} minutes.

If you did not request this code, ignore this email.

LuxuryStay Team`
    });
};

export default sendPasswordResetEmail;
