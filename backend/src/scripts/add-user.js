require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');

const addUser = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    // Drop the legacy 'email_1' index if it exists to prevent errors
    try {
      await AdminUser.collection.dropIndex('email_1');
      console.log("Dropped legacy email index.");
    } catch (e) {
      // Index might not exist, ignore
    }
    
    const adminId = 'srinivas';
    const password = '12334';
    
    // Check if user exists
    const existing = await AdminUser.findOne({ adminId });
    if (existing) {
      console.log(`User ${adminId} already exists. Updating password...`);
      const hash = await bcrypt.hash(password, 12);
      existing.passwordHash = hash;
      await existing.save();
    } else {
      console.log(`Creating new user: ${adminId}`);
      const hash = await bcrypt.hash(password, 12);
      await AdminUser.create({ adminId, passwordHash: hash });
    }

    console.log(`Success! User: ${adminId} | Pass: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to add user:", error);
    process.exit(1);
  }
};

addUser();
