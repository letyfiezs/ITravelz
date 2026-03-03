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
      },
    );

    console.log("âœ… Email sent via Brevo:", subject);
    return true;
  } catch (error) {
    console.error(
      "âŒ Brevo Email error:",
      error.response?.data || error.message,
    );
    return false;
  }
};

const baseTemplate = (content) => `
<div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:30px;">
  <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:12px;">
    
    <h1 style="color:#3b82f6;text-align:center;margin-bottom:30px;">
      âœˆï¸ Total Grand Travel
    </h1>

    ${content}

    <hr style="margin:30px 0;">
    <p style="font-size:12px;color:#888;text-align:center;">
      Â© 2026 Total Grand Travel. All rights reserved.
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
    baseTemplate(content),
  );
};

/* ===========================
   WELCOME EMAIL
=========================== */
const sendWelcomeEmail = async (email, name) => {
  const content = `
    <h2>Welcome ${name}! ðŸŒ</h2>
    <p>Your account has been successfully verified.</p>

    <ul>
      <li>Browse travel packages</li>
      <li>Book your next adventure</li>
      <li>Track your bookings</li>
    </ul>

    <p>Weâ€™re excited to have you with us!</p>
  `;

  return await sendEmail(
    email,
    "Welcome to Total Grand Travel!",
    baseTemplate(content),
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
    baseTemplate(content),
  );
};

/* ===========================
   BOOKING CONFIRMATION
=========================== */
const sendBookingConfirmationEmail = async (email, name, booking) => {
  const content = `
    <h2>ðŸŽ‰ Booking Confirmed!</h2>
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
    baseTemplate(content),
  );
};

/* ===========================
   BOOKING APPROVED
=========================== */
const sendBookingApprovedEmail = async (email, name, booking) => {
  const frontend = process.env.FRONTEND_URL || "https://itravelz.onrender.com";
  const bookingRef = booking.bookingId || "";
  const payLink = `${frontend}/payment?bookingId=${encodeURIComponent(bookingRef)}`;
  const amount = booking.totalPrice || booking.price || 0;

  const content = `
    <h2>âœ… Booking Approved â€” Payment Required</h2>
    <p>Hello ${name},</p>
    <p>Your booking has been <strong style="color:#059669">approved</strong> by our team. To finalize and secure your trip, please complete the payment.</p>

    <div style="background:#f0fdf4;padding:20px;border-radius:8px;border-left:4px solid #10b981;margin:20px 0">
      ${bookingRef ? `<p><strong>Booking ID:</strong> ${bookingRef}</p>` : ""}
      <p><strong>Package:</strong> ${booking.packageName}</p>
      ${booking.travelDate ? `<p><strong>Travel Date:</strong> ${booking.travelDate}</p>` : ""}
      ${booking.bookingTime ? `<p><strong>Departure Time:</strong> ${booking.bookingTime}</p>` : ""}
      ${booking.numberOfPeople ? `<p><strong>Guests:</strong> ${booking.numberOfPeople}</p>` : ""}
      ${booking.duration && booking.duration !== "N/A" ? `<p><strong>Duration:</strong> ${booking.duration}</p>` : ""}
      <p><strong>Amount due:</strong> ${amount ? `$${amount}` : "Contact us"}</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="${payLink}"
         style="background:#3b82f6;color:white;padding:12px 25px;text-decoration:none;border-radius:6px;font-weight:bold;">
        Pay & Confirm Booking
      </a>
    </div>

    <p style="font-size:13px;">Or open this link in your browser:</p>
    <p style="font-size:12px;color:#3b82f6;">${payLink}</p>

    <p>If you prefer a bank transfer or other payment method, reply to this email and our team will assist you.</p>
  `;

  return await sendEmail(
    email,
    `Action Required: Pay to Confirm Booking â€” ${booking.packageName}`,
    baseTemplate(content),
  );
};

