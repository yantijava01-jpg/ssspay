const mongoose = require("mongoose");
const { UPI_STATUS } = require("../config/constants");

const upiSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
      // ✅ REMOVED unique:true — now allows multiple UPIs per user
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
    label: {
      type: String,
      trim: true,
      default: "",
      maxlength: [30, "Label cannot exceed 30 characters"],
    },
    status: {
      type: String,
      enum: Object.values(UPI_STATUS),
      default: UPI_STATUS.ENABLED,
      index: true,
    },
    adminNote: {
      type: String,
      default: null,
      trim: true,
    },
    updatedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Max 7 UPIs per user enforced at controller level
upiSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("UPI", upiSchema);