require("dotenv").config();
const axios = require("axios");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const response = await axios.post(
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

    console.log("✅ Email sent via Brevo API");
    return true;
  } catch (error) {
    console.error("❌ Brevo Email error:", error.response?.data || error.message);
    return false;
  }
};

const sendVerificationEmail = async (email, name, token, verificationLink) => {
  const html = `
  <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">
      
      <h1 style="color:#3b82f6;text-align:center;">✈️ Total Grand Travel</h1>

      <h2>Hello ${name},</h2>

      <p>Thank you for signing up! Please verify your email by clicking the button below:</p>

      <div style="text-align:center;margin:30px 0;">
        <a href="${verificationLink}" 
           style="background:#3b82f6;color:white;padding:12px 25px;
           text-decoration:none;border-radius:6px;font-weight:bold;">
          Verify Email
        </a>
      </div>

      <p>If the button doesn't work, copy this link:</p>
      <p style="font-size:12px;color:#3b82f6;">${verificationLink}</p>

      <hr>
      <p style="font-size:12px;color:#888;text-align:center;">
        © 2026 Total Grand Travel
      </p>
    </div>
  </div>
  `;

  return await sendEmail(
    email,
    "Email Verification - Total Grand Travel",
    html
  );
};

module.exports = {
  sendVerificationEmail,
};
