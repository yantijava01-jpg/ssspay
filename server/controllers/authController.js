const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { sendSuccess, sendError } = require("../utils/response");
const { USER_STATUS, ROLE } = require("../config/constants");

// ─── REGISTER ───────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { phone, password, referralCode } = req.body;

    // 1. Check duplicate phone
    const existing = await User.findOne({ phone });
    if (existing) {
      return sendError(res, "An account with this phone number already exists.", 409);
    }

    // 2. Resolve referral
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (!referrer) {
        return sendError(res, "Invalid referral code.", 400);
      }
      referredBy = referrer._id;
    }

    // 3. Create user (status = pending by default)
    const user = await User.create({
      phone,
      password,
      referredBy,
      ipAddress: req.clientIp || null,
      deviceInfo: req.deviceInfo || null,
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          phone: user.phone,
          status: user.status,
          referralCode: user.referralCode,
        },
      },
      "Registration successful. Your account is pending admin approval.",
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      return sendError(res, "Phone number already registered.", 409);
    }
    return sendError(res, "Registration failed. Please try again.", 500);
  }
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 1. Find user with password field
    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      return sendError(res, "Invalid phone number or password.", 401);
    }

    // 2. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid phone number or password.", 401);
    }

    // 3. Status checks
    if (user.status === USER_STATUS.PENDING) {
      return sendError(res, "Your account is pending admin approval.", 403);
    }
    if (user.status === USER_STATUS.DISABLED) {
      return sendError(res, "Your account has been disabled. Contact support.", 403);
    }

    // 4. Update IP and device on each login
    user.ipAddress = req.clientIp || user.ipAddress;
    user.deviceInfo = req.deviceInfo || user.deviceInfo;
    await user.save({ validateBeforeSave: false });

    // 5. Generate token
    const token = generateToken({ id: user._id, role: user.role });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          phone: user.phone,
          role: user.role,
          status: user.status,
          balance: user.balance,
          reward: user.reward,
          referralCode: user.referralCode,
          isFrozen: user.isFrozen,
        },
      },
      "Login successful."
    );
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, "Login failed. Please try again.", 500);
  }
};

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("referredBy", "phone referralCode");

    if (!user) return sendError(res, "User not found.", 404);

    return sendSuccess(res, { user }, "Profile fetched.");
  } catch (error) {
    console.error("GetProfile error:", error);
    return sendError(res, "Failed to fetch profile.", 500);
  }
};

// ─── GET DASHBOARD STATS (balance, reward, team) ─────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "phone balance reward isFrozen totalDeposits totalWithdrawals referralCode"
    );

    // Count referrals (team members)
    const teamCount = await User.countDocuments({ referredBy: req.user._id });

    return sendSuccess(
      res,
      {
        balance: user.balance,
        reward: user.reward,
        isFrozen: user.isFrozen,
        totalDeposits: user.totalDeposits,
        totalWithdrawals: user.totalWithdrawals,
        referralCode: user.referralCode,
        teamCount,
        cashbackRate: 2.5,
        referralRate: 0.3,
      },
      "Dashboard data fetched."
    );
  } catch (error) {
    console.error("GetDashboard error:", error);
    return sendError(res, "Failed to fetch dashboard.", 500);
  }
};

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, "Current password is incorrect.", 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, {}, "Password changed successfully.");
  } catch (error) {
    console.error("ChangePassword error:", error);
    return sendError(res, "Failed to change password.", 500);
  }
};

module.exports = { register, login, getProfile, getDashboard, changePassword };
