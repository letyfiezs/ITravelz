const express = require('express');
const router = express.Router();
const { login, getProfile, updateProfile } = require('../controllers/adminController');
const {
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingController');
const {
  createService,
  updateService,
  deleteService,
  getAllServices: getAllServicesAdmin
} = require('../controllers/serviceController');
const {
  upsertContent,
  updateContent,
  deleteContent,
  uploadImage
} = require('../controllers/contentController');
const {
  createPackage,
  updatePackage,
  deletePackage,
  getAllPackagesAdmin
} = require('../controllers/packageController');
const {
  createItinerary,
  updateItinerary,
  deleteItinerary
} = require('../controllers/itineraryController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Auth Routes
router.post('/login', login);
router.get('/profile', protectAdmin, getProfile);
router.put('/profile', protectAdmin, updateProfile);

// Booking Management Routes
router.get('/bookings', protectAdmin, getAllBookings);
router.get('/bookings/:id', protectAdmin, getBookingById);
router.put('/bookings/:id', protectAdmin, updateBooking);
router.delete('/bookings/:id', protectAdmin, deleteBooking);

// Service Management Routes
router.post('/services', protectAdmin, createService);
router.put('/services/:id', protectAdmin, updateService);
router.delete('/services/:id', protectAdmin, deleteService);

// Content Management Routes
router.post('/content', protectAdmin, upsertContent);
router.put('/content/:id', protectAdmin, updateContent);
router.delete('/content/:id', protectAdmin, deleteContent);

// Package Management Routes
router.get('/packages', protectAdmin, getAllPackagesAdmin);
router.post('/packages', protectAdmin, createPackage);
router.put('/packages/:id', protectAdmin, updatePackage);
router.delete('/packages/:id', protectAdmin, deletePackage);

// Itinerary Management Routes
router.post('/itineraries', protectAdmin, createItinerary);
router.put('/itineraries/:id', protectAdmin, updateItinerary);
router.delete('/itineraries/:id', protectAdmin, deleteItinerary);

// Image Upload
router.post('/upload', protectAdmin, upload.single('image'), uploadImage);

module.exports = router;
