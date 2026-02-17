const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    sparse: true,
    default: null,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  phone: {
    type: String,
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
  },
  serviceName: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    default: "N/A",
  },
  price: {
    type: Number,
    default: 0,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  bookingTime: {
    type: String,
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  notes: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "cancelled", "completed"],
    default: "pending",
  },
  totalPrice: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.index({ email: 1, status: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ bookingDate: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

// Generate unique booking ID before save
bookingSchema.pre("save", async function (next) {
  try {
    if (!this.bookingId) {
      const count = await mongoose.model("Booking").countDocuments();
      this.bookingId = `BK${Date.now()}${count}`;
    }
    this.updatedAt = Date.now();
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
