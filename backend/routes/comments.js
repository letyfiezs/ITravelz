const express = require("express");
const { getComments, addComment, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public — anyone can read comments on an image
router.get("/:contentType/:contentId", getComments);

// Protected — must be logged in to comment or delete own comment
router.post("/:contentType/:contentId", protect, addComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
