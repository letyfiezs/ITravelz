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
    console.log("✅ Email sent via Brevo:", subject);
    return true;
  } catch (error) {
    console.error("❌ Brevo Email error:", error.response?.data || error.message);
    return false;
  }
};

// ─── Base Template ────────────────────────────────────────────────────────────
const baseTemplate = (content, accentColor = "#1d4ed8") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#0ea5e9 100%);border-radius:14px 14px 0 0;padding:36px 40px;text-align:center;">
          <div style="font-size:28px;letter-spacing:-0.5px;font-weight:800;color:#fff;">
            ✈️ Total Grand Travel
          </div>
          <div style="color:#bfdbfe;font-size:13px;margin-top:6px;letter-spacing:0.3px;">
            Mongolia's Premier Travel Experience
          </div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 40px;border-radius:0 0 14px 14px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          ${content}

          <!-- Footer -->
          <div style="margin-top:36px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} Total Grand Travel &nbsp;·&nbsp; Mongolia
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:#cbd5e1;">
              Questions? Reply to this email or visit
              <a href="${process.env.FRONTEND_URL || "https://itravelmongolia.com"}" style="color:#3b82f6;text-decoration:none;">itravelmongolia.com</a>
            </p>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// Reusable info row block
const infoRow = (label, value) =>
  value
    ? `<tr>
        <td style="padding:8px 0;color:#64748b;font-size:14px;width:140px;vertical-align:top;">${label}</td>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;vertical-align:top;">${value}</td>
       </tr>`
    : "";

// Reusable CTA button
const ctaButton = (text, href, color = "#2563eb") =>
  `<div style="text-align:center;margin:28px 0 8px;">
    <a href="${href}"
       style="display:inline-block;background:${color};color:#fff;text-decoration:none;
              padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;
              letter-spacing:0.2px;box-shadow:0 4px 12px rgba(37,99,235,0.3);">
      ${text}
    </a>
  </div>`;

/* ===========================
   VERIFICATION EMAIL
=========================== */
const sendVerificationEmail = async (email, name, token, link) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Verify your email address</h2>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">Hi ${name}, thanks for signing up! Please confirm your email address to activate your account.</p>

    ${ctaButton("Verify Email Address", link, "#2563eb")}

    <p style="text-align:center;color:#94a3b8;font-size:12px;margin:12px 0 0;">
      Or copy and paste this link into your browser:<br>
      <a href="${link}" style="color:#3b82f6;word-break:break-all;">${link}</a>
    </p>

    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:12px 16px;margin-top:24px;">
      <p style="margin:0;font-size:13px;color:#713f12;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;
  return await sendEmail(email, "Verify your email — Total Grand Travel", baseTemplate(content));
};

/* ===========================
   WELCOME EMAIL
=========================== */
const sendWelcomeEmail = async (email, name) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Welcome aboard, ${name}! 🎉</h2>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">Your account is verified and ready to go. Start exploring Mongolia's most breathtaking destinations with us.</p>

    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#166534;">What you can do:</p>
      <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:2;">
        <li>Browse curated travel packages</li>
        <li>Book tours with real-time availability</li>
        <li>Track and manage your reservations</li>
        <li>Explore Mongolia's festivals &amp; destinations</li>
      </ul>
    </div>

    ${ctaButton("Start Exploring", process.env.FRONTEND_URL || "https://itravelmongolia.com", "#22c55e")}
  `;
  return await sendEmail(email, "Welcome to Total Grand Travel! 🌍", baseTemplate(content));
};

/* ===========================
   PASSWORD RESET
=========================== */
const sendPasswordResetEmail = async (email, name, token, link) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Reset your password</h2>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.</p>

    ${ctaButton("Reset Password", link, "#f59e0b")}

    <p style="text-align:center;color:#94a3b8;font-size:12px;margin:12px 0 0;">
      Or copy: <a href="${link}" style="color:#3b82f6;word-break:break-all;">${link}</a>
    </p>

    <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:8px;padding:12px 16px;margin-top:24px;">
      <p style="margin:0;font-size:13px;color:#9f1239;">⏱ This link expires in <strong>30 minutes</strong>. If you didn't request a password reset, please ignore this email — your account is safe.</p>
    </div>
  `;
  return await sendEmail(email, "Password Reset Request — Total Grand Travel", baseTemplate(content));
};

