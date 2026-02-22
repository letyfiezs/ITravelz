const express = require('express');
const router = express.Router();
const { login, getProfile, updateProfile, getStats, getUsers } = require('../controllers/adminController');
const {
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  approveBooking,
  declineBooking,
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
  deleteItinerary,
  getAllItinerariesAdmin
} = require('../controllers/itineraryController');
const {
  getAllDestinationsAdmin,
  createDestination,
  updateDestination,
  deleteDestination,
} = require('../controllers/destinationController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Auth Routes
router.post('/login', login);
router.get('/profile', protectAdmin, getProfile);
router.put('/profile', protectAdmin, updateProfile);

// Stats & Users
router.get('/stats', protectAdmin, getStats);
router.get('/users', protectAdmin, getUsers);

// Booking Management Routes
router.get('/bookings', protectAdmin, getAllBookings);
router.get('/bookings/:id', protectAdmin, getBookingById);
router.patch('/bookings/:id/approve', protectAdmin, approveBooking);
router.patch('/bookings/:id/decline', protectAdmin, declineBooking);
router.put('/bookings/:id', protectAdmin, updateBooking);
router.patch('/bookings/:id', protectAdmin, updateBooking);
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
router.get('/itineraries', protectAdmin, getAllItinerariesAdmin);
router.post('/itineraries', protectAdmin, createItinerary);
router.put('/itineraries/:id', protectAdmin, updateItinerary);
router.delete('/itineraries/:id', protectAdmin, deleteItinerary);

// Destination Management Routes
router.get('/destinations', protectAdmin, getAllDestinationsAdmin);
router.post('/destinations', protectAdmin, createDestination);
router.put('/destinations/:id', protectAdmin, updateDestination);
router.delete('/destinations/:id', protectAdmin, deleteDestination);

// Image Upload
router.post('/upload', protectAdmin, upload.single('image'), uploadImage);

module.exports = router;
