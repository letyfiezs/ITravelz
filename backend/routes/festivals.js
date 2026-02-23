const express = require('express');
const router = express.Router();
const { getAllFestivals, getFestivalById } = require('../controllers/festivalController');

router.get('/', getAllFestivals);
router.get('/:id', getFestivalById);

module.exports = router;
