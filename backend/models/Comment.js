const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  contentType: {
    type: String,
    required: true,
    enum: ["Package", "Destination", "Festival", "Itinerary", "Service", "AboutMongolia"],
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.index({ contentType: 1, contentId: 1, imageUrl: 1 });

module.exports = mongoose.model("Comment", commentSchema);
