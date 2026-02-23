require("dotenv").config({ path: require("path").join(__dirname, ".env") });
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
const itinerariesRoutes = require('./routes/itineraries');
const destinationsRoutes = require('./routes/destinations');
const contactRoutes = require('./routes/contact');
const chatRoutes    = require('./routes/chat');

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

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development without CLIENT_URL set, allow all
      if (!process.env.CLIENT_URL) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
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

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/packages", packagesRoutes);
app.use("/api/content", contentRoutes);
app.use('/api/itineraries', itinerariesRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat',    chatRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, status: "Server is running" });
});

// ========================================
// SERVE REACT FRONTEND
// ========================================

// Serve built React static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA fallback — let React Router handle all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
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

// Graceful shutdown for nodemon restarts (SIGUSR2) and normal exits
const gracefulShutdown = (signal) => {
  console.log(`[SHUTDOWN] ${signal} received — closing HTTP server`);
  server.close(() => {
    console.log('[SHUTDOWN] HTTP server closed');
    mongoose.connection.close(false).then(() => {
      console.log('[SHUTDOWN] MongoDB connection closed');
      process.kill(process.pid, signal);
    });
  });
};

process.once('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED]', err);
  server.close(() => process.exit(1));
});
