const Service = require('../models/Service');
const mongoose = require('mongoose');

// Client: Get all available services
exports.getAllServices = async (req, res, next) => {
  try {
    const { isAvailable = true } = req.query;
    const filter = {};
    if (isAvailable !== 'false') {
      filter.isAvailable = true;
    }

    const services = await Service.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (err) {
    next(err);
  }
};

// Client: Get single service
exports.getService = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid service ID' });
    }
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

// Admin: Create service
exports.createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, imageUrl, maxCapacity, category, details } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }

    const service = await Service.create({
      name,
      description,
      details,
      price,
      duration,
      image: imageUrl,
      imageUrl,
      maxCapacity,
      category,
      isAvailable: true
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Service name already exists'
      });
    }
    next(err);
  }
};

// Admin: Update service
exports.updateService = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid service ID' });
    }
    const { name, description, price, duration, imageUrl, maxCapacity, category, isAvailable, details } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (details !== undefined) updates.details = details;
    if (price !== undefined) updates.price = price;
    if (duration !== undefined) updates.duration = duration;
    if (imageUrl !== undefined) {
      updates.image = imageUrl;
      updates.imageUrl = imageUrl;
    }
    if (maxCapacity !== undefined) updates.maxCapacity = maxCapacity;
    if (category !== undefined) updates.category = category;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    updates.updatedAt = Date.now();

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Service name already exists'
      });
    }
    next(err);
  }
};

// Admin: Delete service
exports.deleteService = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid service ID' });
    }
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
