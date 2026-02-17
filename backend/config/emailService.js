require("dotenv").config();
const nodemailer = require("nodemailer");

// ========================================
// BREVO SMTP CONFIG
// ========================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // 587 дээр false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error("❌ Brevo Email error:", error.message);
  } else {
    console.log("✅ Brevo email service connected");
  }
});

// ========================================
// GENERIC SEND FUNCTION
// ========================================
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    return false;
  }
};

// ========================================
// VERIFY EMAIL
// ========================================
exports.sendVerificationEmail = async (
  email,
  name,
  token,
  verificationLink
) => {
  const html = `
    <h2>Hello ${name} 👋</h2>
    <p>Please verify your email address:</p>
    <a href="${verificationLink}">Verify Email</a>
  `;

  return await sendEmail(
    email,
    "Email Verification - Total Grand Travel",
    html
  );
};

// ========================================
// PASSWORD RESET
// ========================================
exports.sendPasswordResetEmail = async (
  email,
  name,
  token,
  resetLink
) => {
  const html = `
    <h2>Password Reset</h2>
    <p>Hi ${name},</p>
    <a href="${resetLink}">Reset Password</a>
  `;

  return await sendEmail(
    email,
    "Password Reset - Total Grand Travel",
    html
  );
};

// ========================================
// WELCOME EMAIL
// ========================================
exports.sendWelcomeEmail = async (email, name) => {
  const html = `
    <h2>Welcome ${name} 🎉</h2>
    <p>Your account has been successfully verified.</p>
  `;

  return await sendEmail(
    email,
    "Welcome to Total Grand Travel",
    html
  );
};
