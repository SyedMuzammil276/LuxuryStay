import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Guest from "../models/Guest.js";

const authMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                message: "Authentication Required"
            })
        }

        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)


        const Model = decoded.role === "guest" ? Guest : User;

        const user = await Model.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not Found"
            })
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Account is inactive"
            });
        }

        if (!user.isLoggedIn) {
            return res.status(401).json({
                message: "Please login again"
            });
        }

        if (decoded.role === "guest" && !user.emailVerified) {
            return res.status(403).json({
                message: "Verify your email first"
            });
        }

        req.user = {
    ...user.toObject(),
    role: decoded.role
};

        next()

    }

    catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        })

    }

}

export default authMiddleware;