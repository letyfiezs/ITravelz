const express = require('express');
const router = express.Router();
const { getAllContent, getContent } = require('../controllers/contentController');

// Public Routes
router.get('/', getAllContent);
router.get('/:id', getContent);

module.exports = router;
