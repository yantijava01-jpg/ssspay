/**
 * Capture IP address and device info from incoming requests
 * Attaches req.clientIp and req.deviceInfo
 *
 * Usage: apply globally in server.js before routes
 */
const captureClientInfo = (req, res, next) => {
  // IP: handle proxies (Nginx, Heroku, etc.)
  req.clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown";

  // Device: extract from User-Agent
  req.deviceInfo = req.headers["user-agent"] || "unknown";

  next();
};

module.exports = { captureClientInfo };
