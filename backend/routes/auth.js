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

// Step 2: Google redirects back here — custom callback to detect new users
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false, state: false }, (err, user, info) => {
      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed`);
      }
      const token = generateToken(user._id);
      const userData = {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar,
        phone:  user.phone,
      };
      const encoded = Buffer.from(JSON.stringify(userData)).toString("base64");
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      if (info?.isNew) {
        return res.redirect(`${clientUrl}/google-complete?token=${token}&user=${encoded}`);
      }
      return res.redirect(`${clientUrl}/auth/google/callback?token=${token}&user=${encoded}`);
    })(req, res, next);
  }
);

// Complete Google registration — save phone for new Google users
router.put("/google/complete", protect, async (req, res) => {
  try {
    const { phone } = req.body;
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.userId,
      { phone },
      { new: true }
    );
    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to complete registration' });
  }
});

// ── Protected routes ───────────────────────────────────────────────────
router.get("/validate", protect, validateToken);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
