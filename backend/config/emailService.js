require("dotenv").config();
const axios = require("axios");

const sendEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.FROM_NAME,
          email: process.env.FROM_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
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
    console.error("❌ Brevo API Error:", error.response?.data || error.message);
    return false;
  }
};

exports.sendVerificationEmail = async (email, name, token, link) => {
  const html = `
    <h2>Hello ${name}</h2>
    <a href="${link}">Verify Email</a>
  `;
  return await sendEmail(email, "Email Verification", html);
};

exports.sendPasswordResetEmail = async (email, name, token, link) => {
  const html = `
    <h2>Password Reset</h2>
    <a href="${link}">Reset Password</a>
  `;
  return await sendEmail(email, "Password Reset", html);
};

exports.sendWelcomeEmail = async (email, name) => {
  const html = `<h2>Welcome ${name} 🎉</h2>`;
  return await sendEmail(email, "Welcome!", html);
};
