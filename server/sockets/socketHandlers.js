const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * Register all Socket.io event handlers
 * @param {import("socket.io").Server} io
 */
const registerSocketHandlers = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        // Allow unauthenticated connections (for public events like fake activity)
        socket.userId = null;
        socket.userRole = null;
        return next();
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("_id role status");

      if (!user || user.status === "disabled") {
        return next(new Error("Unauthorized"));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (err) {
      // Invalid token — allow as unauthenticated
      socket.userId = null;
      socket.userRole = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    // Join personal room if authenticated
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);

      // Admins also join the admin room
      if (socket.userRole === "admin") {
        socket.join("admin_room");
      }

      console.log(`🔌 Socket connected: userId=${socket.userId} role=${socket.userRole}`);
    } else {
      console.log(`🔌 Socket connected: unauthenticated (${socket.id})`);
    }

    // ── Client requests to join their room explicitly ──
    socket.on("join", (userId) => {
      if (socket.userId && socket.userId === userId) {
        socket.join(`user_${userId}`);
      }
    });

    // ── Ping/pong for connection health ──
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} — ${reason}`);
    });
  });
};

module.exports = { registerSocketHandlers };
