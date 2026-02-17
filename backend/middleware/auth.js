const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Protect Routes - Verify JWT Token
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    
    // Fetch user to get email and other details
    const User = require("../models/User");
    const user = await User.findById(decoded.id);
    if (user) {
      req.userEmail = user.email;
      req.userName = user.name;
    }
    
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }
};

// Admin only
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Protect Admin Routes - Verify JWT Token for Admin
exports.protectAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized - no token' });
    }
    
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-change-in-production');
    
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin not found or inactive' });
    }
    
    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

exports.protectAdminRole = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  if (req.admin.role !== 'admin' && req.admin.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden - insufficient role' });
  }
  next();
};
