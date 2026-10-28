import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import connectDB from "./config/db.js";

dotenv.config();

const SeedAdmin = async () => {

    try {

        await connectDB();

        const existingAdmin = await User.findOne({
            role: "admin"
        });

        if (existingAdmin) {
            console.log("Admin Already Exit");
            process.exit()
        }

        const hashedPassword = await bcrypt.hash("Mehak@123", 10);

        const admin = await User.create({

            name: "Mehak Sohail ",
            email: "mehaksohail@aptechnorth.edu.pk",
            password: hashedPassword,
            role: "admin",
            isActive: true

        });

        console.log("admin created successfully");
        console.log(admin.name);
        console.log(admin.email)

        process.exit()


    }

    catch (error) {

        console.error("Error in Creating Admin:", error.message)
        process.exit(1);

    }
}

SeedAdmin();