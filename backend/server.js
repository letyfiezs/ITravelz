require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// Import routes
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");
const servicesRoutes = require("./routes/services");
const contentRoutes = require("./routes/content");
const packagesRoutes = require("./routes/packages");
const itinerariesRoutes = require("./routes/itineraries");
const contactRoutes = require("./routes/contact");

const app = express();

app.set("trust proxy", 1);

// ========================================
// MIDDLEWARE
// ========================================

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);


// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ========================================
// ROUTES
// ========================================

// Public API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/packages", packagesRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/itineraries", itinerariesRoutes);
app.use("/api/contact", contactRoutes);

// Admin API Routes
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, status: "Server is running" });
});


// 404 handler
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// ========================================
// DATABASE CONNECTION
// ========================================
console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("[DB] MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("[DB] MongoDB connection error:", err.message);
    process.exit(1);
  });

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, () => {
  console.log("========================================");
  console.log(`[SERVER] Running on port ${PORT}`);
  console.log(`[ENV] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`[API] API running at: http://localhost:${PORT}/api`);
  console.log(`[CLIENT] Client URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  console.log("========================================");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("[UNHANDLED]", err);
  server.close(() => process.exit(1));
});

module.exports = app;
