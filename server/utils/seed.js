/**
 * Seed Script — Run once to bootstrap the database
 * Usage: node utils/seed.js
 *
 * Creates:
 *  - Admin user account
 *  - Default Settings document
 *  - Sample notices
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Settings = require("../models/Settings");
const Notice = require("../models/Notice");
const connectDB = require("../config/db");

const seed = async () => {
  await connectDB();
  console.log("🌱 Starting seed...\n");

  // ── 1. Admin user ──────────────────────────────────────────
  const adminPhone    = process.env.ADMIN_PHONE    || "9999999999";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";

  const existingAdmin = await User.findOne({ phone: adminPhone });
  if (existingAdmin) {
    console.log(`⚠️  Admin already exists (phone: ${adminPhone}). Skipping.`);
  } else {
    const admin = await User.create({
      phone: adminPhone,
      password: adminPassword,
      role: "admin",
      status: "active",
    });
    console.log(`✅ Admin created — Phone: ${adminPhone} | ID: ${admin._id}`);
    console.log(`   Password: ${adminPassword}  ← CHANGE THIS IN PRODUCTION\n`);
  }

  // ── 2. Default Settings ────────────────────────────────────
  const existingSettings = await Settings.findById("global");
  if (existingSettings) {
    console.log("⚠️  Settings already exist. Skipping.");
  } else {
    await Settings.create({
      _id: "global",
      usdtRate: 83.5,
      whatsappNumbers: ["919999999999"],   // replace with real numbers
      minOrderAmount: 100,
      maxOrdersPerDay: 50,
      cashbackRate: 0.025,
      referralRate: 0.003,
      telegramLink: "https://t.me/ssspay_support",
      supportWhatsapp: "919999999999",
      appName: "SSSPay",
      maintenanceMode: false,
    });
    console.log("✅ Default settings created.\n");
  }

  // ── 3. Sample notices ──────────────────────────────────────
  const noticeCount = await Notice.countDocuments();
  if (noticeCount > 0) {
    console.log("⚠️  Notices already exist. Skipping.");
  } else {
    await Notice.insertMany([
      {
        title: "🎉 Welcome to SSSPay!",
        message:
          "Thank you for joining SSSPay. Deposit now and earn 2.5% instant cashback on every transaction. Refer friends and earn 0.3% on their deposits!",
        isPopup: true,
        priority: 10,
        isActive: true,
      },
      {
        title: "📢 How to Deposit",
        message:
          "1. Go to Payment page\n2. Enter amount (min ₹100)\n3. Submit and send payment via WhatsApp\n4. Your balance will be updated after admin approval.",
        isPopup: false,
        priority: 5,
        isActive: true,
      },
      {
        title: "⚡ Instant Rewards",
        message:
          "Every successful deposit gives you 2.5% cashback instantly credited to your reward balance.",
        isPopup: false,
        priority: 3,
        isActive: true,
      },
    ]);
    console.log("✅ Sample notices created.\n");
  }

  console.log("✅ Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Next steps:");
  console.log("  1. Copy .env.example → .env and fill in your MONGO_URI");
  console.log("  2. Update whatsappNumbers in Settings via admin panel");
  console.log(`  3. Login at /api/auth/login with phone: ${adminPhone}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
