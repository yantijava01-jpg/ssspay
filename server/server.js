require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { captureClientInfo } = require("./middleware/captureClientInfo");
const { initSocket } = require("./sockets/socketManager");
const { registerSocketHandlers } = require("./sockets/socketHandlers");

// ── Route imports ────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const upiRoutes = require("./routes/upi");
const noticeRoutes = require("./routes/notices");
const settingsRoutes = require("./routes/settings");
const adminRoutes = require("./routes/admin");

// ── App + HTTP server ────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── Allowed origins (VERY IMPORTANT) ─────────────────────────
const allowedOrigins = [
"http://localhost:5173",
"https://ssspay.vercel.app",
];

// ── Socket.io ───────────────────────────────────────────────
const io = new Server(server, {
cors: {
origin: (origin, callback) => {
if (!origin || allowedOrigins.includes(origin)) {
callback(null, true);
} else {
callback(new Error("CORS blocked"));
}
},
methods: ["GET", "POST"],
credentials: true,
},
pingTimeout: 60000,
pingInterval: 25000,
});

initSocket(io);
registerSocketHandlers(io);

// ── CORS Middleware ─────────────────────────────────────────
app.use(cors({
origin: (origin, callback) => {
if (!origin || allowedOrigins.includes(origin)) {
callback(null, true);
} else {
callback(new Error("CORS blocked"));
}
},
credentials: true,
}));

// ── Core middleware ─────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(captureClientInfo);

if (process.env.NODE_ENV === "development") {
app.use(morgan("dev"));
}

// ── Rate limiter ────────────────────────────────────────────
app.use("/api", apiLimiter);

// ── Health check ────────────────────────────────────────────
app.get("/", (req, res) => {
res.send("🚀 SSSPay Backend is Live");
});

app.get("/health", (req, res) => {
res.json({
success: true,
message: "SSSPay API is running",
env: process.env.NODE_ENV,
timestamp: new Date().toISOString(),
});
});

// ── API routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upi", upiRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);

// ── Error handlers ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
await connectDB();
server.listen(PORT, () => {
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`🚀 SSSPay Server running on port ${PORT}`);
console.log(`🌍 Environment : ${process.env.NODE_ENV || "development"}`);
console.log(`🔌 Socket.io   : enabled`);
console.log(`🛡 Allowed Origins: ${allowedOrigins.join(", ")}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
});
};

startServer();

// ── Graceful shutdown ───────────────────────────────────────
process.on("SIGTERM", () => {
console.log("SIGTERM received. Shutting down...");
server.close(() => process.exit(0));
});

process.on("unhandledRejection", (err) => {
console.error("Unhandled Promise Rejection:", err);
server.close(() => process.exit(1));
});
