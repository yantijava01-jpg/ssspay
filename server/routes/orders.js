const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getMyTransactions,
  getMyTeam,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { orderLimiter } = require("../middleware/rateLimiter");
const { validate, createOrderRules } = require("../middleware/validate");

// All routes require authentication
router.use(protect);

router.post("/",             orderLimiter, createOrderRules, validate, createOrder);
router.get("/",              getMyOrders);
router.get("/transactions",  getMyTransactions);
router.get("/team",          getMyTeam);
router.get("/:id",           getOrderById);

module.exports = router;
