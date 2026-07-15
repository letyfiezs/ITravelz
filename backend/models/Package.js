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
    type: String,
    required: true,
    default: "",
  },
  category: {
    type: String,
    required: true,
  },
  // Tour subcategory — classifies the tour within the TOUR group
  subCategory: {
    type: String,
    enum: ["Classic", "Extreme", "Special", "Luxury", ""],
    default: "",
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
  // Rich detail fields — editable via admin "Add Details" panel
  highlights: [{ type: String }], // Top experiences / bullets
  packingList: [{ type: String }], // What to bring
  totalDistance: { type: String, default: "" },
  maxElevation: { type: String, default: "" },
  pricingNote: { type: String, default: "" },
  physicalLevel: { type: String, default: "" }, // e.g. "Easy / Moderate / Hard"
  bestSeason: { type: String, default: "" }, // e.g. "June – September"
  groupPricing: [
    {
      label: String, // e.g. "1-3 Person"
      price: Number, // e.g. 2190
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