/* ===========================
   PAYMENT SUCCESS â†’ FINAL CONFIRMATION
=========================== */
const sendPaymentSuccessEmail = async (email, name, booking) => {
  const content = `
    <h2>ðŸŽ‰ Your Trip Is Confirmed!</h2>
    <p>Hello ${name},</p>

    <div style="background:#f0fdf4;padding:20px;border-radius:8px;border-left:4px solid #10b981;margin:20px 0">
      ${booking.bookingId ? `<p><strong>Booking ID:</strong> ${booking.bookingId}</p>` : ""}
      <p><strong>Package:</strong> ${booking.packageName}</p>
      ${booking.travelDate ? `<p><strong>Travel Date:</strong> ${booking.travelDate}</p>` : ""}
      ${booking.bookingTime ? `<p><strong>Departure Time:</strong> ${booking.bookingTime}</p>` : ""}
      ${booking.numberOfPeople ? `<p><strong>Guests:</strong> ${booking.numberOfPeople}</p>` : ""}
      ${booking.duration && booking.duration !== "N/A" ? `<p><strong>Duration:</strong> ${booking.duration}</p>` : ""}
      <p><strong>Payment Status:</strong> Paid</p>
    </div>

    <p>Ð¢Ð°Ð½Ñ‹ Ð°ÑÐ»Ð°Ð» Ð±Ð°Ñ‚Ð°Ð»Ð³Ð°Ð°Ð¶Ð»Ð°Ð°. Ð‘Ð¸Ð´ Ñ‚Ð°Ð½Ð´ Ð´ÑÐ»Ð³ÑÑ€ÑÐ½Ð³Ò¯Ð¹ Ð¼ÑÐ´ÑÑÐ»ÑÐ» Ð±Ð¾Ð»Ð¾Ð½ ÑˆÐ°Ð°Ñ€Ð´Ð»Ð°Ð³Ð°Ñ‚Ð°Ð¹ Ð±Ð¸Ñ‡Ð¸Ð³ Ð±Ð°Ñ€Ð¸Ð¼Ñ‚Ñ‹Ð³ Ð¸Ð»Ð³ÑÑÑ… Ð±Ð¾Ð»Ð½Ð¾.</p>
    <p>Ð‘Ð¸Ð´ÑÐ½Ð´ Ð¸Ñ‚Ð³ÑÑÐ½ÑÐ´ Ð±Ð°ÑÑ€Ð»Ð°Ð»Ð°Ð° â€” ÑÐ°Ð¹Ñ…Ð°Ð½ Ð°ÑÐ»Ð°Ð» Ñ…Ò¯ÑÑŒÐµ!</p>
  `;

  return await sendEmail(
    email,
    `Booking Confirmed â€” ${booking.packageName}`,
    baseTemplate(content),
  );
};

