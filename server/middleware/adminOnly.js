const { sendError } = require("../utils/response");
const { ROLE } = require("../config/constants");

/**
 * adminOnly middleware — must be used AFTER protect
 * Blocks any non-admin user from accessing admin routes
 *
 * Usage: router.get("/admin/route", protect, adminOnly, handler)
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return sendError(res, "Authentication required.", 401);
  }

  if (req.user.role !== ROLE.ADMIN) {
    return sendError(
      res,
      "Access denied. Admin privileges required.",
      403
    );
  }

  next();
};

module.exports = { adminOnly };
