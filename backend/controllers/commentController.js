const Comment = require("../models/Comment");

const ALLOWED_TYPES = ["Package", "Destination", "Festival", "Itinerary", "Service", "AboutMongolia"];

exports.getComments = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { imageUrl } = req.query;

    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({ success: false, message: "Invalid content type" });
    }

    const filter = { contentType, contentId };
    if (imageUrl) filter.imageUrl = imageUrl;

    const comments = await Comment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { imageUrl, text } = req.body;

    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({ success: false, message: "Invalid content type" });
    }
    if (!imageUrl || !text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Image and comment text are required" });
    }

    const comment = await Comment.create({
      contentType,
      contentId,
      imageUrl,
      user: req.userId,
      userName: req.userName || "Traveler",
      text: text.trim(),
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    const isOwner = String(comment.user) === String(req.userId);
    const isAdmin = req.userRole === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }
    await comment.deleteOne();
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Best-effort lookup of the display name for the content item a comment belongs to
const CONTENT_MODELS = {
  Package: () => require("../models/Package"),
  Destination: () => require("../models/Destination"),
  Festival: () => require("../models/Festival"),
  Itinerary: () => require("../models/Itinerary"),
  Service: () => require("../models/Service"),
  AboutMongolia: () => require("../models/AboutMongolia"),
};

// Get every comment across all content (admin only)
exports.getAllCommentsAdmin = async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 }).lean();

    const nameCache = {};
    for (const c of comments) {
      const cacheKey = `${c.contentType}:${c.contentId}`;
      if (!(cacheKey in nameCache)) {
        try {
          const Model = CONTENT_MODELS[c.contentType]?.();
          const doc = Model
            ? await Model.findById(c.contentId).select("name title").lean()
            : null;
          nameCache[cacheKey] = doc?.name || doc?.title || null;
        } catch {
          nameCache[cacheKey] = null;
        }
      }
      c.contentName = nameCache[cacheKey];
    }

    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete any comment (admin only — no ownership check)
exports.adminDeleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