/* ===========================
   ADMIN: PAYMENT RECEIVED NOTIFICATION
=========================== */
const sendAdminPaymentNotification = async (booking, customerName, customerEmail) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'backteck6@gmail.com';
  const content = `
    <h2>ðŸ’° Ð¨Ð¸Ð½Ñ Ð¢Ó©Ð»Ð±Ó©Ñ€ Ð˜Ñ€Ð»ÑÑ!</h2>
    <p>Ð¥ÑÑ€ÑÐ³Ð»ÑÐ³Ñ‡ Stripe-ÑÑÑ€ Ñ‚Ó©Ð»Ð±Ó©Ñ€Ó©Ó© Ð°Ð¼Ð¶Ð¸Ð»Ñ‚Ñ‚Ð°Ð¹ Ñ‚Ó©Ð»Ð»Ó©Ð¾.</p>

    <div style="background:#f0fdf4;padding:20px;border-radius:8px;border-left:4px solid #10b981;margin:20px 0">
      <p><strong>Ð—Ð°Ñ…Ð¸Ð°Ð»Ð³Ñ‹Ð½ Ð´ÑƒÐ³Ð°Ð°Ñ€:</strong> ${booking.bookingId}</p>
      <p><strong>Ð¥ÑÑ€ÑÐ³Ð»ÑÐ³Ñ‡Ð¸Ð¹Ð½ Ð½ÑÑ€:</strong> ${customerName}</p>
      <p><strong>Ð˜Ð¼ÑÐ¹Ð»:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
      <p><strong>ÐÑÐ»Ð°Ð»:</strong> ${booking.packageName}</p>
      ${booking.travelDate ? `<p><strong>ÐžÐ³Ð½Ð¾Ð¾:</strong> ${booking.travelDate}</p>` : ''}
      ${booking.numberOfPeople ? `<p><strong>Ð¥Ò¯Ð½Ð¸Ð¹ Ñ‚Ð¾Ð¾:</strong> ${booking.numberOfPeople}</p>` : ''}
      <p><strong>Ð¢Ó©Ð»Ð±Ó©Ñ€Ð¸Ð¹Ð½ Ñ…ÑÐ»Ð±ÑÑ€:</strong> Stripe Card</p>
      <p><strong>Stripe ID:</strong> ${booking.transactionId || 'â€”'}</p>
    </div>

    <p style="color:#059669;font-weight:bold;">âœ… Ð—Ð°Ñ…Ð¸Ð°Ð»Ð³Ð° Ð¾Ð´Ð¾Ð¾ Ð±Ð°Ñ‚Ð°Ð»Ð³Ð°Ð°Ð¶ÑÐ°Ð½ Ð±Ð°Ð¹Ð½Ð°.</p>
  `;

  return await sendEmail(
    adminEmail,
    `ðŸ’° Ð¨Ð¸Ð½Ñ Ð¢Ó©Ð»Ð±Ó©Ñ€: ${booking.packageName} â€” ${customerName}`,
    baseTemplate(content),
  );
};

/* ===========================
   BOOKING DECLINED
=========================== */
const sendBookingDeclinedEmail = async (email, name, booking) => {
  const content = `
    <h2>âŒ Booking Update</h2>
    <p>Hello ${name},</p>

    <p>We're sorry to inform you that your booking for <strong>${booking.packageName}</strong> could not be approved at this time.</p>

    <div style="background:#fff5f5;padding:20px;border-radius:8px;border-left:4px solid #ef4444;margin:20px 0">
      ${booking.bookingId ? `<p><strong>Booking ID:</strong> ${booking.bookingId}</p>` : ""}
      <p><strong>Package:</strong> ${booking.packageName}</p>
      ${booking.travelDate ? `<p><strong>Requested Date:</strong> ${booking.travelDate}</p>` : ""}
    </div>

    <p>Please contact our support team for assistance or to re-schedule your trip. We apologize for the inconvenience.</p>
  `;

  return await sendEmail(
    email,
    `Booking Update - ${booking.packageName}`,
    baseTemplate(content),
  );
};

/* ===========================
   CONTACT FORM â†’ ADMIN NOTIFICATION
   ÐšÐ»Ð¸ÐµÐ½Ñ‚ Ñ„Ð¾Ñ€Ð¼ Ð¸Ð»Ð³ÑÑÑ… Ò¯ÐµÐ´ admin-Ð´ Ð¼ÑÐ´ÑÐ³Ð´ÑÐ»
=========================== */
const sendContactNotification = async (contact) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
  if (!adminEmail) {
    console.warn("âš ï¸  ADMIN_EMAIL not set â€” contact notification skipped");
    return false;
  }

  const content = `
    <h2>ðŸ“¬ Ð¨Ð¸Ð½Ñ Contact Message</h2>
    <p>Ð¡Ð°Ð¹Ñ‚Ð°Ð°Ñ ÑˆÐ¸Ð½Ñ Ð¼ÐµÑÑÐµÐ¶ Ð¸Ñ€Ð»ÑÑ:</p>

    <div style="background:#f0f4ff;padding:20px;border-radius:8px;border-left:4px solid #3b82f6;margin:20px 0;">
      <p><strong>ÐÑÑ€:</strong> ${contact.name}</p>
      <p><strong>Ð˜Ð¼ÑÐ¹Ð»:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
      ${contact.phone ? `<p><strong>Ð£Ñ‚Ð°Ñ:</strong> ${contact.phone}</p>` : ""}
      <p><strong>Ð¡ÑÐ´ÑÐ²:</strong> ${contact.subject}</p>
    </div>

    <h3>ÐœÐµÑÑÐµÐ¶:</h3>
    <div style="background:#fff8e1;padding:20px;border-radius:8px;font-size:15px;line-height:1.7;">
      ${contact.message.replace(/\n/g, "<br>")}
    </div>

    <p style="margin-top:24px;font-size:13px;color:#666;">
      Ð¥Ð°Ñ€Ð¸ÑƒÐ»Ð°Ñ…: <a href="mailto:${contact.email}">${contact.email}</a>
    </p>
  `;

  return await sendEmail(
    adminEmail,
    `ðŸ“¬ Ð¨Ð¸Ð½Ñ ÐœÐµÑÑÐµÐ¶: ${contact.subject} â€” ${contact.name}`,
    baseTemplate(content),
  );
};

