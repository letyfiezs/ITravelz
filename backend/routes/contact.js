const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContactById,
  respondToContact,
  deleteContact,
  getContactsByType,
  getUnreadContacts
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public route - anyone can submit contact
router.post('/', submitContact);

// Admin only routes
router.get('/', protect, authorize('admin'), getAllContacts);
router.get('/unread', protect, authorize('admin'), getUnreadContacts);
router.get('/type/:type', protect, authorize('admin'), getContactsByType);
router.get('/:id', protect, authorize('admin'), getContactById);
router.put('/:id/respond', protect, authorize('admin'), respondToContact);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
