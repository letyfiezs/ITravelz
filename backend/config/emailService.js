require("dotenv").config();
const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service error:", error.message);
    console.error("Make sure your .env has correct SMTP credentials:");
    console.error("- SMTP_HOST:", process.env.SMTP_HOST);
    console.error("- SMTP_PORT:", process.env.SMTP_PORT);
    console.error("- SMTP_USER:", process.env.SMTP_USER);
    console.error(
      "For Gmail: Enable 2FA and use App Password (not your regular password)",
    );
  } else {
    console.log("✅ Email service is ready and connected");
  }
});

// Send verification email
const sendVerificationEmail = async (
  email,
  name,
  verificationToken,
  verificationLink,
) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: "Email Verification - Total Grand Travel",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">
              <i>✈️ Total Grand Travel</i>
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Your Gateway to Amazing Adventures</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome to Total Grand Travel, ${name}!</h2>
            
            <p>Thank you for signing up! To complete your registration and access your account, please verify your email address by clicking the button below:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #3b82f6;">
              ${verificationLink}
            </p>

            <p style="color: #6b7280; margin-bottom: 0;">This verification link will expire in 24 hours.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              © 2026 TravelHub. All rights reserved.<br>
              If you did not create this account, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to ${email}`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending verification email to ${email}`);
    console.error(`Error: ${error.message}`);
    if (error.message.includes("Gmail")) {
      console.error(
        "💡 Gmail Tip: Use App Password (not regular password): https://myaccount.google.com/apppasswords",
      );
    }
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetToken, resetLink) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: "Password Reset Request - TravelHub",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">
              <i>✈️ TravelHub</i>
            </h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            
            <p>Hi ${name},</p>
            <p>We received a request to reset the password for your TravelHub account. Click the button below to reset your password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link:</p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #f59e0b;">
              ${resetLink}
            </p>

            <p style="color: #ef4444; font-weight: bold;">⚠️ This link will expire in 30 minutes.</p>
            <p style="color: #6b7280;">If you did not request a password reset, please ignore this email or contact support immediately.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              © 2026 TravelHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to ${email}`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending password reset email to ${email}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (
  customerEmail,
  customerName,
  bookingDetails,
) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: customerEmail,
    subject: `Booking Confirmation - ${bookingDetails.packageName} - TravelHub`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">
              <i>✈️ TravelHub</i>
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Your Gateway to Amazing Adventures</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; margin-top: 0;">🎉 Booking Confirmed!</h2>
            
            <p>Hi ${customerName},</p>
            <p>Your booking has been confirmed! We're excited to help you plan your next adventure. Here are your booking details:</p>

            <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #1f2937; margin-top: 0;">Booking Details</h3>
              <table style="width: 100%; color: #1f2937;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                  <td style="text-align: right; color: #3b82f6;">${bookingDetails.bookingId}</td>
                </tr>
                <tr style="border-top: 1px solid #d1fae5;">
                  <td style="padding: 8px 0; font-weight: bold;">Package:</td>
                  <td style="text-align: right;">${bookingDetails.packageName}</td>
                </tr>
                <tr style="border-top: 1px solid #d1fae5;">
                  <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
                  <td style="text-align: right;">${bookingDetails.duration}</td>
                </tr>
                <tr style="border-top: 1px solid #d1fae5;">
                  <td style="padding: 8px 0; font-weight: bold;">Price:</td>
                  <td style="text-align: right; color: #10b981; font-size: 18px; font-weight: bold;">${bookingDetails.price}</td>
                </tr>
                <tr style="border-top: 1px solid #d1fae5;">
                  <td style="padding: 8px 0; font-weight: bold;">Travel Date:</td>
                  <td style="text-align: right;">${bookingDetails.travelDate}</td>
                </tr>
                <tr style="border-top: 1px solid #d4ce28;">
                  <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                  <td style="text-align: right;">
                    <span style="background: #d4ce28; color: #b0950e; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Pending</span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>📝 Next Steps:</strong> Our team will contact you shortly with further details about your trip. Please check your email regularly.
              </p>
            </div>

            <p style="color: #6b7280;">If you have any questions about your booking, please don't hesitate to contact us at support@travelhub.com</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              © 2026 TravelHub. All rights reserved.<br>
              <a href="https://travelhub.com/my-bookings" style="color: #3b82f6; text-decoration: none;">View Your Bookings</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to ${customerEmail}`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error sending booking confirmation email to ${customerEmail}`,
    );
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: "Welcome to TravelHub!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">
              <i>✈️ TravelHub</i>
            </h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome to TravelHub, ${name}! 🌍</h2>
            
            <p>Your account has been successfully created and verified. You now have full access to all our travel packages and services.</p>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0;"><strong>🎯 What You Can Do Now:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Browse our exclusive travel packages</li>
                <li>Book your dream vacation</li>
                <li>Manage your bookings and itineraries</li>
                <li>Track your trip status in real-time</li>
              </ul>
            </div>

            <p style="color: #6b7280;">Happy travels!<br>The TravelHub Team</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              © 2026 TravelHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${email}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// Send booking approved email
const sendBookingApprovedEmail = async (
  customerEmail,
  customerName,
  bookingDetails,
) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: customerEmail,
    subject: `Booking Approved - ${bookingDetails.packageName} - TravelHub`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">
              <i>✈️ TravelHub</i>
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Your Gateway to Amazing Adventures</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; margin-top: 0;">✅ Your Booking Has Been Approved!</h2>
            
            <p>Hi ${customerName},</p>
            <p>Great news! Your booking has been reviewed and approved by our team. Get ready for an amazing adventure!</p>

            <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #1f2937; margin-top: 0;">Approved Booking Details</h3>
              <table style="width: 100%; color: #1f2937;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                  <td style="text-align: right; color: #3b82f6;">${bookingDetails.bookingId}</td>
                </tr>
                <tr style="border-top: 1px solid #d1fae5;">
                  <td style="padding: 8px 0; font-weight: bold;">Package:</td>
                  <td style="text-align: right;">${bookingDetails.packageName}</td>
                </tr>
                <tr style="border-top: 1px solid #d1fae5;">
                  <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
                  <td style="text-align: right;">${bookingDetails.duration}</td>
                </tr>
                <tr style="border-top: 1px solid #d1fae5;">
                  <td style="padding: 8px 0; font-weight: bold;">Travel Date:</td>
                  <td style="text-align: right;">${bookingDetails.travelDate}</td>
                </tr>
                <tr style="border-top: 1px solid #d1fae5;">
                  <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                  <td style="text-align: right;">
                    <span style="background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-weight: bold;">✅ Approved</span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af;">
                <strong>📋 Next Steps:</strong> Our team will contact you shortly with final itinerary details and payment information. Please check your email regularly.
              </p>
            </div>

            <p style="color: #6b7280;">If you have any questions about your approved booking, please contact us at support@travelhub.com</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              © 2026 TravelHub. All rights reserved.<br>
              <a href="https://travelhub.com/my-bookings" style="color: #3b82f6; text-decoration: none;">View Your Bookings</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Booking approved email sent to ${customerEmail}`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending booking approved email to ${customerEmail}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// Send booking declined email
