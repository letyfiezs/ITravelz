const Package = require("../models/Package");
const Booking = require("../models/Booking");
const { ensureFullTranslations } = require("../utils/autoTranslate");

// Get all active packages (public)
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({ status: "active" }).sort({
      createdAt: -1,
    });
    res.json(packages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching packages", error: error.message });
  }
};

// Get single package by ID
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json(pkg);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching package", error: error.message });
  }
};

// Create new package (admin)
exports.createPackage = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      duration,
      destination,
      image,
      features,
      status,
      availableDates,
      availableTimes,
      bookingLimitPerSlot,
      translations,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: "Missing required fields: name, description, price, category",
      });
    }

    const resolvedDuration = duration || "Varies";
    const resolvedDestination = destination || "Multiple";

    // Guarantee every supported language has a complete translation —
    // reuses whatever the admin's manual "Auto Translate" click already
    // produced, and machine-translates anything still missing.
    const fullTranslations = await ensureFullTranslations(
      {
        name,
        description,
        duration: resolvedDuration,
        destination: resolvedDestination,
        features: features || [],
      },
      translations,
    );

    const newPackage = new Package({
      name,
      description,
      price: parseFloat(price),
      category,
      subCategory: subCategory || "",
      duration: resolvedDuration,
      destination: resolvedDestination,
      image: image || null,
      features: features || [],
      status: status || "active",
      availableDates: availableDates || [],
      availableTimes: availableTimes || [],
      bookingLimitPerSlot: bookingLimitPerSlot || 5,
      translations: fullTranslations,
    });

    await newPackage.save();
    res.status(201).json({
      message: "Package created successfully!",
      package: newPackage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating package",
      error: error.message,
    });
  }
};

// Update package (admin)
exports.updatePackage = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      duration,
      destination,
      image,
      features,
      status,
      availableDates,
      availableTimes,
      bookingLimitPerSlot,
      translations,
      itinerary,
      highlights,
      packingList,
      totalDistance,
      maxElevation,
      pricingNote,
      groupPricing,
    } = req.body;

    const updateData = {
      name,
      description,
      price: parseFloat(price),
      category,
      duration,
      destination,
      image,
      features,
      status,
      availableDates: availableDates || [],
      availableTimes: availableTimes || [],
      bookingLimitPerSlot: bookingLimitPerSlot || 5,
      updatedAt: new Date(),
    };

    if (subCategory !== undefined) updateData.subCategory = subCategory || "";

    // Detail fields — only overwrite when explicitly sent
    if (itinerary !== undefined) updateData.itinerary = itinerary || [];
    if (highlights !== undefined) updateData.highlights = highlights || [];
    if (packingList !== undefined) updateData.packingList = packingList || [];
    if (totalDistance !== undefined)
      updateData.totalDistance = totalDistance || "";
    if (maxElevation !== undefined)
      updateData.maxElevation = maxElevation || "";
    if (pricingNote !== undefined) updateData.pricingNote = pricingNote || "";
    if (groupPricing !== undefined)
      updateData.groupPricing = groupPricing || [];

    if (translations) {
      // Admin used the manual "Auto Translate" button — trust it as-is.
      updateData.translations = translations;
    } else if (
      name !== undefined ||
      description !== undefined ||
      duration !== undefined ||
      destination !== undefined ||
      features !== undefined
    ) {
      // Translatable content changed but no translations were supplied —
      // regenerate all 6 languages from the merged (new + existing) fields
      // so no stale/mismatched translation is ever left behind.
      const existingPkg = await Package.findById(req.params.id).select(
        "name description duration destination features",
      );
      if (existingPkg) {
        const mergedFields = {
          name: name !== undefined ? name : existingPkg.name,
          description: description !== undefined ? description : existingPkg.description,
          duration: duration !== undefined ? duration : existingPkg.duration,
          destination: destination !== undefined ? destination : existingPkg.destination,
          features: features !== undefined ? features : existingPkg.features || [],
        };
        updateData.translations = await ensureFullTranslations(mergedFields, {});
      }
    }

    const pkg = await Package.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({
      message: "Package updated successfully!",
      package: pkg,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating package",
      error: error.message,
    });
  }
};

