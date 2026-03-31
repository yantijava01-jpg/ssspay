const mongoose = require("mongoose");
const { TRANSACTION_TYPE } = require("../config/constants");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
      required: [true, "Transaction type is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Reference to the order that triggered this transaction (if any)
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    // Balance snapshot after this transaction
    balanceAfter: {
      type: Number,
      default: null,
    },
    // Created by admin (for manual adjustments)
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ----- INDEXES -----
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

// ----- STATIC: Get user summary -----
transactionSchema.statics.getUserSummary = async function (userId) {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = {
    deposit: 0,
    reward: 0,
    referral: 0,
    withdraw: 0,
  };

  result.forEach((item) => {
    summary[item._id] = item.total;
  });

  return summary;
};

module.exports = mongoose.model("Transaction", transactionSchema);