const sendBookingDeclinedEmail = async (
  customerEmail,
  customerName,
  bookingDetails,
) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: customerEmail,
    subject: `Booking Update - ${bookingDetails.packageName} - TravelHub`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">
              <i>✈️ TravelHub</i>
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Your Gateway to Amazing Adventures</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #ef4444;">
            <h2 style="color: #1f2937; margin-top: 0;">📌 Booking Status Update</h2>
            
            <p>Hi ${customerName},</p>
            <p>Thank you for your interest in booking with us. Unfortunately, your booking request has been declined. This could be due to various reasons such as availability or scheduling conflicts.</p>

            <div style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #1f2937; margin-top: 0;">Booking Details</h3>
              <table style="width: 100%; color: #1f2937;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                  <td style="text-align: right; color: #3b82f6;">${bookingDetails.bookingId}</td>
                </tr>
                <tr style="border-top: 1px solid #fee2e2;">
                  <td style="padding: 8px 0; font-weight: bold;">Package:</td>
                  <td style="text-align: right;">${bookingDetails.packageName}</td>
                </tr>
                <tr style="border-top: 1px solid #fee2e2;">
                  <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                  <td style="text-align: right;">
                    <span style="background: #fee2e2; color: #7f1d1d; padding: 4px 8px; border-radius: 4px; font-weight: bold;">❌ Declined</span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af;">
                <strong>💡 What's Next?</strong> Feel free to explore other packages or contact us at support@travelhub.com to discuss alternative options. We'd love to help you find the perfect trip!
              </p>
            </div>

            <p style="color: #6b7280;">We appreciate your understanding and hope to work with you on a future booking.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              © 2026 TravelHub. All rights reserved.<br>
              <a href="https://travelhub.com/packages" style="color: #3b82f6; text-decoration: none;">Browse Other Packages</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Booking declined email sent to ${customerEmail}`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending booking declined email to ${customerEmail}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// Send contact form notification to admin
const sendContactNotification = async (contact) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'tiirenbogd0505@gmail.com';
  const inquiryTypeLabel = {
    question: '❓ Question',
    feedback: '💬 Feedback',
    help: '🆘 Help Request'
  };

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: adminEmail,
    subject: `[${inquiryTypeLabel[contact.inquiryType] || 'Inquiry'}] New Contact: ${contact.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">
              <i>✈️ TravelHub</i>
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">New Contact Form Submission</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h2 style="color: #1f2937; margin-top: 0;">New ${inquiryTypeLabel[contact.inquiryType] || 'Inquiry'}</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 10px 0;"><strong>From:</strong> ${contact.name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
              <p style="margin: 10px 0;"><strong>Type:</strong> ${inquiryTypeLabel[contact.inquiryType] || contact.inquiryType}</p>
              <p style="margin: 10px 0;"><strong>Subject:</strong> ${contact.subject}</p>
              <p style="margin: 10px 0;"><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
            </div>

            <h3 style="color: #1f2937;">Message:</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; white-space: pre-wrap; word-break: break-word;">
              ${contact.message}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.ADMIN_URL || '/admin'}/contacts/${contact._id}" style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View & Respond in Admin Panel
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              © 2026 TravelHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Contact notification sent to admin (${adminEmail})`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending contact notification to admin`);
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

