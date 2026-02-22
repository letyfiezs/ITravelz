#!/usr/bin/env node

// Creates (or promotes) a user with role:"admin" in the User collection.
// The frontend checks user.role === "admin" to allow access to /admin.
//
// Usage:
//   node scripts/createAdminUser.js
//   node scripts/createAdminUser.js admin@example.com SecurePass123 "Admin Name"
//
// Or set env vars before running:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/createAdminUser.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌  MONGO_URI is not set in your .env file');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('[DB] Connected to MongoDB');

  const email    = process.env.ADMIN_EMAIL    || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3];
  const name     = process.env.ADMIN_NAME     || process.argv[4] || 'Administrator';

  if (!email || !password) {
    console.error('❌  Provide ADMIN_EMAIL and ADMIN_PASSWORD');
    console.log('    node scripts/createAdminUser.js admin@example.com "Password123" "Admin Name"');
    process.exit(1);
  }

  let user = await User.findOne({ email }).select('+password');

  if (user) {
    // Promote existing user to admin and update password
    user.role     = 'admin';
    user.password = password;          // pre-save hook will hash it
    user.isEmailVerified = true;
    await user.save();
    console.log(`✅  Existing user promoted to admin: ${email}`);
  } else {
    // Create brand-new admin user
    user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`✅  Admin user created: ${email}`);
  }

  console.log(`   Name : ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role : ${user.role}`);
  console.log('\n→  Log in at /login with these credentials to access /admin');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
