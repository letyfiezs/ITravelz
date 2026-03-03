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
    console.error(
      "❌ Brevo Email error:",
      error.response?.data || error.message,
    );
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
    baseTemplate(content),
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
    <h2>✅ Booking Approved — Payment Required</h2>
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
    `Action Required: Pay to Confirm Booking — ${booking.packageName}`,
    baseTemplate(content),
  );
};

/* ===========================
   PAYMENT SUCCESS → FINAL CONFIRMATION
=========================== */
const sendPaymentSuccessEmail = async (email, name, booking) => {
  const content = `
    <h2>🎉 Your Trip Is Confirmed!</h2>
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

    <p>Таны аялал баталгаажлаа. Бид танд дэлгэрэнгүй мэдээлэл болон шаардлагатай бичиг баримтыг илгээх болно.</p>
    <p>Бидэнд итгэснэд баярлалаа — сайхан аялал хүсье!</p>
  `;

  return await sendEmail(
    email,
    `Booking Confirmed — ${booking.packageName}`,
    baseTemplate(content),
  );
};

/* ===========================
   BOOKING DECLINED
=========================== */
const sendBookingDeclinedEmail = async (email, name, booking) => {
  const content = `
    <h2>❌ Booking Update</h2>
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
   CONTACT FORM → ADMIN NOTIFICATION
   Клиент форм илгээх үед admin-д мэдэгдэл
=========================== */
const sendContactNotification = async (contact) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️  ADMIN_EMAIL not set — contact notification skipped");
    return false;
  }

  const content = `
    <h2>📬 Шинэ Contact Message</h2>
    <p>Сайтаас шинэ мессеж ирлээ:</p>

    <div style="background:#f0f4ff;padding:20px;border-radius:8px;border-left:4px solid #3b82f6;margin:20px 0;">
      <p><strong>Нэр:</strong> ${contact.name}</p>
      <p><strong>Имэйл:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
      ${contact.phone ? `<p><strong>Утас:</strong> ${contact.phone}</p>` : ""}
      <p><strong>Сэдэв:</strong> ${contact.subject}</p>
    </div>

    <h3>Мессеж:</h3>
    <div style="background:#fff8e1;padding:20px;border-radius:8px;font-size:15px;line-height:1.7;">
      ${contact.message.replace(/\n/g, "<br>")}
    </div>

    <p style="margin-top:24px;font-size:13px;color:#666;">
      Хариулах: <a href="mailto:${contact.email}">${contact.email}</a>
    </p>
  `;

  return await sendEmail(
    adminEmail,
    `📬 Шинэ Мессеж: ${contact.subject} — ${contact.name}`,
    baseTemplate(content),
  );
};

/* ===========================
   CONTACT FORM → USER CONFIRMATION
   Клиентэд баталгаажуулах мэйл
=========================== */
const sendContactConfirmation = async (contact) => {
  const content = `
    <h2>Баярлалаа, ${contact.name}! 🙏</h2>
    <p>Таны мессеж хүлээн авлаа. Бид удахгүй 24 цагийн дотор хариу өгнө.</p>

    <div style="background:#f0fdf4;padding:20px;border-radius:8px;border-left:4px solid #10b981;margin:20px 0;">
      <p><strong>Сэдэв:</strong> ${contact.subject}</p>
      <p><strong>Мессеж:</strong></p>
      <p style="color:#555;font-style:italic;">${contact.message.replace(/\n/g, "<br>")}</p>
    </div>

    <p>Хэрэв та нэн яаралтай бол дараах холбогдолтой байна уу:</p>
    <p>📧 <a href="mailto:${process.env.FROM_EMAIL || "info@itravelz.com"}">${process.env.FROM_EMAIL || "info@itravelz.com"}</a></p>
  `;

  return await sendEmail(
    contact.email,
    `Таны мессежийг хүлээн авлаа — ITravelz`,
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
