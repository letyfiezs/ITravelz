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
    // Multilingual translations
    translations: {
      en: {
        title: String,
        description: String,
        duration: String,
        locations: String,
        days: [
          {
            dayNumber: String,
            title: String
          }
        ]
      },
      es: {
        title: String,
        description: String,
        duration: String,
        locations: String,
        days: [
          {
            dayNumber: String,
            title: String
          }
        ]
      },
      fr: {
        title: String,
        description: String,
        duration: String,
        locations: String,
        days: [
          {
            dayNumber: String,
            title: String
          }
        ]
      },
      ja: {
        title: String,
        description: String,
        duration: String,
        locations: String,
        days: [
          {
            dayNumber: String,
            title: String
          }
        ]
      },
      zh: {
        title: String,
        description: String,
        duration: String,
        locations: String,
        days: [
          {
            dayNumber: String,
            title: String
          }
        ]
      },
      ar: {
        title: String,
        description: String,
        duration: String,
        locations: String,
        days: [
          {
            dayNumber: String,
            title: String
          }
        ]
      },
      nl: {
        title: String,
        description: String,
        duration: String,
        locations: String,
        days: [
          {
            dayNumber: String,
            title: String
          }
        ]
      },
      mn: {
        title: String,
        description: String,
        duration: String,
        locations: String,
        days: [
          {
            dayNumber: String,
            title: String
          }
        ]
      }
    },
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