// Send confirmation email to user who submitted contact
const sendContactConfirmation = async (contact) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: contact.email,
    subject: 'We Received Your Message - TravelHub',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">
              <i>✈️ TravelHub</i>
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">We've Got Your Message</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; margin-top: 0;">Thank You for Contacting Us, ${contact.name}!</h2>
            
            <p>We have successfully received your ${contact.inquiryType === 'question' ? 'question' : contact.inquiryType === 'feedback' ? 'feedback' : 'help request'} with the subject:</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>"${contact.subject}"</strong>
            </div>

            <p>Our team will review your message and get back to you as soon as possible. We appreciate your patience and look forward to assisting you.</p>

            <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 14px; color: #166534;">
                <strong>Reference ID:</strong> ${contact._id.toString().substring(0, 12).toUpperCase()}
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              <strong>Need Immediate Assistance?</strong> You can also reach us at:<br>
              Email: <a href="mailto:support@travelhub.com">support@travelhub.com</a><br>
              Phone: +1 (555) 123-4567
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              © 2026 TravelHub. All rights reserved.<br>
              If you did not submit this form, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Contact confirmation email sent to ${contact.email}`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending contact confirmation to ${contact.email}`);
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

// Send response email to user
const sendContactResponse = async (contact, response) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: contact.email,
    subject: `Re: ${contact.subject} - TravelHub Response`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">
              <i>✈️ TravelHub</i>
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Response to Your Message</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${contact.name},</h2>
            
            <p>Thank you for reaching out to us. We've reviewed your ${contact.inquiryType} and here is our response:</p>

            <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; white-space: pre-wrap; word-break: break-word; color: #1f2937;">
                ${response}
              </p>
            </div>

            <p style="color: #6b7280;">
              If you have any further questions or need additional assistance, please don't hesitate to contact us.
            </p>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
                <strong>Reference ID:</strong> ${contact._id.toString().substring(0, 12).toUpperCase()}
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              © 2026 TravelHub. All rights reserved.<br>
              Best regards,<br>
              The TravelHub Team
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Contact response email sent to ${contact.email}`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending contact response to ${contact.email}`);
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendWelcomeEmail,
  sendBookingApprovedEmail,
  sendBookingDeclinedEmail,
  sendContactNotification,
  sendContactConfirmation,
  sendContactResponse,
}
