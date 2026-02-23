const express = require('express');
const router = express.Router();
const { getAllAbout, getAboutById } = require('../controllers/aboutController');

router.get('/', getAllAbout);
router.get('/:id', getAboutById);

module.exports = router;
