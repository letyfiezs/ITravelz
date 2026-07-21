const Destination = require('../models/Destination');
const path = require('path');
const { ensureFullTranslations } = require('../utils/autoTranslate');

// Helper: get public URL for an uploaded file
const getFileUrl = (file) => {
  if (!file) return '';
  if (file.path && (file.path.startsWith('http') || file.path.startsWith('//'))) return file.path; // Cloudinary
  if (file.filename) return `/uploads/${file.filename}`;
  return file.path || '';
};

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
      name, city, country, category, image, images, location, tagline,
      description, readMore, culturalInfo, highlights, bestTime, avgCost, isActive,
      translations,
    } = req.body;

    const resolvedHighlights = Array.isArray(highlights)
      ? highlights
      : (highlights ? highlights.split('\n').map(s => s.trim()).filter(Boolean) : []);

    const fullTranslations = await ensureFullTranslations(
      {
        name,
        tagline: tagline || '',
        description: description || '',
        readMore: readMore || '',
        culturalInfo: culturalInfo || '',
      },
      translations,
    );

    const dest = await Destination.create({
      name, city, country, category, image: image || '',
      images: Array.isArray(images) ? images.slice(0, 10) : [],
      location: location || '',
      tagline: tagline || '', description: description || '',
      readMore: readMore || '',
      culturalInfo: culturalInfo || '',
      highlights: resolvedHighlights,
      bestTime: bestTime || '', avgCost: avgCost || '',
      isActive: isActive !== undefined ? isActive : true,
      translations: fullTranslations,
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
      name, city, country, category, image, images, location, tagline,
      description, readMore, culturalInfo, highlights, bestTime, avgCost, isActive,
      translations,
    } = req.body;

    const update = {
      name, city, country, category, image,
      ...(Array.isArray(images) ? { images: images.slice(0, 10) } : {}),
      location,
      tagline, description, readMore, culturalInfo,
      highlights: Array.isArray(highlights) ? highlights : (highlights ? highlights.split('\n').map(s => s.trim()).filter(Boolean) : []),
      bestTime, avgCost, isActive,
      updatedAt: Date.now(),
    };

    if (translations) {
      // Admin used the manual "Auto Translate" button — trust it as-is.
      update.translations = translations;
    } else if (
      name !== undefined || tagline !== undefined || description !== undefined ||
      readMore !== undefined || culturalInfo !== undefined
    ) {
      // Translatable content changed but no translations were supplied —
      // regenerate all 6 languages from the merged (new + existing) fields.
      const existingDest = await Destination.findById(req.params.id).select(
        'name tagline description readMore culturalInfo',
      );
      if (existingDest) {
        const mergedFields = {
          name: name !== undefined ? name : existingDest.name,
          tagline: tagline !== undefined ? tagline : existingDest.tagline,
          description: description !== undefined ? description : existingDest.description,
          readMore: readMore !== undefined ? readMore : existingDest.readMore,
          culturalInfo: culturalInfo !== undefined ? culturalInfo : existingDest.culturalInfo,
        };
        update.translations = await ensureFullTranslations(mergedFields, {});
      }
    }

    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    const dest = await Destination.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true, strict: false });
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

// POST /api/admin/destinations/:id/images
exports.uploadDestinationImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No images uploaded' });
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    const newPaths = req.files.map(getFileUrl);
    const combined = [...(dest.images || []), ...newPaths].slice(0, 10);
    dest.images = combined;
    await dest.save();
    res.json({ message: 'Images uploaded', images: dest.images });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading images', error: error.message });
  }
};

// DELETE /api/admin/destinations/:id/images
exports.deleteDestinationImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    dest.images = (dest.images || []).filter(img => img !== imageUrl);
    await dest.save();
    res.json({ message: 'Image removed', images: dest.images });
  } catch (error) {
    res.status(500).json({ message: 'Error removing image', error: error.message });
  }
};
