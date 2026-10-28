import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    name : {
        type: String,
        required: true,
        trim: true
    },

    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    role: {
        type: String,
        required: true,
        enum: [
            "admin",
            "manager",
            "receptionist",
            "housekeeping",
            "maintenance",
            "guest"
        ]
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isLoggedIn: {
    type: Boolean,
    default: false
},
},

{

    timestamps: true

})

const User = mongoose.model("User", UserSchema);

export default User;