const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  // Default language (English)
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  images: [
    {
      type: String,
    },
  ],
  features: [
    {
      type: String,
    },
  ],
  itinerary: [
    {
      day: Number,
      title: String,
      description: String,
    },
  ],
  // Multilingual translations — flexible object stored as Mixed
  // { mn: { name, description, features, destination }, en: {...}, ... }
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ["active", "inactive", "archived"],
    default: "active",
  },
  // Available dates/times for booking
  availableDates: [
    {
      type: String, // Format: "YYYY-MM-DD"
    },
  ],
  availableTimes: [
    {
      type: String, // Format: "HH:MM" (24-hour)
    },
  ],
  bookingLimitPerSlot: {
    type: Number,
    default: 5, // Max bookings per date/time combination
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

module.exports = mongoose.model("Package", packageSchema);
