const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Initialize email service
const emailService = require('../config/emailService');

// Submit a contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, inquiryType, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, subject, and message'
      });
    }

    // Validate inquiry type
    const validTypes = ['question', 'feedback', 'help'];
    const type = inquiryType || 'question';
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry type. Must be: question, feedback, or help'
      });
    }

    // Create contact record
    const contact = await Contact.create({
      name,
      email,
      subject,
      inquiryType: type,
      message
    });

    // Send email to admin
    try {
      await emailService.sendContactNotification(contact);
      console.log('Contact notification email sent to admin');
    } catch (emailError) {
      console.error('Error sending contact notification email:', emailError);
      // Don't fail the request if email fails - record is still saved
    }

    // Send confirmation email to user
    try {
      await emailService.sendContactConfirmation(contact);
      console.log('Contact confirmation email sent to user');
    } catch (emailError) {
      console.error('Error sending contact confirmation email:', emailError);
      // Don't fail the request if email fails - record is still saved
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. We will respond shortly.',
      contact: {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        inquiryType: contact.inquiryType,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form',
      error: error.message
    });
  }
};

// Get all contact submissions (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
};

// Get contact by ID (admin only)
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Mark as read
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.status(200).json({
      success: true,
      contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message
    });
  }
};

// Respond to contact submission (admin only)
exports.respondToContact = async (req, res) => {
  try {
    const { response } = req.body;
    const userId = req.user?._id;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response message'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        response,
        status: 'responded',
        respondedAt: new Date(),
        respondedBy: userId
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Send response email to user
    try {
      await emailService.sendContactResponse(contact, response);
      console.log('Response email sent to user');
    } catch (emailError) {
      console.error('Error sending response email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error responding to contact',
      error: error.message
    });
  }
};

// Delete contact (admin only)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message
    });
  }
};

// Get contacts by inquiry type (admin only)
exports.getContactsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const validTypes = ['question', 'feedback', 'help'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry type'
      });
    }

    const contacts = await Contact.find({ inquiryType: type }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      type,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts by type',
      error: error.message
    });
  }
};

// Get unread contacts (admin only)
exports.getUnreadContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ status: 'new' }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread contacts',
      error: error.message
    });
  }
};
