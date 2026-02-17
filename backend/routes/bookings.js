const express = require("express");
const {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  deleteBooking,
  approveBooking,
  declineBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public route for creating bookings
router.post("/", createBooking);

// Admin routes - specific routes BEFORE generic /:id
router.get("/", protect, getAllBookings);
router.patch("/:id/approve", protect, approveBooking);
router.patch("/:id/decline", protect, declineBooking);

// Protected routes - generic /:id route AFTER specific routes
router.get("/my-bookings", protect, getUserBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.patch("/:id/cancel", protect, cancelBooking);
router.delete("/:id", protect, deleteBooking);

module.exports = router;
