const Itinerary = require('../models/Itinerary');
const mongoose = require('mongoose');

// Get all itineraries (public - only active ones)
exports.getAllItineraries = async (req, res, next) => {
  try {
    const itineraries = await Itinerary.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({
      success: true,
      count: itineraries.length,
      itineraries
    });
  } catch (err) {
    next(err);
  }
};

// Get single itinerary
exports.getItinerary = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid itinerary ID' });
    }
    
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    res.status(200).json({ success: true, itinerary });
  } catch (err) {
    next(err);
  }
};

// Create itinerary (admin)
exports.createItinerary = async (req, res, next) => {
  try {
    const { title, description, duration, locations, difficulty, days, order, translations } = req.body;

    if (!title || !description || !duration || !locations) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const itinerary = await Itinerary.create({
      title,
      description,
      duration,
      locations,
      difficulty: difficulty || 'moderate',
      days: days || [],
      order: order || 0,
      translations: translations || {
        en: { title, description, duration, locations, days: days || [] },
        es: { title, description, duration, locations, days: days || [] },
        fr: { title, description, duration, locations, days: days || [] },
        ja: { title, description, duration, locations, days: days || [] },
        zh: { title, description, duration, locations, days: days || [] },
        ar: { title, description, duration, locations, days: days || [] },
        nl: { title, description, duration, locations, days: days || [] },
        mn: { title, description, duration, locations, days: days || [] }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Itinerary created successfully',
      itinerary
    });
  } catch (err) {
    next(err);
  }
};

// Update itinerary (admin)
exports.updateItinerary = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid itinerary ID' });
    }

    const { title, description, duration, locations, difficulty, days, order, isActive, translations } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (duration !== undefined) updates.duration = duration;
    if (locations !== undefined) updates.locations = locations;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (days !== undefined) updates.days = days;
    if (order !== undefined) updates.order = order;
    if (isActive !== undefined) updates.isActive = isActive;
    if (translations) updates.translations = translations;
    updates.updatedAt = new Date();

    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Itinerary updated successfully',
      itinerary
    });
  } catch (err) {
    next(err);
  }
};

// Delete itinerary (admin)
exports.deleteItinerary = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid itinerary ID' });
    }

    const itinerary = await Itinerary.findByIdAndDelete(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
