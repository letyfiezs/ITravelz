const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const querystring = require("querystring");
const isEmailVerified = true;
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../config/emailService");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register User
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Debug logging
    console.log("📨 Signup Request Received:");
    console.log("Body:", req.body);
    console.log("Name:", name, "| Empty?", !name);
    console.log("Email:", email, "| Empty?", !email);
    console.log("Password:", password ? "***" : "EMPTY", "| Empty?", !password);
    console.log(
      "ConfirmPassword:",
      confirmPassword ? "***" : "EMPTY",
      "| Empty?",
      !confirmPassword,
    );

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      console.error("❌ Validation Failed - Missing fields");
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    console.log(
      "🔐 Generated verification token:",
      verificationToken.substring(0, 10) + "...",
    );
    console.log(
      "🔐 Generated token hash:",
      verificationTokenHash.substring(0, 10) + "...",
    );

    // Create user — mark email verified immediately so the user can sign in right away.
    // A verification email is still sent as a courtesy.
    user = new User({
      name,
      email,
      password,
      isEmailVerified: true,
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();
    const loginToken = generateToken(user._id);
    console.log("✅ User saved to database:", user._id);
    console.log(
      "✅ Stored token hash in DB:",
      user.emailVerificationToken.substring(0, 10) + "...",
    );
    console.log(
      "✅ Verification expires at:",
      new Date(user.emailVerificationExpires),
    );

    // Build verification link that hits the backend verification endpoint
    // so clicking the email link will verify the account server-side and
    // optionally redirect the user back to the frontend UI.
    const params = querystring.stringify({ token: verificationToken, email });
    const backendUrl = process.env.API_URL || `http://localhost:5000`;
    const redirectTo = process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/verify-email`
      : `http://localhost:3000/verify-email`;

    const verificationLink = `${backendUrl}/api/auth/verify-email?${params}&redirect=true&redirectUrl=${encodeURIComponent(
      redirectTo,
    )}`;
    console.log("📧 Verification link:", verificationLink);

    // Send verification email
    console.log("📮 Attempting to send verification email to:", email);
    const emailSent = await sendVerificationEmail(
      email,
      name,
      verificationToken,
      verificationLink,
    );

    if (emailSent) {
      console.log("✅ Verification email sent successfully to:", email);
      res.status(201).json({
        success: true,
        message: "Account created successfully!",
        emailSent: true,
        token: loginToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role || "user" },
        data: { id: user._id, name: user.name, email: user.email, role: user.role || "user", isEmailVerified: true },
      });
    } else {
      console.warn(
        "⚠️ Verification email could not be sent to:",
        email,
        "- Check SMTP credentials",
      );
      res.status(201).json({
        success: true,
        message: "Account created successfully!",
        emailSent: false,
        token: loginToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role || "user" },
        data: { id: user._id, name: user.name, email: user.email, role: user.role || "user", isEmailVerified: true },
      });
    }
  } catch (error) {
    console.error("❌ Signup error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
      error: error.message,
    });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    const redirectUrl = req.query.redirectUrl;
    const shouldRedirect = req.query.redirect === "true" || !!redirectUrl;

    console.log("🔍 Email Verification Request:");
    console.log(
      "Token from URL:",
      token ? token.substring(0, 10) + "..." : "MISSING",
    );
    console.log("Email from URL:", email);

    if (!token || !email) {
      console.error("❌ Verification Failed - Missing token or email");
      if (shouldRedirect) {
        const target = redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email`;
        return res.redirect(`${target}?success=false&message=${encodeURIComponent('Invalid verification request')}`);
      }
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification request" });
    }

    // Hash the token from the URL
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log(
      "🔐 Token hash from URL:",
      verificationTokenHash.substring(0, 10) + "...",
    );

    // Find user by email
    console.log("🔍 Looking for user with email:", email);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error("❌ User not found with email:", email);
      if (shouldRedirect) {
        const target = redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email`;
        return res.redirect(`${target}?success=false&message=${encodeURIComponent('User not found')}`);
      }
      return res.status(400).json({
        success: false,
        message: "User not found with this email",
      });
    }

    console.log("✅ User found:", user.email);
    console.log("Current isEmailVerified:", user.isEmailVerified);
    console.log(
      "Stored token hash:",
      user.emailVerificationToken
        ? user.emailVerificationToken.substring(0, 10) + "..."
        : "NONE",
    );
    console.log("Token expires at:", user.emailVerificationExpires);
    console.log("Current time:", Date.now());

    // Check if token matches
    if (!user.emailVerificationToken) {
      console.error("❌ No verification token found for user");
      if (shouldRedirect) {
        const target = redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email`;
        return res.redirect(`${target}?success=false&message=${encodeURIComponent('Verification token not found')}`);
      }
      return res.status(400).json({
        success: false,
        message: "Verification token not found. Please register again.",
      });
    }

    if (user.emailVerificationToken !== verificationTokenHash) {
      console.error("❌ Token mismatch");
      console.error(
        "Expected:",
        user.emailVerificationToken.substring(0, 10) + "...",
      );
      console.error("Got:", verificationTokenHash.substring(0, 10) + "...");
      if (shouldRedirect) {
        const target = redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email`;
        return res.redirect(`${target}?success=false&message=${encodeURIComponent('Invalid verification token')}`);
      }
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    // Check if token has expired
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < Date.now()
    ) {
      console.error("❌ Verification token expired");
      if (shouldRedirect) {
        const target = redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email`;
        return res.redirect(`${target}?success=false&message=${encodeURIComponent('Verification link expired')}`);
      }
      return res.status(400).json({
        success: false,
        message: "Verification link has expired. Please register again.",
      });
    }

    // Mark email as verified using findByIdAndUpdate for better reliability
    console.log("✅ Marking email as verified...");

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      { new: false }, // Return the updated document
    );

    console.log(
      "✅ User updated - isEmailVerified is now:",
      updatedUser.isEmailVerified,
    );
    console.log(
      "✅ Updated verification token:",
      updatedUser.emailVerificationToken,
    );
    console.log(
      "✅ Updated verification expires:",
      updatedUser.emailVerificationExpires,
    );

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    if (shouldRedirect) {
      const target = redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email`;
      return res.redirect(`${target}?success=true`);
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login.",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isEmailVerified: updatedUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("❌ Email verification error:", error);
    console.error("Error message:", error.message);
    if (req.query && (req.query.redirect === "true" || req.query.redirectUrl)) {
      const target = req.query.redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email`;
      return res.redirect(`${target}?success=false&message=${encodeURIComponent('Server error during verification')}`);
    }
    res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: error.message,
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login Request Received:");
    console.log("Email:", email, "| Empty?", !email);
    console.log("Password:", password ? "***" : "EMPTY", "| Empty?", !password);

    if (!email || !password) {
      console.error("❌ Validation Failed - Missing email or password");
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    console.log("🔍 Looking up user:", email);
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.error("❌ User not found:", email);
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    console.log("✅ User found:", user.email);
    console.log("Email verified?", user.isEmailVerified);

    // Check password
    console.log("🔐 Comparing passwords...");
    const passwordMatch = await user.matchPassword(password);
    console.log("Password match?", passwordMatch);

    if (!passwordMatch) {
      console.error("❌ Password incorrect for user:", email);
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      console.warn("⚠️ Email not verified for user:", email);
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
        data: { isEmailVerified: false },
      });
    }

    const token = generateToken(user._id);
    console.log("✅ Login successful for:", user.email);
    console.log("Token generated");

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      data: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    console.error("Error message:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide an email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email. Please sign up first.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Build reset link
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      email,
      user.name,
      resetToken,
      resetLink,
    );

    if (emailSent) {
      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email. Check your inbox.",
      });
    } else {
      res.status(200).json({
        success: true,
        message:
          "Request processed. If an account exists with this email, a reset link will be sent.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing password reset",
      error: error.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password, confirmPassword } = req.body;

    if (!token || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const passwordResetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email,
      passwordResetToken: passwordResetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset link" });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully! You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, country, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address, city, country, avatar, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New passwords do not match" });
    }

    const user = await User.findById(req.userId).select("+password");

    if (!(await user.matchPassword(currentPassword))) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// ── New functions required by the React frontend ────────────────────────

// Validate stored JWT token (called on app load to restore session)
exports.validateToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify email by token in URL param (React frontend: GET /verify-email/:token)
exports.verifyEmailByToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ success: false, message: "Token required" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified! You can now sign in." });
  } catch (err) {
    console.error("verifyEmailByToken error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// Reset password with token in URL param (React frontend: POST /reset-password/:token)
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully! You can now sign in." });
  } catch (err) {
    console.error("resetPasswordWithToken error:", err);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};
