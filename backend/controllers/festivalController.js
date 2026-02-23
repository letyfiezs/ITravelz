const Festival = require('../models/Festival');

/* ─── Public ─────────────────────────── */
exports.getAllFestivals = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;
    const festivals = await Festival.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: festivals.length, festivals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching festivals', error: err.message });
  }
};

exports.getFestivalById = async (req, res) => {
  try {
    const festival = await Festival.findById(req.params.id);
    if (!festival) return res.status(404).json({ success: false, message: 'Festival not found' });
    res.json({ success: true, festival });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching festival', error: err.message });
  }
};

/* ─── Admin ──────────────────────────── */
exports.getAllFestivalsAdmin = async (req, res) => {
  try {
    const festivals = await Festival.find().sort({ createdAt: -1 });
    res.json({ success: true, count: festivals.length, festivals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching festivals', error: err.message });
  }
};

exports.createFestival = async (req, res) => {
  try {
    const { name, description, date, location, image, category, isActive } = req.body;
    const festival = await Festival.create({ name, description, date, location, image, category, isActive });
    res.status(201).json({ success: true, message: 'Festival created', festival });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating festival', error: err.message });
  }
};

exports.updateFestival = async (req, res) => {
  try {
    const { name, description, date, location, image, category, isActive } = req.body;
    const festival = await Festival.findByIdAndUpdate(
      req.params.id,
      { name, description, date, location, image, category, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!festival) return res.status(404).json({ success: false, message: 'Festival not found' });
    res.json({ success: true, message: 'Festival updated', festival });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating festival', error: err.message });
  }
};

exports.deleteFestival = async (req, res) => {
  try {
    const festival = await Festival.findByIdAndDelete(req.params.id);
    if (!festival) return res.status(404).json({ success: false, message: 'Festival not found' });
    res.json({ success: true, message: 'Festival deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting festival', error: err.message });
  }
};
