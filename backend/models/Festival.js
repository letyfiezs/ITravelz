const mongoose = require('mongoose');

const FestivalSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  date:        { type: String, default: '' },   // e.g. "July 11–13"
  location:    { type: String, default: '' },
  image:       { type: String, default: '' },
  category:    { type: String, default: '' },   // e.g. "Traditional", "Music"
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

FestivalSchema.index({ isActive: 1 });

module.exports = mongoose.model('Festival', FestivalSchema);
