const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Notice message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    // If true → shown as modal popup on home page
    // If false → shown in notice list only
    isPopup: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Priority: higher number = shown first
    priority: {
      type: Number,
      default: 0,
    },
    // Optional expiry date (null = never expires)
    expiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ----- INDEX -----
noticeSchema.index({ isActive: 1, createdAt: -1 });

// ----- STATIC: Get active notices -----
noticeSchema.statics.getActive = async function () {
  const now = new Date();
  return await this.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  }).sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model("Notice", noticeSchema);
