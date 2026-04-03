const User = require("../models/User");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const UPI = require("../models/UPI");
const Notice = require("../models/Notice");
const Settings = require("../models/Settings");
const { sendSuccess, sendError } = require("../utils/response");
const { ORDER_STATUS, USER_STATUS, TRANSACTION_TYPE } = require("../config/constants");
const { getIO } = require("../sockets/socketManager");

// ════════════════════════════════════════════════════════════
//  ANALYTICS
// ════════════════════════════════════════════════════════════

const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers, activeUsers, pendingUsers,
      totalOrders, successOrders, pendingOrders, processingOrders,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", status: "active" }),
      User.countDocuments({ role: "user", status: "pending" }),
      Order.countDocuments(),
      Order.countDocuments({ status: ORDER_STATUS.SUCCESS }),
      Order.countDocuments({ status: ORDER_STATUS.PENDING }),
      Order.countDocuments({ status: ORDER_STATUS.PROCESSING }),
    ]);

    const depositAgg = await Order.aggregate([
      { $match: { status: ORDER_STATUS.SUCCESS } },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $ne: ["$approvedAmount", null] },
                "$approvedAmount",
                "$amount",
              ],
            },
          },
        },
      },
    ]);

    const rewardAgg = await Transaction.aggregate([
      { $match: { type: TRANSACTION_TYPE.REWARD } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const withdrawAgg = await Transaction.aggregate([
      { $match: { type: TRANSACTION_TYPE.WITHDRAW } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orderTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: ORDER_STATUS.SUCCESS,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          total: {
            $sum: {
              $cond: [
                { $ne: ["$approvedAmount", null] },
                "$approvedAmount",
                "$amount",
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, {
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
      },
      orders: {
        total: totalOrders,
        success: successOrders,
        pending: pendingOrders,
        processing: processingOrders,
      },
      financials: {
        totalDeposits: depositAgg[0]?.total || 0,
        totalRewards: rewardAgg[0]?.total || 0,
        totalWithdrawals: withdrawAgg[0]?.total || 0,
      },
      orderTrend,
    }, "Analytics fetched.");
  } catch (error) {
    console.error("GetAnalytics error:", error);
    return sendError(res, "Failed to fetch analytics.", 500);
  }
};

// ════════════════════════════════════════════════════════════
//  TRANSACTIONS (Admin — all users)
// ════════════════════════════════════════════════════════════

const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const { type, userId, search } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (userId) filter.userId = userId;

    if (search) {
      const matched = await User.find({
        phone: { $regex: search, $options: "i" },
      }).select("_id");
      filter.userId = { $in: matched.map((u) => u._id) };
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("userId", "phone")
        .populate("orderId", "orderId amount")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const summary = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const summaryMap = { deposit: 0, reward: 0, referral: 0, withdraw: 0 };
    summary.forEach((s) => { summaryMap[s._id] = s.total; });

    return sendSuccess(res, {
      transactions,
      summary: summaryMap,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, "Transactions fetched.");
  } catch (error) {
    console.error("GetAllTransactions error:", error);
    return sendError(res, "Failed to fetch transactions.", 500);
  }
};

// ════════════════════════════════════════════════════════════
//  USER MANAGEMENT
// ════════════════════════════════════════════════════════════

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const filter = { role: "user" };
    if (status) filter.status = status;
    if (search) filter.phone = { $regex: search, $options: "i" };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, "Users fetched.");
  } catch (error) {
    console.error("GetAllUsers error:", error);
    return sendError(res, "Failed to fetch users.", 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("referredBy", "phone");

    if (!user) return sendError(res, "User not found.", 404);

    const [upis, recentOrders, txSummary] = await Promise.all([
      UPI.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
      Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean(),
      Transaction.getUserSummary(user._id),
    ]);

    return sendSuccess(res, {
      user, upis, recentOrders, txSummary,
    }, "User details fetched.");
  } catch (error) {
    console.error("GetUserById error:", error);
    return sendError(res, "Failed to fetch user.", 500);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return sendError(res, "User not found.", 404);

    try {
      getIO().to(`user_${user._id}`).emit("notification", {
        type: "account_status",
        message: `Your account status has been updated to: ${status}`,
      });
    } catch (_) { }

    return sendSuccess(res, { user }, `User status updated to ${status}.`);
  } catch (error) {
    console.error("UpdateUserStatus error:", error);
    return sendError(res, "Failed to update user status.", 500);
  }
};

const toggleFreezeUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return sendError(res, "User not found.", 404);

    user.isFrozen = !user.isFrozen;
    await user.save({ validateBeforeSave: false });

    try {
      getIO().to(`user_${user._id}`).emit("notification", {
        type: "account_frozen",
        message: user.isFrozen
          ? "Your account has been frozen. Contact support."
          : "Your account has been unfrozen.",
      });
    } catch (_) { }

    return sendSuccess(
      res,
      { isFrozen: user.isFrozen },
      `User account ${user.isFrozen ? "frozen" : "unfrozen"} successfully.`
    );
  } catch (error) {
    console.error("ToggleFreezeUser error:", error);
    return sendError(res, "Failed to toggle freeze status.", 500);
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, "User not found.", 404);

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, {}, "User password reset successfully.");
  } catch (error) {
    console.error("ResetUserPassword error:", error);
    return sendError(res, "Failed to reset password.", 500);
  }
};

