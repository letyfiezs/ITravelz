const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const axios = require('axios');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const User    = require('../models/User');
    const Booking = require('../models/Booking');
    const Package = require('../models/Package');

    const [totalUsers, totalBookings, totalPackages, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Package.countDocuments(),
      Booking.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    ]);

    res.json({
      success: true,
      totalUsers,
      totalBookings,
      totalPackages,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { next(err); }

};

// ── Auto-translate texts using MyMemory (free, no API key needed) ──
const SUPPORTED_LANGS = ['mn', 'en', 'de', 'ko', 'ja', 'zh'];

const translateOne = async (text, from, to) => {
  if (!text || !text.trim() || from === to) return text;
  // MyMemory free API: 500 chars/segment, 5000 words/day
  const chunk = text.slice(0, 490);
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    return data.responseData?.translatedText || text;
  } catch {
    return text; // fallback to original
  }
};

exports.translateText = async (req, res) => {
  try {
    const { texts, sourceLang = 'en' } = req.body;
    // texts: { name: 'Hello', description: 'World', features: ['A','B'] }
    if (!texts || typeof texts !== 'object') {
      return res.status(400).json({ success: false, message: '`texts` object is required' });
    }

    const results = {};

    for (const lang of SUPPORTED_LANGS) {
      results[lang] = {};
      for (const [key, val] of Object.entries(texts)) {
        if (Array.isArray(val)) {
          // Translate each item in array
          results[lang][key] = [];
          for (const item of val) {
            if (typeof item === 'string' && item.trim()) {
              results[lang][key].push(await translateOne(item, sourceLang, lang));
            } else {
              results[lang][key].push(item);
            }
          }
        } else if (typeof val === 'string') {
          results[lang][key] = await translateOne(val, sourceLang, lang);
        } else {
          results[lang][key] = val;
        }
      }
    }

    res.json({ success: true, translations: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.status(200).json({ success: true, admin });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { name, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    res.status(200).json({ success: true, admin });
  } catch (err) {
    next(err);
  }
};
