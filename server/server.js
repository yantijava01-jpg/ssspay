require("dotenv").config();
const express     = require("express");
const http        = require("http");
const { Server }  = require("socket.io");
const cors        = require("cors");
const morgan      = require("morgan");

const connectDB               = require("./config/db");
const { apiLimiter }          = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { captureClientInfo }   = require("./middleware/captureClientInfo");
const { initSocket }          = require("./sockets/socketManager");
const { registerSocketHandlers } = require("./sockets/socketHandlers");

// ── Route imports ────────────────────────────────────────────────────────────
const authRoutes     = require("./routes/auth");
const orderRoutes    = require("./routes/orders");
const upiRoutes      = require("./routes/upi");
const noticeRoutes   = require("./routes/notices");
const settingsRoutes = require("./routes/settings");
const adminRoutes    = require("./routes/admin");

// ── App + HTTP server ────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://ssspay.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocket(io);
registerSocketHandlers(io);

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "https://ssspay.vercel.app",
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(captureClientInfo);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Global rate limit ─────────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SSSPay API is running",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/upi",      upiRoutes);
app.use("/api/notices",  noticeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin",    adminRoutes);

// ── 404 + Error handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🚀 SSSPay Server running on port ${PORT}`);
    console.log(`🌍 Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`🔌 Socket.io   : enabled`);
    console.log(`🛡  CORS origin : ${process.env.CLIENT_URL || "https://ssspay.vercel.app"}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("📋 API Endpoints:");
    console.log("   POST  /api/auth/register");
    console.log("   POST  /api/auth/login");
    console.log("   GET   /api/auth/dashboard");
    console.log("   POST  /api/orders");
    console.log("   GET   /api/orders");
    console.log("   GET   /api/orders/transactions");
    console.log("   GET   /api/orders/team");
    console.log("   POST  /api/upi");
    console.log("   GET   /api/notices");
    console.log("   GET   /api/settings");
    console.log("   GET   /api/admin/analytics");
    console.log("   ...and more\n");
  });
};

startServer();

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});
