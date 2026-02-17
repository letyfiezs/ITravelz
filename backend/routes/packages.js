const express = require("express");
const packageController = require("../controllers/packageController");

const router = express.Router();

// Public routes
router.get("/", packageController.getAllPackages);
router.get("/:id", packageController.getPackageById);
router.get("/:id/availability", packageController.getPackageAvailability);

module.exports = router;
