import mongoose from "mongoose";

const GuestSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    nationality: {
      type: String,
      trim: true
    },
    identificationType: {
      type: String,
      enum: [
        "passport",
        "national_id",
        "driving_license",
        "other"
      ]
    },
    identificationNumber: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isLoggedIn: {
      type:Boolean,
      default:false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerifiedAt: {
      type: Date
    },
  
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    emailVerificationSentAt: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Unique email index; multiple guests can omit their email.
GuestSchema.index(
  { email: 1 },
  { unique: true, sparse: true }
);

// Index for identification number searches.
GuestSchema.index(
  { identificationNumber: 1 },
  { sparse: true }
);

export default mongoose.model("Guest", GuestSchema);