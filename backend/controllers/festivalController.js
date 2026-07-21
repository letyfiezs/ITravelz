const Festival = require('../models/Festival');
const { ensureFullTranslations } = require('../utils/autoTranslate');

// Helper: get public URL for an uploaded file
const getFileUrl = (file) => {
  if (!file) return '';
  if (file.path && (file.path.startsWith('http') || file.path.startsWith('//'))) return file.path; // Cloudinary
  if (file.filename) return `/uploads/${file.filename}`;
  return file.path || '';
};

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
    const { name, description, date, location, image, images, category, link, isActive, translations } = req.body;

    const fullTranslations = await ensureFullTranslations(
      { name, description: description || '' },
      translations,
    );

    const festivalDoc = new Festival({
      name, description, date, location,
      image: image || '',
      images: Array.isArray(images) ? images.slice(0, 10) : [],
      category,
      link: link || '',
      isActive,
      translations: fullTranslations,
    }, { strict: false });
    const festival = await festivalDoc.save();
    res.status(201).json({ success: true, message: 'Festival created', festival });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating festival', error: err.message });
  }
};

exports.updateFestival = async (req, res) => {
  try {
    const { name, description, date, location, image, images, category, link, isActive, translations } = req.body;
    const update = {
      name, description, date, location, image, category,
      link: link || '',
      isActive,
      updatedAt: Date.now(),
    };
    if (translations !== undefined) {
      // Admin used the manual "Auto Translate" button — trust it as-is.
      update.translations = translations;
    } else if (name !== undefined || description !== undefined) {
      // Translatable content changed but no translations were supplied —
      // regenerate all 6 languages from the merged (new + existing) fields.
      const existingFest = await Festival.findById(req.params.id).select('name description');
      if (existingFest) {
        const mergedFields = {
          name: name !== undefined ? name : existingFest.name,
          description: description !== undefined ? description : existingFest.description,
        };
        update.translations = await ensureFullTranslations(mergedFields, {});
      }
    }
    if (Array.isArray(images)) update.images = images.slice(0, 10);
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
    const festival = await Festival.findByIdAndUpdate(
      req.params.id, update, { new: true, runValidators: true, strict: false }
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

// POST /api/admin/festivals/:id/images
exports.uploadFestivalImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No images uploaded' });
    const festival = await Festival.findById(req.params.id);
    if (!festival) return res.status(404).json({ message: 'Festival not found' });
    const newPaths = req.files.map(getFileUrl);
    const combined = [...(festival.images || []), ...newPaths].slice(0, 10);
    festival.images = combined;
    await festival.save();
    res.json({ message: 'Images uploaded', images: festival.images });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading images', error: error.message });
  }
};

// DELETE /api/admin/festivals/:id/images
exports.deleteFestivalImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const festival = await Festival.findById(req.params.id);
    if (!festival) return res.status(404).json({ message: 'Festival not found' });
    festival.images = (festival.images || []).filter(img => img !== imageUrl);
    await festival.save();
    res.json({ message: 'Image removed', images: festival.images });
  } catch (error) {
    res.status(500).json({ message: 'Error removing image', error: error.message });
  }
};
