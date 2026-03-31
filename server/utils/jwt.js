const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token for a user
 * @param {Object} payload - { id, role }
 * @returns {string} signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {Object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Extract token from Authorization header
 * Accepts: "Bearer <token>" format
 * @param {Object} req - Express request
 * @returns {string|null}
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

module.exports = { generateToken, verifyToken, extractToken };
