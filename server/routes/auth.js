const express = require("express");
const router = express.Router();

const { register, login, getProfile, getDashboard, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  validate,
  registerRules,
  loginRules,
} = require("../middleware/validate");

// Public
router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login",    authLimiter, loginRules,    validate, login);

// Protected
router.get("/profile",   protect, getProfile);
router.get("/dashboard", protect, getDashboard);
router.put("/change-password", protect, changePassword);

module.exports = router;
