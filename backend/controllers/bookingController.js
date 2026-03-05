const Booking = require("../models/Booking");
const User = require("../models/User");
const Package = require("../models/Package");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("[WARN] STRIPE_SECRET_KEY not set — payment endpoints will return 503.");
}
const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY)
  : null;

const {
  sendBookingConfirmationEmail,
  sendBookingApprovedEmail,
  sendPaymentSuccessEmail,
  sendBookingDeclinedEmail,
} = require("../config/emailService");

// ─── Stripe: Create Checkout Session ─────────────────────────────────────────
exports.createCheckoutSession = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ success: false, message: "Payment service is not configured." });
  }
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required" });
    }
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.status !== "approved") {
      return res.status(400).json({ success: false, message: "Booking has not been approved yet." });
    }
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "This booking has already been paid." });
    }

    const raw = booking.totalPrice || booking.price * booking.numberOfPeople || booking.price || 0;
    const amountInCents = Math.max(Math.round(raw * 100), 50);
    const frontendUrl = process.env.FRONTEND_URL || "https://itravelmongolia.com";
    const travelDate = new Date(booking.bookingDate).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: booking.email,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `✈️ ${booking.serviceName}`,
            description: `Захиалга #${booking.bookingId} · ${travelDate} · ${booking.numberOfPeople} хүн`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      mode: "payment",
      metadata: { bookingId: booking.bookingId },
      success_url: `${frontendUrl}/payment/success?bookingId=${booking.bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment?bookingId=${booking.bookingId}`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("createCheckoutSession error:", error);
    res.status(500).json({ success: false, message: "Failed to create checkout session.", error: error.message });
  }
};

