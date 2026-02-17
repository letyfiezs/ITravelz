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
  // Multilingual translations
  translations: {
    en: {
      name: String,
      description: String,
      duration: String,
      destination: String,
      category: String,
      features: [String],
      itinerary: [
        {
          day: Number,
          title: String,
          description: String,
        },
      ],
    },
    es: {
      name: String,
      description: String,
      duration: String,
      destination: String,
      category: String,
      features: [String],
      itinerary: [
        {
          day: Number,
          title: String,
          description: String,
        },
      ],
    },
    fr: {
      name: String,
      description: String,
      duration: String,
      destination: String,
      category: String,
      features: [String],
      itinerary: [
        {
          day: Number,
          title: String,
          description: String,
        },
      ],
    },
    ja: {
      name: String,
      description: String,
      duration: String,
      destination: String,
      category: String,
      features: [String],
      itinerary: [
        {
          day: Number,
          title: String,
          description: String,
        },
      ],
    },
    zh: {
      name: String,
      description: String,
      duration: String,
      destination: String,
      category: String,
      features: [String],
      itinerary: [
        {
          day: Number,
          title: String,
          description: String,
        },
      ],
    },
    ar: {
      name: String,
      description: String,
      duration: String,
      destination: String,
      category: String,
      features: [String],
      itinerary: [
        {
          day: Number,
          title: String,
          description: String,
        },
      ],
    },
    nl: {
      name: String,
      description: String,
      duration: String,
      destination: String,
      category: String,
      features: [String],
      itinerary: [
        {
          day: Number,
          title: String,
          description: String,
        },
      ],
    },
    mn: {
      name: String,
      description: String,
      duration: String,
      destination: String,
      category: String,
      features: [String],
      itinerary: [
        {
          day: Number,
          title: String,
          description: String,
        },
      ],
    },
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
