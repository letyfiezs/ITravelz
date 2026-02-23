const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
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

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

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

// ── Google OAuth ───────────────────────────────────────────────────────
// Step 1: redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false, state: false })
);

// Step 2: Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed`, session: false, state: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const user  = {
      _id:    req.user._id,
      name:   req.user.name,
      email:  req.user.email,
      role:   req.user.role,
      avatar: req.user.avatar,
    };
    const encoded = Buffer.from(JSON.stringify(user)).toString("base64");
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/auth/google/callback?token=${token}&user=${encoded}`);
  }
);

// ── Protected routes ───────────────────────────────────────────────────
router.get("/validate", protect, validateToken);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
