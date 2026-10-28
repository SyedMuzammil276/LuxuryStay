import Feedback from "../models/Feedback.js";


export const submitFeedback = async (req, res) => {
  try {
    const { rating, category, comment } = req.body;

    if (
      rating === undefined ||
      !category ||
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating, category and comment are required",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const feedback = await Feedback.create({
      guestId: req.user._id,
      author: `${req.user.firstName} ${req.user.lastName}`.trim(),
      rating: numericRating,
      category,
      review: comment.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: {
        id: feedback._id,
        guestId: feedback.guestId,
        rating: feedback.rating,
        category: feedback.category,
        date: feedback.createdAt,
        comment: feedback.review,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Submit feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting feedback",
    });
  }
};


export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "name email")
      .populate("guestId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    const formattedFeedback = feedbacks.map((feedback) => ({
      id: feedback._id,
      userId: feedback.userId?._id ?? null,
      guestId: feedback.guestId?._id ?? null,
      author: feedback.guestId
        ? `${feedback.guestId.firstName} ${feedback.guestId.lastName}`.trim()
        : feedback.userId?.name ?? feedback.author ?? "Guest",
      email: feedback.guestId?.email ?? feedback.userId?.email ?? null,
      rating: feedback.rating,
      category: feedback.category,
      date: feedback.createdAt,
      comment: feedback.review ?? feedback.comment,
    }));

    return res.status(200).json({
      success: true,
      count: formattedFeedback.length,
      feedbacks: formattedFeedback,
    });
  } catch (error) {
    console.error("Get feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching feedback",
    });
  }
};