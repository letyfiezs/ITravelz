const Booking = require("../models/Booking");
const User = require("../models/User");
const Package = require("../models/Package");
const mongoose = require("mongoose");
const {
  sendBookingConfirmationEmail,
  sendBookingApprovedEmail,
  sendBookingDeclinedEmail,
} = require("../config/emailService");

// Create Booking (Client)
exports.createBooking = async (req, res) => {
  try {
    console.log('=== CREATE BOOKING REQUEST ===');
    console.log('Request body:', req.body);
    
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
    
    console.log('Received userId:', userId);
    console.log('Received email:', email);

    // Support both new and legacy field names
    const finalFullName = fullName || customerName;
    const finalEmail = email || customerEmail;
    const finalPhone = phone || customerPhone;
    const finalServiceName = serviceName || packageName;
    const finalBookingDate = bookingDate || travelDate;
    const finalBookingTime = bookingTime || "";
    const finalNotes = notes || specialRequests;

    // Validation
    if (!finalFullName || !finalEmail || !finalPhone || !finalServiceName || !finalBookingDate) {
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
            const dateStr = finalBookingDate.split('T')[0]; // Convert to YYYY-MM-DD format
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
                    status: "approved"
                  }
                },
                {
                  $group: {
                    _id: null,
                    totalPeople: { $sum: "$numberOfPeople" }
                  }
                }
              ]);

              const currentBookedPeople = totalBookedPeople.length > 0 ? totalBookedPeople[0].totalPeople : 0;
              const remainingCapacity = bookingLimit - currentBookedPeople;

              if (remainingCapacity <= 0) {
                return res.status(400).json({
                  success: false,
                  message: "This time slot is fully booked. Please select another date or time.",
                });
              }

              if ((numberOfPeople || 1) > remainingCapacity) {
                return res.status(400).json({
                  success: false,
                  message: `Only ${remainingCapacity} spot${remainingCapacity > 1 ? 's' : ''} available for this time slot.`,
                });
              }
            }
          }
        }
      } catch (validationErr) {
        console.log("Package validation error (non-critical):", validationErr.message);
        // Continue with booking even if package validation fails (backward compatibility)
      }
    }
    
    // Create booking
    const booking = new Booking({
      fullName: finalFullName,
      email: finalEmail,
      phone: finalPhone,
      userId: userId || null,
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

    console.log('Booking object before save:', {
      userId: booking.userId,
      email: booking.email,
      fullName: booking.fullName,
    });

    await booking.save();
    
    console.log('✅ Booking saved successfully with ID:', booking._id);
    console.log('Booking userId:', booking.userId);

    // Try to send confirmation email
    try {
      const bookingDetails = {
        bookingId: booking.bookingId,
        packageName: booking.serviceName,
        duration: booking.duration || "N/A",
        price: booking.price ? `$${booking.price}` : "Contact us",
        travelDate: new Date(booking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        status: booking.status,
      };

      await sendBookingConfirmationEmail(finalEmail, finalFullName, bookingDetails);
    } catch (emailErr) {
      console.log("Email send failed but booking created:", emailErr.message);
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
    console.log('=== GET USER BOOKINGS ===');
    console.log('req.userId:', req.userId);
    console.log('req.userEmail:', req.userEmail);
    
    if (!req.userId) {
      console.warn('❌ No userId in request');
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }
    
    // Query by userId first, then fall back to email
    console.log('🔍 Querying bookings for userId:', req.userId);
    const bookings = await Booking.find({
      $or: [
        { userId: req.userId },
        { email: req.userEmail }
      ]
    }).sort({ createdAt: -1 });
    
    console.log('✅ Found', bookings.length, 'bookings');
    console.log('Bookings:', bookings.map(b => ({ _id: b._id, userId: b.userId, email: b.email })));

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
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
    const { status, paymentStatus, notes } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus, notes, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
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

    // Send approval email
    try {
      const bookingDetails = {
        bookingId: booking.bookingId,
        packageName: booking.serviceName,
        duration: booking.bookingTime || "N/A",
        travelDate: new Date(booking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
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
      message: "Booking approved successfully! Approval email sent to customer.",
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