// ✅ UPDATED — balance can go below zero, no minimum check
const adjustBalance = async (req, res) => {
  try {
    const { amount, type, description } = req.body;
    const parsedAmount = parseFloat(amount);

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, "User not found.", 404);

    if (type === "deduct") {
      // ✅ No insufficient balance check — admin can deduct past zero
      user.balance -= parsedAmount;
      user.totalWithdrawals += parsedAmount;
    } else {
      user.balance += parsedAmount;
      user.totalDeposits += parsedAmount;
    }

    await user.save({ validateBeforeSave: false });

    const tx = await Transaction.create({
      userId: user._id,
      type: type === "deduct"
        ? TRANSACTION_TYPE.WITHDRAW
        : TRANSACTION_TYPE.DEPOSIT,
      amount: parsedAmount,
      description: description || `Manual ${type} by admin`,
      balanceAfter: user.balance,
      createdByAdmin: true,
    });

    try {
      getIO().to(`user_${user._id}`).emit("balanceUpdated", {
        balance: user.balance,
        reward: user.reward,
      });
    } catch (_) { }

    return sendSuccess(
      res,
      { balance: user.balance, transaction: tx },
      `Balance ${type === "deduct" ? "deducted" : "added"} successfully.`
    );
  } catch (error) {
    console.error("AdjustBalance error:", error);
    return sendError(res, "Failed to adjust balance.", 500);
  }
};

// ════════════════════════════════════════════════════════════
//  ORDER MANAGEMENT
// ════════════════════════════════════════════════════════════

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      const matchedUsers = await User.find({
        phone: { $regex: search, $options: "i" },
      }).select("_id");
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { userId: { $in: matchedUsers.map((u) => u._id) } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("userId", "phone balance")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, "Orders fetched.");
  } catch (error) {
    console.error("GetAllOrders error:", error);
    return sendError(res, "Failed to fetch orders.", 500);
  }
};

