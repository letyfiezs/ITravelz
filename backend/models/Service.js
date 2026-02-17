const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  details: { type: String },
  price: { type: Number, required: true, min: 0 },
  duration: { type: String },
  image: { type: String },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  maxCapacity: { type: Number, default: 10 },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ServiceSchema.index({ isAvailable: 1 });
ServiceSchema.index({ category: 1 });

module.exports = mongoose.model('Service', ServiceSchema);
