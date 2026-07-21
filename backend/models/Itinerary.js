const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    // Default language (English)
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    duration: {
      type: String,
      required: true, // e.g., "14 Days"
      trim: true
    },
    locations: {
      type: String,
      required: true, // e.g., "6 Cities"
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging'],
      default: 'moderate'
    },
    days: [
      {
        dayNumber: {
          type: String,
          required: true // e.g., "1", "4", "8-10"
        },
        title: {
          type: String,
          required: true
        }
      }
    ],
    // Multilingual translations — { mn: { title, description, duration, locations }, en: {...}, ... }
    // Flexible (Mixed) so it can hold exactly the site's supported languages
    // (mn/en/de/ko/ja/zh) without a rigid per-language sub-schema.
    translations: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);
