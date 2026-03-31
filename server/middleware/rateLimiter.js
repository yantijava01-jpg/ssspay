const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

/**
 * Strict limiter for auth endpoints (login/register)
 * 10 attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Order creation limiter
 * 20 order requests per hour per IP
 */
const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 hour
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many order requests. Please try again later.",
  },
});

/**
 * Admin panel limiter — more lenient
 * 300 requests per 15 minutes
 */
const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many admin requests. Please slow down.",
  },
});

module.exports = { apiLimiter, authLimiter, orderLimiter, adminLimiter };
