import nodemailer from "nodemailer";

const sendRoleChangeEmail = async ({ name, email, oldRole, newRole }) => {

 
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from:  `"LuxuryStay Hospitality" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your role has been updated",
        html: `
            <h3>Hello ${name},</h3>
            <p> Your Role has been change from ${oldRole} to ${newRole}</p>
            <p>If the change look unexpected to u . Plaese Contact Your Admin</p>
        `
    });
};

export default sendRoleChangeEmail;