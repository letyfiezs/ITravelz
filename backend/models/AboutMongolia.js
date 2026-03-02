const mongoose = require('mongoose');

const AboutMongolaSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  readMore:    { type: String, default: '' },
  image:       { type: String, default: '' },
  images:      { type: [String], default: [], validate: [v => v.length <= 10, 'Max 10 images'] },
  category:    { type: String, enum: ['culture', 'nature', 'history', 'food', 'nomad', 'misc'], default: 'misc' },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

AboutMongolaSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('AboutMongolia', AboutMongolaSchema);
