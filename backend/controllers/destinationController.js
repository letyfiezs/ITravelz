const Destination = require('../models/Destination');

/* ─── Public ─── */

// GET /api/destinations  — active only
exports.getAllDestinations = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;

    const destinations = await Destination.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: destinations.length, destinations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching destinations', error: err.message });
  }
};

// GET /api/destinations/:id
exports.getDestinationById = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
    res.json({ success: true, destination: dest });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching destination', error: err.message });
  }
};

/* ─── Admin ─── */

// GET /api/admin/destinations  — all including inactive
exports.getAllDestinationsAdmin = async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 });
    res.json({ success: true, count: destinations.length, destinations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching destinations', error: err.message });
  }
};

// POST /api/admin/destinations
exports.createDestination = async (req, res) => {
  try {
    const {
      name, city, country, category, image, tagline,
      description, culturalInfo, highlights, bestTime, avgCost, isActive,
    } = req.body;

    const dest = await Destination.create({
      name, city, country, category, image: image || '',
      tagline: tagline || '', description: description || '',
      culturalInfo: culturalInfo || '',
      highlights: Array.isArray(highlights) ? highlights : (highlights ? highlights.split('\n').map(s => s.trim()).filter(Boolean) : []),
      bestTime: bestTime || '', avgCost: avgCost || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, message: 'Destination created', destination: dest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/destinations/:id
exports.updateDestination = async (req, res) => {
  try {
    const {
      name, city, country, category, image, tagline,
      description, culturalInfo, highlights, bestTime, avgCost, isActive,
    } = req.body;

    const update = {
      name, city, country, category, image,
      tagline, description, culturalInfo,
      highlights: Array.isArray(highlights) ? highlights : (highlights ? highlights.split('\n').map(s => s.trim()).filter(Boolean) : []),
      bestTime, avgCost, isActive,
      updatedAt: Date.now(),
    };
    // Remove undefined fields
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    const dest = await Destination.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
    res.json({ success: true, message: 'Destination updated', destination: dest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/destinations/:id
exports.deleteDestination = async (req, res) => {
  try {
    const dest = await Destination.findByIdAndDelete(req.params.id);
    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
    res.json({ success: true, message: 'Destination deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