// Delete package (admin)
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({
      message: "Package deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting package",
      error: error.message,
    });
  }
};

// Helper: extract URL from multer file (Cloudinary or disk)
const getFileUrl = (f) => f.path || f.secure_url || `/uploads/${f.filename}`;

// Upload images for a package (admin)
exports.uploadPackageImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    const newPaths = req.files.map(getFileUrl);
    const combined = [...(pkg.images || []), ...newPaths].slice(0, 10);
    pkg.images = combined;
    await pkg.save();

    res.json({ message: "Images uploaded", images: pkg.images });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading images", error: error.message });
  }
};

// Remove a single image from a package (admin)
exports.deletePackageImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    pkg.images = (pkg.images || []).filter((img) => img !== imageUrl);
    await pkg.save();
    res.json({ message: "Image removed", images: pkg.images });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing image", error: error.message });
  }
};

// Get all packages including inactive/archived (admin only)
exports.getAllPackagesAdmin = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching packages", error: error.message });
  }
};
// Get available dates and times for a package (public)
exports.getPackageAvailability = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    // If date and time are provided as query parameters, get capacity for specific slot
    const { date, time } = req.query;
    if (date && time) {
      // Get capacity for specific time slot
      const bookingLimit = pkg.bookingLimitPerSlot || 5;
      const dateObj = new Date(date);

      const totalBookedPeople = await Booking.aggregate([
        {
          $match: {
            serviceName: pkg.name,
            bookingDate: dateObj,
            bookingTime: time,
            status: "approved",
          },
        },
        {
          $group: {
            _id: null,
            totalPeople: { $sum: "$numberOfPeople" },
          },
        },
      ]);

      const bookedPeople =
        totalBookedPeople.length > 0 ? totalBookedPeople[0].totalPeople : 0;
      const remainingCapacity = Math.max(0, bookingLimit - bookedPeople);

      return res.json({
        packageId: pkg._id,
        packageName: pkg.name,
        date,
        time,
        totalCapacity: bookingLimit,
        bookedPeople,
        remainingCapacity,
        isFullyBooked: remainingCapacity === 0,
        availableDates: pkg.availableDates || [],
        availableTimes: pkg.availableTimes || [],
        bookingLimitPerSlot: pkg.bookingLimitPerSlot || 5,
      });
    }

    // Return all available dates and times with capacity info
    const availabilityWithCapacity = [];
    for (const date of pkg.availableDates || []) {
      for (const time of pkg.availableTimes || []) {
        const bookingLimit = pkg.bookingLimitPerSlot || 5;
        const dateObj = new Date(date);

        const totalBookedPeople = await Booking.aggregate([
          {
            $match: {
              serviceName: pkg.name,
              bookingDate: dateObj,
              bookingTime: time,
              status: "approved",
            },
          },
          {
            $group: {
              _id: null,
              totalPeople: { $sum: "$numberOfPeople" },
            },
          },
        ]);

        const bookedPeople =
          totalBookedPeople.length > 0 ? totalBookedPeople[0].totalPeople : 0;
        const remainingCapacity = Math.max(0, bookingLimit - bookedPeople);

        availabilityWithCapacity.push({
          date,
          time,
          totalCapacity: bookingLimit,
          bookedPeople,
          remainingCapacity,
          isFullyBooked: remainingCapacity === 0,
        });
      }
    }

    res.json({
      packageId: pkg._id,
      packageName: pkg.name,
      bookingLimitPerSlot: pkg.bookingLimitPerSlot || 5,
      availability: availabilityWithCapacity,
      availableDates: pkg.availableDates || [],
      availableTimes: pkg.availableTimes || [],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching availability",
      error: error.message,
    });
  }
};
