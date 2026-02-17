const express = require('express');
const router = express.Router();
const { getAllServices, getService } = require('../controllers/serviceController');

// Public Routes
router.get('/', getAllServices);
router.get('/:id', getService);

module.exports = router;
