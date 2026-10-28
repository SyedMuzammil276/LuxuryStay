
import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "accountType"
    },

    accountType: {
        type: String,
        required: true,
        enum: ["User", "Guest"]
    },

    codeHash: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true,
        expires: 0
    }
}, {
    timestamps: true
});

passwordResetSchema.index(
    { user: 1, accountType: 1 },
    { unique: true }
);

export default mongoose.model("PasswordReset", passwordResetSchema);