/* ===========================
   CONTACT FORM â†’ USER CONFIRMATION
   ÐšÐ»Ð¸ÐµÐ½Ñ‚ÑÐ´ Ð±Ð°Ñ‚Ð°Ð»Ð³Ð°Ð°Ð¶ÑƒÑƒÐ»Ð°Ñ… Ð¼ÑÐ¹Ð»
=========================== */
const sendContactConfirmation = async (contact) => {
  const content = `
    <h2>Ð‘Ð°ÑÑ€Ð»Ð°Ð»Ð°Ð°, ${contact.name}! ðŸ™</h2>
    <p>Ð¢Ð°Ð½Ñ‹ Ð¼ÐµÑÑÐµÐ¶ Ñ…Ò¯Ð»ÑÑÐ½ Ð°Ð²Ð»Ð°Ð°. Ð‘Ð¸Ð´ ÑƒÐ´Ð°Ñ…Ð³Ò¯Ð¹ 24 Ñ†Ð°Ð³Ð¸Ð¹Ð½ Ð´Ð¾Ñ‚Ð¾Ñ€ Ñ…Ð°Ñ€Ð¸Ñƒ Ó©Ð³Ð½Ó©.</p>

    <div style="background:#f0fdf4;padding:20px;border-radius:8px;border-left:4px solid #10b981;margin:20px 0;">
      <p><strong>Ð¡ÑÐ´ÑÐ²:</strong> ${contact.subject}</p>
      <p><strong>ÐœÐµÑÑÐµÐ¶:</strong></p>
      <p style="color:#555;font-style:italic;">${contact.message.replace(/\n/g, "<br>")}</p>
    </div>

    <p>Ð¥ÑÑ€ÑÐ² Ñ‚Ð° Ð½ÑÐ½ ÑÐ°Ñ€Ð°Ð»Ñ‚Ð°Ð¹ Ð±Ð¾Ð» Ð´Ð°Ñ€Ð°Ð°Ñ… Ñ…Ð¾Ð»Ð±Ð¾Ð³Ð´Ð¾Ð»Ñ‚Ð¾Ð¹ Ð±Ð°Ð¹Ð½Ð° ÑƒÑƒ:</p>
    <p>ðŸ“§ <a href="mailto:${process.env.FROM_EMAIL || "info@itravelz.com"}">${process.env.FROM_EMAIL || "info@itravelz.com"}</a></p>
  `;

  return await sendEmail(
    contact.email,
    `Ð¢Ð°Ð½Ñ‹ Ð¼ÐµÑÑÐµÐ¶Ð¸Ð¹Ð³ Ñ…Ò¯Ð»ÑÑÐ½ Ð°Ð²Ð»Ð°Ð° â€” ITravelz`,
    baseTemplate(content),
  );
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendBookingApprovedEmail,
  sendPaymentSuccessEmail,
  sendAdminPaymentNotification,
  sendBookingDeclinedEmail,
  sendContactNotification,
  sendContactConfirmation,
};
