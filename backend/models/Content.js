const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String },
  text: { type: String },
  image: { type: String },
  imageUrl: { type: String },
  section: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ContentSchema.index({ section: 1, isActive: 1 });

module.exports = mongoose.model('Content', ContentSchema);
