const Content = require('../models/Content');
const mongoose = require('mongoose');

// Client: Get all active content
exports.getAllContent = async (req, res, next) => {
  try {
    const { section } = req.query;
    const filter = { isActive: true };
    if (section) {
      filter.section = section;
    }

    const content = await Content.find(filter).sort({ section: 1, order: 1 });
    res.status(200).json({
      success: true,
      count: content.length,
      content
    });
  } catch (err) {
    next(err);
  }
};

// Client: Get single content item
exports.getContent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.status(200).json({ success: true, content });
  } catch (err) {
    next(err);
  }
};

// Admin: Upsert (create or update) content
exports.upsertContent = async (req, res, next) => {
  try {
    const { key, title, text, imageUrl, section, order, isActive } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Content key is required'
      });
    }

    const content = await Content.findOneAndUpdate(
      { key },
      {
        $set: {
          key,
          title: title || '',
          text: text || '',
          image: imageUrl || '',
          imageUrl: imageUrl || '',
          section: section || '',
          order: order || 0,
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: Date.now()
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Content saved successfully',
      content
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Content key already exists'
      });
    }
    next(err);
  }
};

// Admin: Update content
exports.updateContent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    const { title, text, imageUrl, section, order, isActive } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (text !== undefined) updates.text = text;
    if (imageUrl !== undefined) {
      updates.image = imageUrl;
      updates.imageUrl = imageUrl;
    }
    if (section !== undefined) updates.section = section;
    if (order !== undefined) updates.order = order;
    if (isActive !== undefined) updates.isActive = isActive;
    updates.updatedAt = Date.now();

    const content = await Content.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      content
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete content
exports.deleteContent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Upload image
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      path: imageUrl
    });
  } catch (err) {
    next(err);
  }
};