/* ===========================
   BOOKING CONFIRMATION
=========================== */
const sendBookingConfirmationEmail = async (email, name, booking) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Booking received!</h2>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">Hi ${name}, we've received your booking request. Our team will review it and get back to you shortly.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;">Booking Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Booking ID", booking.bookingId)}
        ${infoRow("Package", booking.packageName)}
        ${infoRow("Travel Date", booking.travelDate)}
        ${booking.duration ? infoRow("Duration", booking.duration) : ""}
        ${infoRow("Status", "⏳ Pending Review")}
      </table>
    </div>

    <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.6;">
        Our team typically reviews bookings within <strong>24 hours</strong>. Once approved, you'll receive a payment link via email to confirm your reservation.
      </p>
    </div>
  `;
  return await sendEmail(
    email,
    `Booking Received — ${booking.packageName}`,
    baseTemplate(content),
  );
};

/* ===========================
   BOOKING APPROVED
=========================== */
const sendBookingApprovedEmail = async (email, name, booking) => {
  const frontend = process.env.FRONTEND_URL || "https://itravelmongolia.com";
  const bookingRef = booking.bookingId || "";
  const payLink = `${frontend}/payment?bookingId=${encodeURIComponent(bookingRef)}`;
  const amount = booking.totalPrice || booking.price || 0;

  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#dcfce7;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">✅</div>
      <h2 style="margin:12px 0 6px;color:#0f172a;font-size:22px;">Your booking is approved!</h2>
      <p style="color:#475569;margin:0;font-size:15px;">Hi ${name}, complete your payment to lock in your spot.</p>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;">Trip Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${bookingRef ? infoRow("Booking ID", bookingRef) : ""}
        ${infoRow("Package", booking.packageName)}
        ${booking.travelDate ? infoRow("Travel Date", booking.travelDate) : ""}
        ${booking.bookingTime ? infoRow("Departure", booking.bookingTime) : ""}
        ${booking.numberOfPeople ? infoRow("Guests", `${booking.numberOfPeople} ${booking.numberOfPeople === 1 ? "person" : "people"}`) : ""}
        ${booking.duration && booking.duration !== "N/A" ? infoRow("Duration", booking.duration) : ""}
      </table>
    </div>

    ${amount > 0 ? `
    <div style="background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:1px solid #bfdbfe;border-radius:10px;padding:16px 24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Total Amount Due</p>
      <p style="margin:0;font-size:32px;font-weight:800;color:#059669;">$${Number(amount).toLocaleString()}</p>
    </div>` : ""}

    ${ctaButton("💳 Complete Payment", payLink, "#2563eb")}

    <p style="text-align:center;color:#94a3b8;font-size:12px;margin:8px 0 0;">
      Secure payment powered by Stripe · Card details are never stored on our servers
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-top:20px;">
      <p style="margin:0;font-size:12px;color:#64748b;">
        Can't click the button? Copy this link into your browser:<br>
        <a href="${payLink}" style="color:#3b82f6;word-break:break-all;">${payLink}</a>
      </p>
    </div>
  `;

  return await sendEmail(
    email,
    `Action Required: Complete Payment for ${booking.packageName}`,
    baseTemplate(content),
  );
};

