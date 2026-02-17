const Package = require("../models/Package");
const Booking = require("../models/Booking");

// Get all active packages (public)
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({ status: "active" }).sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching packages", error: error.message });
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
    res.status(500).json({ message: "Error fetching package", error: error.message });
  }
};

// Create new package (admin)
exports.createPackage = async (req, res) => {
  try {
    const { name, description, price, category, duration, destination, image, features, status, availableDates, availableTimes, bookingLimitPerSlot, translations } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        message: "Missing required fields: name, description, price, category" 
      });
    }

    const newPackage = new Package({
      name,
      description,
      price: parseFloat(price),
      category,
      duration: duration || "Varies",
      destination: destination || "Multiple",
      image: image || null,
      features: features || [],
      status: status || "active",
      availableDates: availableDates || [],
      availableTimes: availableTimes || [],
      bookingLimitPerSlot: bookingLimitPerSlot || 5,
      translations: translations || {
        en: { name, description, duration: duration || "Varies", destination: destination || "Multiple", category, features: features || [] },
        es: { name, description, duration: duration || "Varies", destination: destination || "Multiple", category, features: features || [] },
        fr: { name, description, duration: duration || "Varies", destination: destination || "Multiple", category, features: features || [] },
        ja: { name, description, duration: duration || "Varies", destination: destination || "Multiple", category, features: features || [] },
        zh: { name, description, duration: duration || "Varies", destination: destination || "Multiple", category, features: features || [] },
        ar: { name, description, duration: duration || "Varies", destination: destination || "Multiple", category, features: features || [] },
        nl: { name, description, duration: duration || "Varies", destination: destination || "Multiple", category, features: features || [] },
        mn: { name, description, duration: duration || "Varies", destination: destination || "Multiple", category, features: features || [] }
      }
    });

    await newPackage.save();
    res.status(201).json({ 
      message: "Package created successfully!", 
      package: newPackage 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating package", 
      error: error.message 
    });
  }
};

// Update package (admin)
exports.updatePackage = async (req, res) => {
  try {
    const { name, description, price, category, duration, destination, image, features, status, availableDates, availableTimes, bookingLimitPerSlot, translations } = req.body;

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
      updatedAt: new Date()
    };

    if (translations) {
      updateData.translations = translations;
    }

    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ 
      message: "Package updated successfully!", 
      package: pkg 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating package", 
      error: error.message 
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
      message: "Package deleted successfully!" 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting package", 
      error: error.message 
    });
  }
};

// Get all packages including inactive/archived (admin only)
exports.getAllPackagesAdmin = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching packages", error: error.message });
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
            status: "approved"
          }
        },
        {
          $group: {
            _id: null,
            totalPeople: { $sum: "$numberOfPeople" }
          }
        }
      ]);

      const bookedPeople = totalBookedPeople.length > 0 ? totalBookedPeople[0].totalPeople : 0;
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
        bookingLimitPerSlot: pkg.bookingLimitPerSlot || 5
      });
    }

    // Return all available dates and times with capacity info
    const availabilityWithCapacity = [];
    for (const date of (pkg.availableDates || [])) {
      for (const time of (pkg.availableTimes || [])) {
        const bookingLimit = pkg.bookingLimitPerSlot || 5;
        const dateObj = new Date(date);
        
        const totalBookedPeople = await Booking.aggregate([
          {
            $match: {
              serviceName: pkg.name,
              bookingDate: dateObj,
              bookingTime: time,
              status: "approved"
            }
          },
          {
            $group: {
              _id: null,
              totalPeople: { $sum: "$numberOfPeople" }
            }
          }
        ]);

        const bookedPeople = totalBookedPeople.length > 0 ? totalBookedPeople[0].totalPeople : 0;
        const remainingCapacity = Math.max(0, bookingLimit - bookedPeople);

        availabilityWithCapacity.push({
          date,
          time,
          totalCapacity: bookingLimit,
          bookedPeople,
          remainingCapacity,
          isFullyBooked: remainingCapacity === 0
        });
      }
    }

    res.json({
      packageId: pkg._id,
      packageName: pkg.name,
      bookingLimitPerSlot: pkg.bookingLimitPerSlot || 5,
      availability: availabilityWithCapacity,
      availableDates: pkg.availableDates || [],
      availableTimes: pkg.availableTimes || []
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching availability", 
      error: error.message 
    });
  }
};