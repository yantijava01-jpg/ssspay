const { sendError } = require("../utils/response");

/**
 * 404 handler — must be placed after all routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler — must be placed last in Express middleware chain
 * Signature must have 4 params for Express to recognize it as error handler
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose: duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`
      : "Duplicate entry.";
  }

  // Mongoose: validation error
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose: bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors (catch-all backup, normally handled in auth middleware)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please login again.";
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  return sendError(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
