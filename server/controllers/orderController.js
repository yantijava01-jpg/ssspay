const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Settings = require("../models/Settings");
const { sendSuccess, sendError } = require("../utils/response");
const {
  generateOrderId,
  generateWhatsAppURL,
  buildOrderMessage,
  pickRandomWhatsApp,
} = require("../utils/order");
const { ORDER_STATUS, MIN_ORDER_AMOUNT, MAX_ORDERS_PER_DAY } = require("../config/constants");

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const parsedAmount = parseFloat(amount);

    // 1. Check frozen
    if (req.user.isFrozen) {
      return sendError(res, "Your account is frozen. Contact support.", 403);
    }

    // 2. Get settings for dynamic limits
    const settings = await Settings.getSettings();
    const minAmount = settings.minOrderAmount || MIN_ORDER_AMOUNT;
    const maxPerDay = settings.maxOrdersPerDay || MAX_ORDERS_PER_DAY;

    // 3. Minimum amount check
    if (parsedAmount < minAmount) {
      return sendError(res, `Minimum order amount is ₹${minAmount}.`, 400);
    }

    // 4. Daily order limit check
    const todayCount = await Order.countTodayOrders(req.user._id);
    if (todayCount >= maxPerDay) {
      return sendError(
        res,
        `You have reached the maximum ${maxPerDay} orders for today.`,
        429
      );
    }

    // 5. Pick a WhatsApp number
    const whatsappNumber = pickRandomWhatsApp(settings.whatsappNumbers);
    if (!whatsappNumber) {
      return sendError(res, "Payment system is currently unavailable. Please try later.", 503);
    }

    // 6. Generate unique order ID
    const orderId = generateOrderId();

    // 7. Create order — start as pending, immediately move to processing
    const order = await Order.create({
      userId: req.user._id,
      orderId,
      amount: parsedAmount,
      status: ORDER_STATUS.PROCESSING, // skip pending, go straight to processing
      whatsappNumber,
    });

    // 8. Build WhatsApp message + URL
    const message = buildOrderMessage({
      phone: req.user.phone,
      userId: req.user._id,
      amount: parsedAmount,
      orderId,
    });
    const whatsappUrl = generateWhatsAppURL(whatsappNumber, message);

    return sendSuccess(
      res,
      {
        order: {
          _id: order._id,
          orderId: order.orderId,
          amount: order.amount,
          status: order.status,
          createdAt: order.createdAt,
        },
        whatsappUrl,
        whatsappNumber,
        message,
        ordersRemainingToday: maxPerDay - todayCount - 1,
      },
      "Order created. Please complete payment via WhatsApp.",
      201
    );
  } catch (error) {
    console.error("CreateOrder error:", error);
    return sendError(res, "Failed to create order. Please try again.", 500);
  }
};

// ─── GET MY ORDERS ────────────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ userId: req.user._id }),
    ]);

    return sendSuccess(
      res,
      {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Orders fetched."
    );
  } catch (error) {
    console.error("GetMyOrders error:", error);
    return sendError(res, "Failed to fetch orders.", 500);
  }
};

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id, // ensure ownership
    }).lean();

    if (!order) return sendError(res, "Order not found.", 404);

    return sendSuccess(res, { order }, "Order fetched.");
  } catch (error) {
    console.error("GetOrderById error:", error);
    return sendError(res, "Failed to fetch order.", 500);
  }
};

// ─── GET MY TRANSACTIONS ───────────────────────────────────────────────────────
const getMyTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type } = req.query;

    const filter = { userId: req.user._id };
    if (type) filter.type = type;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    // Summary totals
    const summary = await Transaction.getUserSummary(req.user._id);

    return sendSuccess(
      res,
      {
        transactions,
        summary,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Transactions fetched."
    );
  } catch (error) {
    console.error("GetMyTransactions error:", error);
    return sendError(res, "Failed to fetch transactions.", 500);
  }
};

// ─── GET TEAM (REFERRALS) ─────────────────────────────────────────────────────
const getMyTeam = async (req, res) => {
  try {
    const User = require("../models/User");

    const members = await User.find({ referredBy: req.user._id })
      .select("phone status createdAt totalDeposits")
      .sort({ createdAt: -1 })
      .lean();

    // Total referral earnings
    const referralEarnings = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "referral",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalEarnings = referralEarnings[0]?.total || 0;

    return sendSuccess(
      res,
      {
        members,
        totalMembers: members.length,
        totalEarnings,
        referralCode: req.user.referralCode,
        commissionRate: 0.3,
      },
      "Team data fetched."
    );
  } catch (error) {
    console.error("GetMyTeam error:", error);
    return sendError(res, "Failed to fetch team data.", 500);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getMyTransactions,
  getMyTeam,
};
