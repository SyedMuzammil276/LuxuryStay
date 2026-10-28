import bcrypt from "bcryptjs";
import User from "../models/User.js";

import sendWelcomeEmail from "../utils/sendWelcomeEmail.js";
import sendRoleChangeEmail from "../utils/sendRoleChangeEmail.js";
import sendStatusEmail from "../utils/sendStatusEmail.js";
import createNotification from "../utils/createNotification.js";

export const createStaff = async (req, res) => {

    try {
        const { name, email, password, role } = req.body;


        if (!name || !email || !password || !role) {

            return res.status(400).json({
                message: "All Fields are required"
            })
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        })

        if (existingUser) {

            return res.status(400).json({
                message: "User with this email already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const staff = await User.create({

            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,
            isActive: true,
            isLoggedIn: false


        });

        try {

           
await createNotification({
  title: "New Staff Added",
  message: `${staff.name} ko ${staff.role} ke role mein add kiya gaya`,
  type: "success",
  category: "system",
  targetRole: "admin",
  relatedModel: "User",
  relatedId: staff._id,
  metadata: {
    staffId: staff._id,
  },
  createdBy: req.user?._id ?? null,
});


        }

        catch (error) {

             console.log("Notification failed:", error.message);

        }

        try {
            await sendWelcomeEmail({
                name: staff.name,
                email: staff.email
            });

        }

        catch (error) {

             console.log("Email failed:", error.message);
        }

        return res.status(201).json({
            message: "Staff created successfully",
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                isActive: staff.isActive,
                isLoggedIn: staff.isLoggedIn
            }
        });
    }

    catch (error) {

        return res.status(500).json({
            error: error.message
        })

    }
}

export const getAllUser = async (req, res) => {

    try {

        const staff = await User.find({
            role: { $ne: "admin" }
        }).select("-password");

        return res.status(200).json({
            message: "User fetched successfully",
            count: staff.length,
            staff
        })

    }

    catch (error) {

        return res.status(500).json({
            message: "Server error",
            error: error.message
        })


    }
}


export const getUserbyId = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await User.findById(id);

        if (!staff || staff.role === "admin") {
            return res.status(404).json({
                message: "Staff not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            staff
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};






export const updateStaff = async (req, res) => {

    try {

        const { id } = req.params;
        const { name, email, role } = req.body

        const staff = await User.findById(id)

        if (!staff || staff.role == "admin") {

            return res.status(404).json({
                message: "Staff not found"
            })
        }

       const oldRole =  staff.role

        if (name !== undefined) {
            staff.name = name.trim()
        }

        if (email !== undefined) {

            const Email = email.toLowerCase().trim();

            const existingUser = await User.findOne({
                email: Email,
                _id: { $ne: id }
            })

            if (existingUser) {

                return res.status(400).json({

                    message: "Email already Exists"
                })
            }

            staff.email = Email


        }

        if (role !== undefined) {

            if (!["manager", "receptionist", "housekeeping", "maintenance"].includes(role)) {
                return res.status(400).json({
                    message: "Invalid staff role"
                });
            }

            staff.role = role


        }

        await staff.save()

     if (staff.role !== oldRole) {

            try {

               
await createNotification({
  title: "Staff Role Changed",
  message: `${staff.name} ka role ${oldRole} se ${staff.role} kar diya gaya`,
  type: "info",
  category: "system",
  targetRole: "admin",
  relatedModel: "User",
  relatedId: staff._id,
  metadata: {
    staffId: staff._id,
    oldRole,
    newRole: staff.role,
  },
  createdBy: req.user?._id ?? null,
});


                }

             catch (error) {

                console.log("Notification failed:", error.message);
            }

            try { 

                 await sendRoleChangeEmail({
            name: staff.name,
            email: staff.email,
            oldRole,
            newRole: staff.role
        });


            }

            catch(error){

                console.log("Email failed:", error.message);
            }
              
        }
        

    

        

        return res.status(200).json({
            message: "Staff updated successfully",
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                isActive: staff.isActive,
                isLoggedIn: staff.isLoggedIn
            }
        });

    }

    catch (error) {

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }
}

export const toggleStaffStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const staff = await User.findById(id)

        if (!staff || staff.role == "admin") {

            return res.status(404).json({
                message: "Staff not found"
            })

        }

        staff.isActive = !staff.isActive

        await staff.save()

          try {

          
await createNotification({
  title: staff.isActive ? "Staff Activated" : "Staff Deactivated",
  message: `${staff.name} ko ${staff.isActive ? "activate" : "deactivate"} kar diya gaya`,
  type: staff.isActive ? "success" : "warning",
  category: "system",
  targetRole: "admin",
  relatedModel: "User",
  relatedId: staff._id,
  metadata: {
    staffId: staff._id,
    isActive: staff.isActive,
  },
  createdBy: req.user?._id ?? null,
});


        } 
        
        catch (error) {
            
            console.log("Notification failed:", error.message);
        }

        try {
            
            await sendStatusEmail({
                name: staff.name,
                email: staff.email,
                isActive: staff.isActive
            });

        } 
        
        catch (error) {
            
            console.log("Email failed:", error.message);
        }

        return res.status(200).json({
            message: `Staff ${staff.isActive ? "activated" : "deactivated"} Successfully`,
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                isActive: staff.isActive
            }
        })


    }

    catch (error) {

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

}