const approveOrder = async (req, res) => {
  try {
    const { approvedAmount } = req.body;

    const order = await Order.findById(req.params.id).populate("userId");
    if (!order) return sendError(res, "Order not found.", 404);

    if (order.status === ORDER_STATUS.SUCCESS) {
      return sendError(res, "Order is already approved.", 400);
    }
    if (order.status === ORDER_STATUS.FAILED) {
      return sendError(res, "Cannot approve a failed order.", 400);
    }

    const settings = await Settings.getSettings();
    const finalAmount = approvedAmount ? parseFloat(approvedAmount) : order.amount;
    const cashbackRate = settings.cashbackRate || 0.025;
    const referralRate = settings.referralRate || 0.003;
    const rewardAmount = parseFloat((finalAmount * cashbackRate).toFixed(2));

    const user = await User.findById(order.userId._id || order.userId);
    if (!user) return sendError(res, "Order user not found.", 404);

    // ✅ Both balance AND reward credited atomically
    user.balance += finalAmount;
    user.reward += rewardAmount;
    user.totalDeposits += finalAmount;

    order.status = ORDER_STATUS.SUCCESS;
    order.approvedAmount = finalAmount;
    order.processedBy = req.user._id;
    order.processedAt = new Date();
    order.rewardGiven = rewardAmount;

    const txDocs = [
      {
        userId: user._id,
        type: TRANSACTION_TYPE.DEPOSIT,
        amount: finalAmount,
        description: `Deposit approved — Order #${order.orderId}`,
        orderId: order._id,
        balanceAfter: user.balance,
      },
      {
        userId: user._id,
        type: TRANSACTION_TYPE.REWARD,
        amount: rewardAmount,
        description: `${(cashbackRate * 100).toFixed(1)}% cashback — Order #${order.orderId}`,
        orderId: order._id,
        balanceAfter: user.balance,
      },
    ];

    let referralBonus = 0;
    let referrer = null;

    if (user.referredBy) {
      referrer = await User.findById(user.referredBy);
      if (referrer && referrer.status === USER_STATUS.ACTIVE) {
        referralBonus = parseFloat((finalAmount * referralRate).toFixed(2));
        referrer.balance += referralBonus;
        referrer.reward += referralBonus;
        order.referralGiven = referralBonus;

        txDocs.push({
          userId: referrer._id,
          type: TRANSACTION_TYPE.REFERRAL,
          amount: referralBonus,
          description: `Referral bonus — ${user.phone} deposited #${order.orderId}`,
          orderId: order._id,
          balanceAfter: referrer.balance,
        });
      }
    }

    const saveOps = [
      order.save(),
      user.save({ validateBeforeSave: false }),
      Transaction.insertMany(txDocs),
    ];
    if (referrer) saveOps.push(referrer.save({ validateBeforeSave: false }));

    await Promise.all(saveOps);

    try {
      const io = getIO();

      io.to(`user_${user._id}`).emit("balanceUpdated", {
        balance: user.balance,
        reward: user.reward,
      });
      io.to(`user_${user._id}`).emit("orderUpdated", {
        orderId: order.orderId,
        status: ORDER_STATUS.SUCCESS,
        amount: finalAmount,
        reward: rewardAmount,
      });
      io.to(`user_${user._id}`).emit("notification", {
        type: "order_approved",
        message: `Order #${order.orderId} approved! ₹${finalAmount} + ₹${rewardAmount} cashback added.`,
      });

      if (referrer) {
        io.to(`user_${referrer._id}`).emit("balanceUpdated", {
          balance: referrer.balance,
          reward: referrer.reward,
        });
        io.to(`user_${referrer._id}`).emit("notification", {
          type: "referral_bonus",
          message: `You earned ₹${referralBonus} referral bonus!`,
        });
      }
    } catch (_) { }

    return sendSuccess(res, {
      order: { ...order.toObject(), status: ORDER_STATUS.SUCCESS },
      credited: { deposit: finalAmount, reward: rewardAmount, referral: referralBonus },
    }, "Order approved — balance and reward credited simultaneously.");
  } catch (error) {
    console.error("ApproveOrder error:", error);
    return sendError(res, "Failed to approve order.", 500);
  }
};

const rejectOrder = async (req, res) => {
  try {
    const { adminNote } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, "Order not found.", 404);

    if (order.status === ORDER_STATUS.SUCCESS) {
      return sendError(res, "Cannot reject an already approved order.", 400);
    }
    if (order.status === ORDER_STATUS.FAILED) {
      return sendError(res, "Order is already rejected.", 400);
    }

    order.status = ORDER_STATUS.FAILED;
    order.adminNote = adminNote || "Rejected by admin";
    order.processedBy = req.user._id;
    order.processedAt = new Date();
    await order.save();

    try {
      getIO().to(`user_${order.userId}`).emit("orderUpdated", {
        orderId: order.orderId,
        status: ORDER_STATUS.FAILED,
        message: adminNote || "Your order was rejected.",
      });
      getIO().to(`user_${order.userId}`).emit("notification", {
        type: "order_rejected",
        message: `Order #${order.orderId} rejected. ${adminNote || ""}`,
      });
    } catch (_) { }

    return sendSuccess(res, { order }, "Order rejected.");
  } catch (error) {
    console.error("RejectOrder error:", error);
    return sendError(res, "Failed to reject order.", 500);
  }
};

// ════════════════════════════════════════════════════════════
//  UPI MANAGEMENT
// ════════════════════════════════════════════════════════════

