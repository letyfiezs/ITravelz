const express = require("express");
const {
  signup,
  login,
  verifyEmail,
  verifyEmailByToken,
  forgotPassword,
  resetPassword,
  resetPasswordWithToken,
  validateToken,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ── Public routes ──────────────────────────────────────────────────────
router.post("/signup", signup);
router.post("/register", signup);          // frontend alias

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

// Reset password — supports both body-token (legacy) and URL-param token (React frontend)
router.post("/reset-password", resetPassword);
router.post("/reset-password/:token", resetPasswordWithToken);

// Email verification — supports both query-string (email link) and URL-param (React frontend)
router.get("/verify-email", verifyEmail);
router.get("/verify-email/:token", verifyEmailByToken);

// ── Protected routes ───────────────────────────────────────────────────
router.get("/validate", protect, validateToken);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
