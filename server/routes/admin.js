const express = require("express");
const router = express.Router();

const {
  getAnalytics,
  getAllUsers,
  getUserById,
  updateUserStatus,
  toggleFreezeUser,
  resetUserPassword,
  adjustBalance,
  getAllOrders,
  approveOrder,
  rejectOrder,
  getAllUPIs,
  updateUPIStatus,
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getAdminSettings,
  updateSettings,
  exportUsers,
  exportOrders,
} = require("../controllers/adminController");

const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");
const { adminLimiter } = require("../middleware/rateLimiter");
const {
  validate,
  updateUserStatusRules,
  adjustBalanceRules,
  approveOrderRules,
  createNoticeRules,
  updateSettingsRules,
  resetPasswordRules,
} = require("../middleware/validate");

// All admin routes: must be logged in AND must be admin
router.use(protect, adminOnly, adminLimiter);

// ── Analytics ─────────────────────────────────────────────
router.get("/analytics", getAnalytics);

// ── Users ─────────────────────────────────────────────────
router.get("/users",                    getAllUsers);
router.get("/users/:id",                getUserById);
router.put("/users/:id/status",         updateUserStatusRules, validate, updateUserStatus);
router.put("/users/:id/freeze",         toggleFreezeUser);
router.put("/users/:id/reset-password", resetPasswordRules,   validate, resetUserPassword);
router.put("/users/:id/balance",        adjustBalanceRules,   validate, adjustBalance);

// ── Orders ────────────────────────────────────────────────
router.get("/orders",           getAllOrders);
router.put("/orders/:id/approve", approveOrderRules, validate, approveOrder);
router.put("/orders/:id/reject",  rejectOrder);

// ── UPI ───────────────────────────────────────────────────
router.get("/upis",            getAllUPIs);
router.put("/upis/:id/status", updateUPIStatus);

// ── Notices ───────────────────────────────────────────────
router.get("/notices",        getAllNotices);
router.post("/notices",       createNoticeRules, validate, createNotice);
router.put("/notices/:id",    updateNotice);
router.delete("/notices/:id", deleteNotice);

// ── Settings ──────────────────────────────────────────────
router.get("/settings",  getAdminSettings);
router.put("/settings",  updateSettingsRules, validate, updateSettings);

// ── CSV Export ────────────────────────────────────────────
router.get("/export/users",  exportUsers);
router.get("/export/orders", exportOrders);

module.exports = router;
