const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const axios = require("axios");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Account is inactive" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "secret-key-change-in-production",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const User = require("../models/User");
    const Booking = require("../models/Booking");
    const Package = require("../models/Package");

    const [totalUsers, totalBookings, totalPackages, revenueAgg] =
      await Promise.all([
        User.countDocuments(),
        Booking.countDocuments(),
        Package.countDocuments(),
        Booking.aggregate([
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
      ]);

    res.json({
      success: true,
      totalUsers,
      totalBookings,
      totalPackages,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const User = require("../models/User");
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

exports.makeAdminByEmail = async (req, res, next) => {
  try {
    const User = require("../models/User");
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      const safeUser = await User.findById(user._id).select("-password");
      return res
        .status(200)
        .json({
          success: true,
          message: "User is already admin",
          user: safeUser,
        });
    }

    user.role = "admin";
    user.updatedAt = Date.now();
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    res
      .status(200)
      .json({
        success: true,
        message: "User promoted to admin",
        user: safeUser,
      });
  } catch (err) {
    next(err);
  }
};

exports.removeAdminByEmail = async (req, res, next) => {
  try {
    const User = require("../models/User");
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (String(user._id) === String(req.admin?.id)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot remove your own admin role",
        });
    }

    if (user.role !== "admin") {
      const safeUser = await User.findById(user._id).select("-password");
      return res
        .status(200)
        .json({
          success: true,
          message: "User is already not admin",
          user: safeUser,
        });
    }

    user.role = "user";
    user.updatedAt = Date.now();
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    res
      .status(200)
      .json({ success: true, message: "Admin role removed", user: safeUser });
  } catch (err) {
    next(err);
  }
};

exports.deleteUserById = async (req, res, next) => {
  try {
    const User = require("../models/User");
    const Booking = require("../models/Booking");
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (String(user._id) === String(req.admin?.id)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot delete your own account",
        });
    }

    await Booking.deleteMany({
      $or: [{ userId: user._id }, { email: user.email }],
    });
    await User.deleteOne({ _id: user._id });

    res
      .status(200)
      .json({ success: true, message: "User deleted from database" });
  } catch (err) {
    next(err);
  }
};

// ── Auto-translate texts using MyMemory (free, no API key needed) ──
const SUPPORTED_LANGS = ["mn", "en", "de", "ko", "ja", "zh"];

const translateOne = async (text, from, to) => {
  if (!text || !text.trim() || from === to) return text;
  // MyMemory free API: 500 chars/segment, 5000 words/day
  const chunk = text.slice(0, 490);
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    const translated = data.responseData?.translatedText;
    // Reject MyMemory quota warnings and known error strings
    if (!translated) return text;
    if (
      translated.includes("MYMEMORY WARNING") ||
      translated.includes("PLEASE REVIEW")
    )
      return text;
    if (data.responseStatus && data.responseStatus !== 200) return text;
    return translated;
  } catch {
    return text; // fallback to original
  }
};

exports.translateText = async (req, res) => {
  try {
    const { texts, sourceLang = "en" } = req.body;
    // texts: { name: 'Hello', description: 'World', features: ['A','B'] }
    if (!texts || typeof texts !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "`texts` object is required" });
    }

    const results = {};

    for (const lang of SUPPORTED_LANGS) {
      results[lang] = {};
      for (const [key, val] of Object.entries(texts)) {
        if (Array.isArray(val)) {
          // Translate each item in array
          results[lang][key] = [];
          for (const item of val) {
            if (typeof item === "string" && item.trim()) {
              results[lang][key].push(
                await translateOne(item, sourceLang, lang),
              );
            } else {
              results[lang][key].push(item);
            }
          }
        } else if (typeof val === "string") {
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
    const admin = await Admin.findById(req.admin.id).select("-password");
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
      { new: true },
    ).select("-password");
    res.status(200).json({ success: true, admin });
  } catch (err) {
    next(err);
  }
};