// ─── Stripe: Verify Checkout Session ─────────────────────────────────────────
exports.verifyCheckout = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ success: false, message: "Payment service is not configured." });
  }
  try {
    const { bookingId, sessionId } = req.body;
    if (!bookingId || !sessionId) {
      return res.status(400).json({ success: false, message: "bookingId and sessionId are required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Stripe payment was not successful." });
    }
    if (session.metadata?.bookingId !== bookingId) {
      return res.status(403).json({ success: false, message: "Session does not match this booking." });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }
    if (booking.paymentStatus === "paid") {
      return res.status(200).json({ success: true, alreadyPaid: true, data: booking });
    }

    booking.paymentStatus = "paid";
    booking.paymentMethod = "stripe";
    booking.transactionId = session.payment_intent || sessionId;
    booking.updatedAt = Date.now();
    await booking.save();

    try {
      const bookingDetails = {
        bookingId: booking.bookingId,
        packageName: booking.serviceName,
        travelDate: new Date(booking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        }),
        bookingTime: booking.bookingTime || "",
        numberOfPeople: booking.numberOfPeople,
        duration: booking.duration || "N/A",
        totalPrice: booking.totalPrice || booking.price,
      };
      await sendPaymentSuccessEmail(booking.email, booking.fullName, bookingDetails);
      console.log("✅ Stripe payment confirmed — email sent for", bookingId);
    } catch (emailErr) {
      console.error("Email error (payment confirmed):", emailErr.message);
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("verifyCheckout error:", error);
    res.status(500).json({ success: false, message: "Verification failed.", error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    // Try to extract the authenticated userId from the Bearer token if present
    let authenticatedUserId = null;
    let authenticatedUserEmail = null;
    try {
      const auth = req.headers.authorization;
      if (auth && auth.startsWith("Bearer ")) {
        const decoded = jwt.verify(
          auth.split(" ")[1],
          process.env.JWT_SECRET || "secret-key-change-in-production",
        );
        authenticatedUserId = decoded.id;
        const authUser = await User.findById(decoded.id).select("email name");
        if (authUser) authenticatedUserEmail = authUser.email;
      }
    } catch (_) {
      /* token invalid or absent – continue as guest */
    }

    const {
      fullName,
      email,
      phone,
      serviceName,
      bookingDate,
      bookingTime,
      numberOfPeople,
      notes,
      packageId,
      packageName,
      customerName,
      customerEmail,
      customerPhone,
      travelDate,
      duration,
      price,
      specialRequests,
      userId,
    } = req.body;

    // Support both new and legacy field names
    const finalFullName = fullName || customerName;
    const finalEmail = email || customerEmail || authenticatedUserEmail;
    const finalPhone = phone || customerPhone;
    const finalServiceName = serviceName || packageName;
    const finalBookingDate = bookingDate || travelDate;
    const finalBookingTime = bookingTime || "";
    const finalNotes = notes || specialRequests;
    // Use token-authenticated userId over body-supplied (more secure)
    const finalUserId = authenticatedUserId || userId || null;

    // Validation
    if (
      !finalFullName ||
      !finalEmail ||
      !finalPhone ||
      !finalServiceName ||
      !finalBookingDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking fields",
      });
    }

    // Validate selected date/time against available slots (if packageName is provided)
    if (finalServiceName) {
      try {
        const pkg = await Package.findOne({ name: finalServiceName });
        if (pkg && pkg.availableDates && pkg.availableTimes) {
          // Check if date is available
          if (pkg.availableDates.length > 0) {
            const dateStr = finalBookingDate.split("T")[0]; // Convert to YYYY-MM-DD format
            if (!pkg.availableDates.includes(dateStr)) {
              return res.status(400).json({
                success: false,
                message: "Selected date is not available for this package",
              });
            }

            // Check if time is available
            if (pkg.availableTimes.length > 0 && finalBookingTime) {
              if (!pkg.availableTimes.includes(finalBookingTime)) {
                return res.status(400).json({
                  success: false,
                  message: "Selected time is not available for this package",
                });
              }

              // Check booking capacity for this slot by total people
              const bookingLimit = pkg.bookingLimitPerSlot || 5;
              const totalBookedPeople = await Booking.aggregate([
                {
                  $match: {
                    serviceName: finalServiceName,
                    bookingDate: new Date(dateStr),
                    bookingTime: finalBookingTime,
                    status: "approved",
                  },
                },
                {
                  $group: {
                    _id: null,
                    totalPeople: { $sum: "$numberOfPeople" },
                  },
                },
              ]);

              const currentBookedPeople =
                totalBookedPeople.length > 0
                  ? totalBookedPeople[0].totalPeople
                  : 0;
              const remainingCapacity = bookingLimit - currentBookedPeople;

              if (remainingCapacity <= 0) {
                return res.status(400).json({
                  success: false,
                  message:
                    "This time slot is fully booked. Please select another date or time.",
                });
              }

              if ((numberOfPeople || 1) > remainingCapacity) {
                return res.status(400).json({
                  success: false,
                  message: `Only ${remainingCapacity} spot${remainingCapacity > 1 ? "s" : ""} available for this time slot.`,
                });
              }
            }
          }
        }
      } catch (validationErr) {
        console.log(
          "Package validation error (non-critical):",
          validationErr.message,
        );
        // Continue with booking even if package validation fails (backward compatibility)
      }
    }

    // Create booking
    const booking = new Booking({
      fullName: finalFullName,
      email: finalEmail,
      phone: finalPhone,
      userId: finalUserId,
      serviceName: finalServiceName,
      duration: duration || "N/A",
      price: price || 0,
      bookingDate: new Date(finalBookingDate),
      bookingTime: finalBookingTime,
      numberOfPeople: numberOfPeople || 1,
      notes: finalNotes || "",
      status: "pending",
      totalPrice: price ? price * (numberOfPeople || 1) : 0,
    });

    await booking.save();
    console.log(
      "✅ Booking saved. userId:",
      booking.userId,
      "email:",
      booking.email,
    );

    // Send booking confirmation email to customer
    if (booking.email) {
      try {
        await sendBookingConfirmationEmail(booking.email, booking.fullName, {
          bookingId: booking.bookingId,
          packageName: booking.serviceName,
          duration: booking.duration,
          travelDate: booking.bookingDate
            ? booking.bookingDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : finalBookingDate,
        });
        console.log("✅ Confirmation email sent to", booking.email);
      } catch (emailErr) {
        console.error(
          "Confirmation email error (non-critical):",
          emailErr.message,
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      data: {
        bookingId: booking.bookingId,
        serviceName: booking.serviceName,
        fullName: booking.fullName,
        status: booking.status,
        bookingDate: booking.bookingDate,
      },
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// Get All Bookings for Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    let query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      total: bookings.length,
      data: bookings,
      bookings: bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// Get User Bookings
exports.getUserBookings = async (req, res) => {
  try {
    if (!req.userId) {
      return res
        .status(401)
        .json({ success: false, message: "User ID not found" });
    }

    // Build query: match by userId (ObjectId) OR by email
    const orConditions = [];
    try {
      orConditions.push({ userId: new mongoose.Types.ObjectId(req.userId) });
    } catch (_) {}
    if (req.userEmail) orConditions.push({ email: req.userEmail });

    const bookings = await Booking.find(
      orConditions.length > 1 ? { $or: orConditions } : orConditions[0] || {},
    ).sort({ createdAt: -1 });

    console.log(
      `✅ getUserBookings: userId=${req.userId} email=${req.userEmail} → found ${bookings.length}`,
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
      bookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your bookings",
      error: error.message,
    });
  }
};

// Get Single Booking
exports.getBookingById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
      booking: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// Update Booking
exports.updateBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }
    const { status, paymentStatus, paymentMethod, transactionId, notes } =
      req.body;

    // Get the old booking first so we can compare status
    const oldBooking = await Booking.findById(req.params.id);
    if (!oldBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const updateObj = { updatedAt: Date.now() };
    if (typeof status !== "undefined") updateObj.status = status;
    if (typeof paymentStatus !== "undefined")
      updateObj.paymentStatus = paymentStatus;
    if (typeof paymentMethod !== "undefined")
      updateObj.paymentMethod = paymentMethod;
    if (typeof transactionId !== "undefined")
      updateObj.transactionId = transactionId;
    if (typeof notes !== "undefined") updateObj.notes = notes;

    const booking = await Booking.findByIdAndUpdate(req.params.id, updateObj, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Send email notification if status changed
    if (status && status !== oldBooking.status) {
      try {
        const bookingDetails = {
          bookingId: booking.bookingId,
          packageName: booking.serviceName,
          duration: booking.duration || "N/A",
          travelDate: new Date(booking.bookingDate).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "long", day: "numeric" },
          ),
          bookingTime: booking.bookingTime || "",
          numberOfPeople: booking.numberOfPeople,
        };

        if (status === "approved") {
          await sendBookingApprovedEmail(
            booking.email,
            booking.fullName,
            bookingDetails,
          );
          console.log("✅ Approval email sent to", booking.email);
        } else if (status === "cancelled" || status === "declined") {
          await sendBookingDeclinedEmail(
            booking.email,
            booking.fullName,
            bookingDetails,
          );
          console.log("✅ Decline email sent to", booking.email);
        } else if (status === "completed") {
          // Reuse confirmation email template as a "trip completed" notification
          await sendBookingConfirmationEmail(booking.email, booking.fullName, {
            ...bookingDetails,
            status: "completed",
          });
          console.log("✅ Completion email sent to", booking.email);
        }
      } catch (emailErr) {
        console.log("Email send failed but booking updated:", emailErr.message);
      }
    }

    // If paymentStatus changed to 'paid', send final confirmation
    try {
      if (
        typeof paymentStatus !== "undefined" &&
        paymentStatus !== oldBooking.paymentStatus &&
        booking.paymentStatus === "paid"
      ) {
        const bookingDetails = {
          bookingId: booking.bookingId,
          packageName: booking.serviceName,
          duration: booking.duration || "N/A",
          travelDate: new Date(booking.bookingDate).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "long", day: "numeric" },
          ),
          bookingTime: booking.bookingTime || "",
          numberOfPeople: booking.numberOfPeople,
          status: booking.status,
        };

        await sendPaymentSuccessEmail(
          booking.email,
          booking.fullName,
          bookingDetails,
        );
        console.log(
          "✅ Payment successful — final confirmation email sent to",
          booking.email,
        );
      }
    } catch (emailErr) {
      console.log("Email send failed after payment update:", emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
      booking: booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message,
    });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled", updatedAt: Date.now() },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// Delete Booking
