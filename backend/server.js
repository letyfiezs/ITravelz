require("dotenv").config();
fetch(https://itravelz.onrender.com)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

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

// ========================================
// MIDDLEWARE
// ========================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
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

// Serve static files (uploads and frontend if needed)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.static(path.join(__dirname, "../public")));

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


// Serve admin.html for /admin* and booking-form.html for /booking-form.html
app.get(/^\/admin.*/, (req, res) => {
  const adminPath = path.join(__dirname, "../admin.html");
  res.sendFile(adminPath, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: "Page not found" });
    }
  });
});

app.get("/booking-form.html", (req, res) => {
  const bookingPath = path.join(__dirname, "../booking-form.html");
  res.sendFile(bookingPath, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: "Page not found" });
    }
  });
});

// Serve index.html for all other non-API, non-static routes (SPA fallback)
app.get(/^\/(?!api\/|uploads\/|static\/).*/, (req, res) => {
  const indexPath = path.join(__dirname, "../index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: "Page not found" });
    }
  });
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

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("========================================");
  console.log(`[SERVER] Running on port ${PORT}`);
  console.log(`[ENV] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`[API] API running at: http://localhost:${PORT}/api`);
  console.log(`[CLIENT] Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
  console.log("========================================");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("[UNHANDLED]", err);
  server.close(() => process.exit(1));
});

module.exports = app;