const getAllUPIs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const upis = await UPI.find(filter)
      .populate("userId", "phone status")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, { upis }, "UPIs fetched.");
  } catch (error) {
    console.error("GetAllUPIs error:", error);
    return sendError(res, "Failed to fetch UPIs.", 500);
  }
};

const updateUPIStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const upi = await UPI.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, updatedByAdmin: req.user._id },
      { new: true, runValidators: true }
    ).populate("userId", "phone");

    if (!upi) return sendError(res, "UPI not found.", 404);

    try {
      getIO().to(`user_${upi.userId._id}`).emit("notification", {
        type: "upi_status",
        message: `Your UPI ID (${upi.upiId}) status updated to: ${status}`,
      });
    } catch (_) { }

    return sendSuccess(res, { upi }, "UPI status updated.");
  } catch (error) {
    console.error("UpdateUPIStatus error:", error);
    return sendError(res, "Failed to update UPI status.", 500);
  }
};

// ════════════════════════════════════════════════════════════
//  NOTICE MANAGEMENT
// ════════════════════════════════════════════════════════════

const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).lean();
    return sendSuccess(res, { notices }, "Notices fetched.");
  } catch (error) {
    return sendError(res, "Failed to fetch notices.", 500);
  }
};

const createNotice = async (req, res) => {
  try {
    const { title, message, isPopup, priority, expiresAt } = req.body;

    const notice = await Notice.create({
      title,
      message,
      isPopup: isPopup || false,
      priority: priority || 0,
      expiresAt: expiresAt || null,
      createdBy: req.user._id,
    });

    try {
      getIO().emit("notification", {
        type: "new_notice",
        title: notice.title,
        message: notice.message,
        isPopup: notice.isPopup,
      });
    } catch (_) { }

    return sendSuccess(res, { notice }, "Notice created.", 201);
  } catch (error) {
    console.error("CreateNotice error:", error);
    return sendError(res, "Failed to create notice.", 500);
  }
};

const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!notice) return sendError(res, "Notice not found.", 404);
    return sendSuccess(res, { notice }, "Notice updated.");
  } catch (error) {
    return sendError(res, "Failed to update notice.", 500);
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return sendError(res, "Notice not found.", 404);
    return sendSuccess(res, {}, "Notice deleted.");
  } catch (error) {
    return sendError(res, "Failed to delete notice.", 500);
  }
};

// ════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════

const getAdminSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    return sendSuccess(res, { settings }, "Settings fetched.");
  } catch (error) {
    return sendError(res, "Failed to fetch settings.", 500);
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.updateSettings(req.body);
    return sendSuccess(res, { settings }, "Settings updated.");
  } catch (error) {
    console.error("UpdateSettings error:", error);
    return sendError(res, "Failed to update settings.", 500);
  }
};

// ════════════════════════════════════════════════════════════
//  CSV EXPORT
// ════════════════════════════════════════════════════════════

const exportUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .lean();

    const headers = [
      "ID", "Phone", "Status", "Balance", "Reward",
      "Frozen", "Total Deposits", "Total Withdrawals",
      "Referral Code", "Created At",
    ];

    const rows = users.map((u) => [
      u._id,
      u.phone,
      u.status,
      u.balance,
      u.reward,
      u.isFrozen,
      u.totalDeposits,
      u.totalWithdrawals,
      u.referralCode,
      new Date(u.createdAt).toISOString(),
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=ssspay_users.csv");
    return res.send(csv);
  } catch (error) {
    console.error("ExportUsers error:", error);
    return sendError(res, "Failed to export users.", 500);
  }
};

const exportOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "phone")
      .lean();

    const headers = [
      "Order ID", "User Phone", "Amount", "Approved Amount",
      "Status", "WhatsApp Number", "Created At",
    ];

    const rows = orders.map((o) => [
      o.orderId,
      o.userId?.phone || "N/A",
      o.amount,
      o.approvedAmount ?? o.amount,
      o.status,
      o.whatsappNumber || "",
      new Date(o.createdAt).toISOString(),
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=ssspay_orders.csv");
    return res.send(csv);
  } catch (error) {
    console.error("ExportOrders error:", error);
    return sendError(res, "Failed to export orders.", 500);
  }
};

// ════════════════════════════════════════════════════════════
//  EXPORTS
// ════════════════════════════════════════════════════════════

module.exports = {
  getAnalytics,
  getAllTransactions,
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
};