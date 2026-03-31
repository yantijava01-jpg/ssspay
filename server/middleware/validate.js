const { body, param, query, validationResult } = require("express-validator");
const { sendError } = require("../utils/response");

/**
 * Run after validation chains — sends 422 if any errors found
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return sendError(res, "Validation failed", 422, formatted);
  }
  next();
};

// ─── Auth Validators ────────────────────────────────────────────────────────

const registerRules = [
  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^\d{10,15}$/).withMessage("Enter a valid phone number (10–15 digits)"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("referralCode")
    .optional({ nullable: true })
    .trim()
    .isString().withMessage("Invalid referral code"),
];

const loginRules = [
  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^\d{10,15}$/).withMessage("Enter a valid phone number"),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

// ─── Order Validators ────────────────────────────────────────────────────────

const createOrderRules = [
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isNumeric().withMessage("Amount must be a number")
    .custom((val) => {
      if (parseFloat(val) < 100) throw new Error("Minimum order amount is ₹100");
      return true;
    }),
];

// ─── Admin Validators ────────────────────────────────────────────────────────

const updateUserStatusRules = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["pending", "active", "disabled"]).withMessage("Invalid status value"),
];

const adjustBalanceRules = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isNumeric().withMessage("Amount must be a number")
    .custom((val) => {
      if (parseFloat(val) === 0) throw new Error("Amount cannot be zero");
      return true;
    }),
  body("type")
    .notEmpty().withMessage("Type is required")
    .isIn(["add", "deduct"]).withMessage("Type must be 'add' or 'deduct'"),
  body("description")
    .optional()
    .trim()
    .isString(),
];

const approveOrderRules = [
  param("id").isMongoId().withMessage("Invalid order ID"),
  body("approvedAmount")
    .optional()
    .isNumeric().withMessage("Approved amount must be a number")
    .custom((val) => {
      if (parseFloat(val) < 1) throw new Error("Approved amount must be at least ₹1");
      return true;
    }),
];

const createNoticeRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("message")
    .trim()
    .notEmpty().withMessage("Message is required")
    .isLength({ max: 1000 }).withMessage("Message cannot exceed 1000 characters"),
  body("isPopup")
    .optional()
    .isBoolean().withMessage("isPopup must be true or false"),
];

const updateSettingsRules = [
  body("usdtRate")
    .optional()
    .isNumeric().withMessage("USDT rate must be a number")
    .custom((val) => {
      if (parseFloat(val) < 1) throw new Error("USDT rate must be positive");
      return true;
    }),
  body("whatsappNumbers")
    .optional()
    .isArray({ min: 1, max: 5 }).withMessage("Provide 1–5 WhatsApp numbers"),
  body("whatsappNumbers.*")
    .optional()
    .matches(/^\d{10,15}$/).withMessage("Each WhatsApp number must be 10–15 digits"),
];

const upiSubmitRules = [
  body("upiId")
    .trim()
    .notEmpty().withMessage("UPI ID is required")
    .matches(/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/).withMessage("Enter a valid UPI ID (e.g. name@upi)"),
];

const resetPasswordRules = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  createOrderRules,
  updateUserStatusRules,
  adjustBalanceRules,
  approveOrderRules,
  createNoticeRules,
  updateSettingsRules,
  upiSubmitRules,
  resetPasswordRules,
};
