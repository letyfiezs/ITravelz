const express = require('express');
const router = express.Router();
const {
  getAllItineraries,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary
} = require('../controllers/itineraryController');
const { protectAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllItineraries);
router.get('/:id', getItinerary);

// Admin routes
router.post('/', protectAdmin, createItinerary);
router.put('/:id', protectAdmin, updateItinerary);
router.delete('/:id', protectAdmin, deleteItinerary);

module.exports = router;
