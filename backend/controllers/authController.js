import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Guest from "../models/Guest.js";





export const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: "All Fields are Required!" 
            });
        }

        const Email = email.toLowerCase().trim();

        let account = await User.findOne({ email: Email });
        let role;

        if (account) {
            role = account.role;
        } else {
            account = await Guest.findOne({ email: Email });
            role = "guest";
        }

        if (!account) {
            return res.status(401).json({ 
                message: "Invalid Email or Password" 
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, account.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ 
                message: "Invalid Email or Password" 
            });
        }

    
        if (!account.isActive) {
            return res.status(403).json({ 
                message: "Your account is inactive" 
            });
        }

        if (role === "guest" && !account.emailVerified) {
            return res.status(403).json({ 
                message: "Verify your email first" 
            });
        }

        account.isLoggedIn = true;
        await account.save();

        const token = jwt.sign(
            { userId: account._id, role },
            process.env.JWT_SECRET,
            { expiresIn: "2d" }
        );

        const name = role === "guest"
            ? `${account.firstName} ${account.lastName}`
            : account.name;

        return res.status(200).json({
            message: "Login Successfull",
            token,
            user: {
                id: account._id,
                name,
                email: account.email,
                role,
                isLoggedIn: account.isLoggedIn
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};




export const LogoutUser = async (req, res) => {
    try {
       
        let user = await User.findById(req.user._id);

        if (user) {
            user.isLoggedIn = false;
            await user.save();

            return res.status(200).json({
                message: "User logout successfully"
            });
        }

        
        const guest = await Guest.findById(req.user._id);

        if (guest) {
            guest.isLoggedIn = false;
            await guest.save();

            return res.status(200).json({
                message: "Guest logout successfully"
            });
        }

       
        return res.status(404).json({
            message: "User or Guest not found"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


export const getCurrentUser = async (req, res) => {
    try {
        let user = null;
        let role = req.user.role;

        if (role === "guest") {
            const guest = await Guest.findById(req.user._id).select("-password");
            if (guest) {
                user = {
                    id: guest._id,
                    name: `${guest.firstName} ${guest.lastName}`,
                    email: guest.email,
                    role: "guest",
                    isActive: guest.isActive,
                    phone: guest.phone,
                    address: guest.address,
                    nationality: guest.nationality
                };
            }
        } else {
            const staff = await User.findById(req.user._id).select("-password");
            if (staff) {
                user = {
                    id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role,
                    isActive: staff.isActive
                };
            }
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Account is inactive"
            });
        }

        return res.status(200).json({
            message: "Current user fetched successfully",
            user
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
