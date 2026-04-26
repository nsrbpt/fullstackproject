require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const SeatingAllocation = require('../models/SeatingAllocation');
const Hall = require('../models/Hall');
const AdminUser = require('../models/AdminUser');
const bcrypt = require('bcrypt');

const resetData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("Clearing Students and Allocations...");
    await Student.deleteMany({});
    await SeatingAllocation.deleteMany({});
    
    // Always recreate halls
    console.log("Clearing and recreating Halls...");
    await Hall.deleteMany({});
    console.log("Creating 10 default Halls...");
    const halls = [];
    for (let i = 1; i <= 10; i++) {
      halls.push({ name: `Hall 10${i}`, capacity: 60, rows: 10, cols: 6 });
    }
    await Hall.insertMany(halls);

    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      console.log("Creating default Admin...");
      const hash = await bcrypt.hash('040807', 12);
      await AdminUser.create({ adminId: '17903', passwordHash: hash });
    }

    console.log("Reset Complete! System is now at 0 students.");
    process.exit(0);
  } catch (error) {
    console.error("Reset failed:", error);
    process.exit(1);
  }
};

resetData();
