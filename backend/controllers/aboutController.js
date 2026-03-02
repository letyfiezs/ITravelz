const AboutMongolia = require('../models/AboutMongolia');
const cloudinary = require('cloudinary').v2;

/* helper: prefer Cloudinary URL from multer-storage-cloudinary, else file path */
const getFileUrl = (file) => {
  if (!file) return null;
  if (file.path && file.path.startsWith('http')) return file.path;
  if (file.secure_url) return file.secure_url;
  if (file.url) return file.url;
  return file.path || null;
};

/* ─── Public ─────────────────────────── */
exports.getAllAbout = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;
    const items = await AboutMongolia.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching about content', error: err.message });
  }
};

exports.getAboutById = async (req, res) => {
  try {
    const item = await AboutMongolia.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching item', error: err.message });
  }
};

/* ─── Admin ──────────────────────────── */
exports.getAllAboutAdmin = async (req, res) => {
  try {
    const items = await AboutMongolia.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching about content', error: err.message });
  }
};

exports.createAbout = async (req, res) => {
  try {
    const { title, description, readMore, image, category, order, isActive } = req.body;
    const item = await AboutMongolia.create({ title, description, readMore: readMore || '', image, category, order, isActive });
    res.status(201).json({ success: true, message: 'Item created', item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating item', error: err.message });
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const { title, description, readMore, image, category, order, isActive } = req.body;
    const item = await AboutMongolia.findByIdAndUpdate(
      req.params.id,
      { title, description, readMore: readMore || '', image, category, order, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item updated', item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating item', error: err.message });
  }
};

exports.deleteAbout = async (req, res) => {
  try {
    const item = await AboutMongolia.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting item', error: err.message });
  }
};

exports.uploadAboutImages = async (req, res) => {
  try {
    const item = await AboutMongolia.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    const newUrls = req.files.map(getFileUrl).filter(Boolean);
    const merged = [...(item.images || []), ...newUrls].slice(0, 10);
    item.images = merged;
    item.updatedAt = Date.now();
    await item.save();
    res.json({ success: true, message: 'Images uploaded', item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error uploading images', error: err.message });
  }
};

exports.deleteAboutImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const item = await AboutMongolia.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.images = (item.images || []).filter(u => u !== imageUrl);
    item.updatedAt = Date.now();
    await item.save();
    // Delete from Cloudinary if applicable
    if (imageUrl && imageUrl.includes('cloudinary')) {
      const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
      try { await cloudinary.uploader.destroy(publicId); } catch (_) {}
    }
    res.json({ success: true, message: 'Image removed', item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting image', error: err.message });
  }
};

  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;
    const items = await AboutMongolia.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching about content', error: err.message });
  }
};

exports.getAboutById = async (req, res) => {
  try {
    const item = await AboutMongolia.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching item', error: err.message });
  }
};

/* ─── Admin ──────────────────────────── */
exports.getAllAboutAdmin = async (req, res) => {
  try {
    const items = await AboutMongolia.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching about content', error: err.message });
  }
};

exports.createAbout = async (req, res) => {
  try {
    const { title, description, image, category, order, isActive } = req.body;
    const item = await AboutMongolia.create({ title, description, image, category, order, isActive });
    res.status(201).json({ success: true, message: 'Item created', item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating item', error: err.message });
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const { title, description, image, category, order, isActive } = req.body;
    const item = await AboutMongolia.findByIdAndUpdate(
      req.params.id,
      { title, description, image, category, order, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item updated', item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating item', error: err.message });
  }
};

exports.deleteAbout = async (req, res) => {
  try {
    const item = await AboutMongolia.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting item', error: err.message });
  }
};