/* ===========================
   PAYMENT SUCCESS → FINAL CONFIRMATION
=========================== */
const sendPaymentSuccessEmail = async (email, name, booking) => {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#dcfce7;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:36px;">🎉</div>
      <h2 style="margin:12px 0 6px;color:#0f172a;font-size:22px;">You're all set — trip confirmed!</h2>
      <p style="color:#475569;margin:0;font-size:15px;">Hi ${name}, your payment was successful and your trip is officially booked.</p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#166534;">Confirmed Trip Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${booking.bookingId ? infoRow("Booking ID", booking.bookingId) : ""}
        ${infoRow("Package", booking.packageName)}
        ${booking.travelDate ? infoRow("Travel Date", booking.travelDate) : ""}
        ${booking.bookingTime ? infoRow("Departure", booking.bookingTime) : ""}
        ${booking.numberOfPeople ? infoRow("Guests", `${booking.numberOfPeople} ${booking.numberOfPeople === 1 ? "person" : "people"}`) : ""}
        ${booking.duration && booking.duration !== "N/A" ? infoRow("Duration", booking.duration) : ""}
        ${booking.totalPrice ? infoRow("Amount Paid", `$${Number(booking.totalPrice).toLocaleString()}`) : ""}
        ${infoRow("Payment", "✅ Confirmed")}
      </table>
    </div>

    <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.7;">
        Our team will reach out with your full itinerary, departure details, and any documents you'll need before your trip. Please keep this email for your records.
      </p>
    </div>

    <div style="text-align:center;padding:20px 0 4px;">
      <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Have an incredible adventure! 🌍</p>
      <p style="margin:6px 0 0;font-size:14px;color:#64748b;">— The Total Grand Travel Team</p>
    </div>
  `;

  return await sendEmail(
    email,
    `Trip Confirmed — ${booking.packageName} 🎉`,
    baseTemplate(content),
  );
};

/* ===========================
   BOOKING DECLINED
=========================== */
const sendBookingDeclinedEmail = async (email, name, booking) => {
  const frontend = process.env.FRONTEND_URL || "https://itravelmongolia.com";

  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Booking update</h2>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">Hi ${name}, we're sorry to let you know that we're unable to confirm your booking at this time.</p>

    <div style="background:#fff1f2;border:1px solid #fecdd3;border-left:4px solid #ef4444;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${booking.bookingId ? infoRow("Booking ID", booking.bookingId) : ""}
        ${infoRow("Package", booking.packageName)}
        ${booking.travelDate ? infoRow("Requested Date", booking.travelDate) : ""}
        ${infoRow("Status", "❌ Not Approved")}
      </table>
    </div>

    <p style="color:#475569;line-height:1.6;font-size:14px;">This may be due to availability, scheduling, or operational constraints. We sincerely apologize for the inconvenience.</p>

    <p style="color:#475569;line-height:1.6;font-size:14px;">You're welcome to explore other available dates and packages — we'd love to help plan your next adventure.</p>

    ${ctaButton("Browse Other Packages", frontend, "#f59e0b")}
  `;

  return await sendEmail(
    email,
    `Booking Update — ${booking.packageName}`,
    baseTemplate(content),
  );
};

/* ===========================
   CONTACT FORM → ADMIN NOTIFICATION
=========================== */
const sendContactNotification = async (contact) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️  ADMIN_EMAIL not set — contact notification skipped");
    return false;
  }

  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">New contact message</h2>
    <p style="color:#475569;margin:0 0 24px;">A visitor submitted a message via the contact form.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Name", contact.name)}
        ${infoRow("Email", `<a href="mailto:${contact.email}" style="color:#3b82f6;">${contact.email}</a>`)}
        ${contact.phone ? infoRow("Phone", contact.phone) : ""}
        ${infoRow("Subject", contact.subject)}
      </table>
    </div>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:20px 24px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;white-space:pre-wrap;">${contact.message}</p>
    </div>

    <div style="margin-top:20px;text-align:center;">
      <a href="mailto:${contact.email}?subject=Re: ${contact.subject}"
         style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
                padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
        Reply to ${contact.name}
      </a>
    </div>
  `;

  return await sendEmail(
    adminEmail,
    `New Message: ${contact.subject} — ${contact.name}`,
    baseTemplate(content),
  );
};

/* ===========================
   CONTACT FORM → USER CONFIRMATION
=========================== */
const sendContactConfirmation = async (contact) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">We've received your message!</h2>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">Hi ${contact.name}, thank you for getting in touch. Our team will review your message and respond within <strong>24 hours</strong>.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Your Message</p>
      ${infoRow("Subject", contact.subject)}
      <tr>
        <td colspan="2" style="padding-top:12px;">
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;font-size:14px;color:#475569;line-height:1.7;font-style:italic;">
            "${contact.message}"
          </div>
        </td>
      </tr>
    </div>

    <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#1e40af;">
        For urgent inquiries, email us directly at
        <a href="mailto:${process.env.FROM_EMAIL || "info@itravelmongolia.com"}" style="color:#2563eb;font-weight:600;">${process.env.FROM_EMAIL || "info@itravelmongolia.com"}</a>
      </p>
    </div>
  `;

  return await sendEmail(
    contact.email,
    `We received your message — Total Grand Travel`,
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
  sendBookingDeclinedEmail,
  sendContactNotification,
  sendContactConfirmation,
};
