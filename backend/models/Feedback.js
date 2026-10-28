import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {

     userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5.',
      },
    },

    category: {
      type: String,
      required: true,
      enum: [
        'overall hospitality and staff',
        'room quality and comfort',
        'in-room dining and restaurant',
        'sanitation and housekeeping',
        'concierge and frontdesk',
      ],
    },

    review: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },

   
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      default: null,
    },

    author: {
      type: String,
      default: 'Guest',
      trim: true,
      maxlength: 100,
    },


 
  },
  {
    timestamps: true,
  }
);

 export default  mongoose.model('Feedback', feedbackSchema);