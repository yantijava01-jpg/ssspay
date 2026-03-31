const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // Singleton key — only one settings document ever exists
    _id: {
      type: String,
      default: "global",
    },
    usdtRate: {
      type: Number,
      required: true,
      default: 83.5, // INR per 1 USDT
      min: [1, "Rate must be positive"],
    },
    // 2–3 WhatsApp numbers for order redirects
    whatsappNumbers: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length >= 1 && arr.length <= 5;
        },
        message: "Provide between 1 and 5 WhatsApp numbers",
      },
    },
    // Minimum order amount (can be changed by admin)
    minOrderAmount: {
      type: Number,
      default: 100,
    },
    // Max orders per day per user
    maxOrdersPerDay: {
      type: Number,
      default: 50,
    },
    // Cashback rate (stored as decimal, e.g. 0.025 = 2.5%)
    cashbackRate: {
      type: Number,
      default: 0.025,
    },
    // Referral bonus rate
    referralRate: {
      type: Number,
      default: 0.003,
    },
    // Telegram support link
    telegramLink: {
      type: String,
      default: "",
      trim: true,
    },
    // WhatsApp support number (for service page)
    supportWhatsapp: {
      type: String,
      default: "",
      trim: true,
    },
    // App name displayed on frontend
    appName: {
      type: String,
      default: "SSSPay",
    },
    // Maintenance mode
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    // Disable auto _id since we're using a fixed string key
    _id: false,
  }
);

// ----- STATIC: Get or create singleton settings -----
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findById("global");
  if (!settings) {
    settings = await this.create({ _id: "global" });
  }
  return settings;
};

// ----- STATIC: Update settings -----
settingsSchema.statics.updateSettings = async function (updates) {
  const settings = await this.findByIdAndUpdate(
    "global",
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
