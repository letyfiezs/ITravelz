const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    default: '',
  },
  country: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    enum: ['Beach', 'Cultural', 'Adventure', 'City', 'Nature', 'Romantic', 'Family', 'Historical', 'Mountain', 'Desert'],
    default: 'Cultural',
  },
  image: {
    type: String,
    default: '',
  },
  // Up to 10 gallery images (slideshow)
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) { return v.length <= 10; },
      message: 'Maximum 10 images allowed',
    },
  },
  // Location: plain text OR Google Maps share/embed URL
  location: {
    type: String,
    trim: true,
    default: '',
  },
  // Short tagline shown on cards
  tagline: {
    type: String,
    trim: true,
    default: '',
  },
  // General description
  description: {
    type: String,
    default: '',
  },
  // Extended description for the Read More modal
  readMore: {
    type: String,
    default: '',
  },
  // Rich cultural / historical info (shown in expanded view)
  culturalInfo: {
    type: String,
    default: '',
  },
  // Bullet-point highlights
  highlights: {
    type: [String],
    default: [],
  },
  // Best time to visit
  bestTime: {
    type: String,
    default: '',
  },
  // Average daily cost info
  avgCost: {
    type: String,
    default: '',
  },
  // Multilingual translations — stored as a flexible object
  // { mn: { name, tagline, description, readMore, culturalInfo }, en: {...}, ... }
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Destination', destinationSchema);
