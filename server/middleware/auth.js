const User = require("../models/User");
const { verifyToken, extractToken } = require("../utils/jwt");
const { sendError } = require("../utils/response");
const { USER_STATUS } = require("../config/constants");

/**
 * Protect middleware — verifies JWT and attaches user to req
 * Usage: router.get("/route", protect, handler)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    const token = extractToken(req);
    if (!token) {
      return sendError(res, "Access denied. No token provided.", 401);
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return sendError(res, "Session expired. Please login again.", 401);
      }
      return sendError(res, "Invalid token. Please login again.", 401);
    }

    // 3. Find user — include status and frozen checks
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendError(res, "User no longer exists.", 401);
    }

    // 4. Check account status
    if (user.status === USER_STATUS.PENDING) {
      return sendError(res, "Your account is pending admin approval.", 403);
    }
    if (user.status === USER_STATUS.DISABLED) {
      return sendError(res, "Your account has been disabled. Contact support.", 403);
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return sendError(res, "Authentication failed.", 500);
  }
};

/**
 * Soft protect — attaches user if token present, but doesn't block
 * Useful for optional-auth endpoints
 */
const softProtect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("-password");
      if (user && user.status === USER_STATUS.ACTIVE) {
        req.user = user;
      }
    }
    next();
  } catch {
    // Silently continue even if token is invalid
    next();
  }
};

module.exports = { protect, softProtect };
