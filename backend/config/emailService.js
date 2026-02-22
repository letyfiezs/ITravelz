require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const axios = require("axios");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.FROM_NAME,
          email: process.env.FROM_EMAIL,
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent via Brevo:", subject);
    return true;
  } catch (error) {
    console.error("❌ Brevo Email error:", error.response?.data || error.message);
    return false;
  }
};

const baseTemplate = (content) => `
<div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:30px;">
  <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:12px;">
    
    <h1 style="color:#3b82f6;text-align:center;margin-bottom:30px;">
      ✈️ Total Grand Travel
    </h1>

    ${content}

    <hr style="margin:30px 0;">
    <p style="font-size:12px;color:#888;text-align:center;">
      © 2026 Total Grand Travel. All rights reserved.
    </p>

  </div>
</div>
`;

/* ===========================
   VERIFICATION EMAIL
=========================== */
const sendVerificationEmail = async (email, name, token, link) => {
  const content = `
    <h2>Hello ${name},</h2>
    <p>Please verify your email by clicking the button below:</p>

    <div style="text-align:center;margin:30px 0;">
      <a href="${link}"
         style="background:#3b82f6;color:white;padding:12px 25px;
         text-decoration:none;border-radius:6px;font-weight:bold;">
        Verify Email
      </a>
    </div>

    <p style="font-size:13px;">Or copy this link:</p>
    <p style="font-size:12px;color:#3b82f6;">${link}</p>
  `;

  return await sendEmail(
    email,
    "Email Verification - Total Grand Travel",
    baseTemplate(content)
  );
};

/* ===========================
   WELCOME EMAIL
=========================== */
const sendWelcomeEmail = async (email, name) => {
  const content = `
    <h2>Welcome ${name}! 🌍</h2>
    <p>Your account has been successfully verified.</p>

    <ul>
      <li>Browse travel packages</li>
      <li>Book your next adventure</li>
      <li>Track your bookings</li>
    </ul>

    <p>We’re excited to have you with us!</p>
  `;

  return await sendEmail(
    email,
    "Welcome to Total Grand Travel!",
    baseTemplate(content)
  );
};

/* ===========================
   PASSWORD RESET
=========================== */
const sendPasswordResetEmail = async (email, name, token, link) => {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>Click below to reset your password:</p>

    <div style="text-align:center;margin:30px 0;">
      <a href="${link}"
         style="background:#f59e0b;color:white;padding:12px 25px;
         text-decoration:none;border-radius:6px;font-weight:bold;">
        Reset Password
      </a>
    </div>

    <p style="font-size:12px;color:red;">
      This link expires in 30 minutes.
    </p>
  `;

  return await sendEmail(
    email,
    "Password Reset - Total Grand Travel",
    baseTemplate(content)
  );
};

/* ===========================
   BOOKING CONFIRMATION
=========================== */
const sendBookingConfirmationEmail = async (
  email,
  name,
  booking
) => {
  const content = `
    <h2>🎉 Booking Confirmed!</h2>
    <p>Hello ${name},</p>

    <div style="background:#f0fdf4;padding:20px;border-radius:8px;">
      <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      <p><strong>Package:</strong> ${booking.packageName}</p>
      <p><strong>Duration:</strong> ${booking.duration}</p>
      <p><strong>Travel Date:</strong> ${booking.travelDate}</p>
      <p><strong>Status:</strong> Pending</p>
    </div>

    <p>Our team will contact you soon.</p>
  `;

  return await sendEmail(
    email,
    `Booking Confirmation - ${booking.packageName}`,
    baseTemplate(content)
  );
};

/* ===========================
   BOOKING APPROVED
=========================== */
const sendBookingApprovedEmail = async (
  email,
  name,
  booking
) => {
  const content = `
    <h2>✅ Your Booking is Approved!</h2>
    <p>Hello ${name},</p>
    <p>Great news! Your booking has been <strong style="color:#059669">approved</strong>. Get ready for an amazing journey! 🎉</p>

    <div style="background:#f0fdf4;padding:20px;border-radius:8px;border-left:4px solid #10b981;margin:20px 0">
      ${booking.bookingId ? `<p><strong>Booking ID:</strong> ${booking.bookingId}</p>` : ''}
      <p><strong>Package:</strong> ${booking.packageName}</p>
      ${booking.travelDate ? `<p><strong>Travel Date:</strong> ${booking.travelDate}</p>` : ''}
      ${booking.bookingTime ? `<p><strong>Departure Time:</strong> ${booking.bookingTime}</p>` : ''}
      ${booking.numberOfPeople ? `<p><strong>Guests:</strong> ${booking.numberOfPeople}</p>` : ''}
      ${booking.duration && booking.duration !== 'N/A' ? `<p><strong>Duration:</strong> ${booking.duration}</p>` : ''}
    </div>

    <p>Our team will reach out with further details. If you have any questions please reply to this email.</p>
    <p>We look forward to making your trip unforgettable!</p>
  `;

  return await sendEmail(
    email,
    `✅ Booking Approved - ${booking.packageName}`,
    baseTemplate(content)
  );
};

/* ===========================
   BOOKING DECLINED
=========================== */
const sendBookingDeclinedEmail = async (
  email,
  name,
  booking
) => {
  const content = `
    <h2>❌ Booking Update</h2>
    <p>Hello ${name},</p>

    <p>We're sorry to inform you that your booking for <strong>${booking.packageName}</strong> could not be approved at this time.</p>

    <div style="background:#fff5f5;padding:20px;border-radius:8px;border-left:4px solid #ef4444;margin:20px 0">
      ${booking.bookingId ? `<p><strong>Booking ID:</strong> ${booking.bookingId}</p>` : ''}
      <p><strong>Package:</strong> ${booking.packageName}</p>
      ${booking.travelDate ? `<p><strong>Requested Date:</strong> ${booking.travelDate}</p>` : ''}
    </div>

    <p>Please contact our support team for assistance or to re-schedule your trip. We apologize for the inconvenience.</p>
  `;

  return await sendEmail(
    email,
    `Booking Update - ${booking.packageName}`,
    baseTemplate(content)
  );
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendBookingApprovedEmail,
  sendBookingDeclinedEmail,
};
