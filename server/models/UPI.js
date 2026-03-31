const mongoose = require("mongoose");
const { UPI_STATUS } = require("../config/constants");

const upiSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true, // One UPI per user
      index: true,
    },
    upiId: {
      type: String,
      required: [true, "UPI ID is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/,
        "Please enter a valid UPI ID (e.g. name@upi)",
      ],
    },
    status: {
      type: String,
      enum: Object.values(UPI_STATUS),
      default: UPI_STATUS.ENABLED,
      index: true,
    },
    // Admin can add a note explaining status change
    adminNote: {
      type: String,
      default: null,
      trim: true,
    },
    // Which admin last updated this
    updatedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UPI", upiSchema);
