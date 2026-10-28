
import crypto from "crypto";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Guest from "../models/Guest.js";
import PasswordReset from "../models/PasswordReset.js";
import sendPasswordResetEmail from "../utils/sendPasswordResetEmail.js";

const CODE_EXPIRY_MINUTES = 10;

const hashCode = (code) => {
    return crypto
        .createHash("sha256")
        .update(code)
        .digest("hex");
};


const findAccountByEmail = async (email) => {
    const user = await User.findOne({
        email,
        isActive: true
    });

    if (user) {
        return {
            account: user,
            accountType: "User"
        };
    }

    const guest = await Guest.findOne({
        email,
        isActive: true
    });

    if (guest) {
        return {
            account: guest,
            accountType: "Guest"
        };
    }

    return null;
};


export const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const result = await findAccountByEmail(email);

       
        if (!result) {
            return res.status(200).json({
                message: "If the account exists, a reset code will be sent"
            });
        }

        const { account, accountType } = result;

        const code = crypto
            .randomInt(100000, 1000000)
            .toString();

        await PasswordReset.findOneAndUpdate(
            {
                user: account._id,
                accountType
            },
            {
                codeHash: hashCode(code),
                expiresAt: new Date(
                    Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000
                )
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        await sendPasswordResetEmail({
            user: account,
            code,
            expiresInMinutes: CODE_EXPIRY_MINUTES
        });

        return res.status(200).json({
            message: "If the account exists, a reset code will be sent"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { code, newPassword } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!email || !code || !newPassword) {
            return res.status(400).json({
                message: "Email, code and new password are required"
            });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const result = await findAccountByEmail(email);

        if (!result) {
            return res.status(400).json({
                message: "Invalid or expired reset code"
            });
        }

        const { account, accountType } = result;

        const reset = await PasswordReset.findOne({
            user: account._id,
            accountType
        });

        if (!reset || reset.expiresAt <= new Date()) {
            return res.status(400).json({
                message: "Invalid or expired reset code"
            });
        }

        if (
            hashCode(String(code).trim()) !== reset.codeHash
        ) {
            return res.status(400).json({
                message: "Invalid or expired reset code"
            });
        }

        account.password = await bcrypt.hash(newPassword, 10);
        account.isLoggedIn = false;

        await account.save();
        await reset.deleteOne();

        return res.status(200).json({
            message: "Password reset successful. Please login again"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};
