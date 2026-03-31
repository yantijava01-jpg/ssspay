const mongoose = require("mongoose");
const { ORDER_STATUS } = require("../config/constants");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [100, "Minimum order amount is ₹100"],
    },
    // Amount can be edited by admin before approval
    approvedAmount: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    // Which WhatsApp number was used for this order
    whatsappNumber: {
      type: String,
      default: null,
    },
    // Admin who processed this order
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    // Admin notes / rejection reason
    adminNote: {
      type: String,
      default: null,
      trim: true,
    },
    // Reward given for this order (2.5%)
    rewardGiven: {
      type: Number,
      default: 0,
    },
    // Referral bonus given for this order (0.3%)
    referralGiven: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ----- INDEXES for fast queries -----
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 }, { unique: true });

// ----- VIRTUAL: Final amount (approved or original) -----
orderSchema.virtual("finalAmount").get(function () {
  return this.approvedAmount !== null ? this.approvedAmount : this.amount;
});

// ----- STATIC: Count today's orders for a user -----
orderSchema.statics.countTodayOrders = async function (userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return await this.countDocuments({
    userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });
};

module.exports = mongoose.model("Order", orderSchema);