exports.deleteBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message,
    });
  }
};

// Approve Booking (Admin)
exports.approveBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "approved", updatedAt: Date.now() },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Send approval email with payment link
    try {
      const bookingDetails = {
        bookingId: booking.bookingId,
        packageName: booking.serviceName,
        travelDate: new Date(booking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        bookingTime: booking.bookingTime || "",
        numberOfPeople: booking.numberOfPeople,
        duration: booking.duration || "N/A",
        totalPrice: booking.totalPrice,
        price: booking.price,
      };
      await sendBookingApprovedEmail(
        booking.email,
        booking.fullName,
        bookingDetails,
      );
    } catch (emailErr) {
      console.log("Email send failed but booking approved:", emailErr.message);
    }

    res.status(200).json({
      success: true,
      message:
        "Booking approved successfully! Approval email sent to customer.",
      data: booking,
      booking: booking,
    });
  } catch (error) {
    console.error("Approve booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error approving booking",
      error: error.message,
    });
  }
};

// Get Booking by human-readable bookingId (public — for payment page)
exports.getBookingByRef = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    // Return safe public fields only
    res.status(200).json({
      success: true,
      data: {
        _id: booking._id,
        bookingId: booking.bookingId,
        fullName: booking.fullName,
        email: booking.email,
        serviceName: booking.serviceName,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        numberOfPeople: booking.numberOfPeople,
        duration: booking.duration,
        price: booking.price,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error("getBookingByRef error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// Decline Booking (Admin)
exports.declineBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled", updatedAt: Date.now() },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Send decline email
    try {
      const bookingDetails = {
        bookingId: booking.bookingId,
        packageName: booking.serviceName,
      };

      await sendBookingDeclinedEmail(
        booking.email,
        booking.fullName,
        bookingDetails,
      );
    } catch (emailErr) {
      console.log("Email send failed but booking declined:", emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Booking declined successfully! Decline email sent to customer.",
      data: booking,
      booking: booking,
    });
  } catch (error) {
    console.error("Decline booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error declining booking",
      error: error.message,
    });
  }
};
