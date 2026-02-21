require("dotenv").config();
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
app.set("trust proxy", 1);

// ========================================
// MIDDLEWARE
// ========================================

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api/", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/packages", packagesRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/itineraries", itinerariesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, status: "Server is running" });
});

// ========================================
// SERVE FRONTEND
// ========================================

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Admin page
app.get("/admin*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin.html"));
});

// Booking form page
app.get("/booking-form.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/booking-form.html"));
});

// SPA fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.includes(".")) {
    return next();
  }

  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ========================================
// ERROR HANDLING
// ========================================

app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// ========================================
// DATABASE CONNECTION
// ========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("[DB] MongoDB connected");
  })
  .catch((err) => {
    console.error("[DB ERROR]", err.message);
    process.exit(1);
  });

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("[UNHANDLED]", err);
  server.close(() => process.exit(1));
});
