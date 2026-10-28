import nodemailer from "nodemailer";

const sendStatusEmail = async ({ name, email, isActive }) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
         from: `"LuxuryStay Hospitality" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: isActive ? "Your account is activated" : "Your account is deactivated",
        html: `
            <h3>Hello ${name},</h3>
            <p> Your Account is ${isActive ? "<b>activate</b> now you can login." : "<b>deactivate</b> now you can't login"} <br> <p>if the change looks unexpected to you. Please Contact Admin</p></p>
        `
    });
};

export default sendStatusEmail;