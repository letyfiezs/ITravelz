const AboutMongolia = require('../models/AboutMongolia');

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
