#!/usr/bin/env node

// node scripts/createAdmin.js --[mail] [password] [name]

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('Error: MONGO_URI not set in environment');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('[DB] Connected to MongoDB');

    // Get admin credentials from environment or command line
    const adminEmail = process.env.ADMIN_EMAIL || process.argv[2];
    const adminPassword = process.env.ADMIN_PASSWORD || process.argv[3];
    const adminName = process.env.ADMIN_NAME || process.argv[4] || 'Administrator';

    if (!adminEmail || !adminPassword) {
      console.error('Error: Please provide ADMIN_EMAIL and ADMIN_PASSWORD');
      console.log('Usage: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secure_pass npm run create-admin');
      console.log('Or:    node scripts/createAdmin.js admin@example.com secure_pass "Admin Name"');
      process.exit(1);
    }

    // Check if admin already exists
    let admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      console.log(`[INFO] Admin with email ${adminEmail} already exists. Updating password...`);
      admin.password = adminPassword;
      admin.name = adminName;
      await admin.save();
      console.log('[SUCCESS] Admin password updated successfully');
    } else {
      admin = await Admin.create({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: 'admin',
        isActive: true
      });
      console.log('[SUCCESS] Admin account created successfully');
    }

    console.log(`Admin Email: ${admin.email}`);
    console.log(`Admin Name: ${admin.name}`);
    console.log(`Admin Role: ${admin.role}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[ERROR]', err.message);
    process.exit(1);
  }
};

createAdmin();
