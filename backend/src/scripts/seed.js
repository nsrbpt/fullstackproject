require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Hall = require('../models/Hall');
const AdminUser = require('../models/AdminUser');
const SeatingAllocation = require('../models/SeatingAllocation');

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    // Clear existing
    console.log("Clearing DB...");
    await Student.deleteMany({});
    await Hall.deleteMany({});
    await AdminUser.deleteMany({});
    await SeatingAllocation.deleteMany({});

    // 1. Create Admin
    const hash = await bcrypt.hash('040807', 12);
    await AdminUser.create({ adminId: '17903', passwordHash: hash });
    console.log("Admin user created: 17903 / 040807");

    // 2. Create 10 Halls (Capacity: 60 each -> Total 600 seats)
    // To ensure total capacity (600) > total students (500)
    console.log("Creating 10 Halls with 60 capacity each (10 rows x 6 cols)...");
    const halls = [];
    for (let i = 1; i <= 10; i++) {
      halls.push({ name: `Hall 10${i}`, capacity: 60, rows: 10, cols: 6 });
    }
    await Hall.insertMany(halls);

    // 3. Create 500 Dummy Students
    console.log("Generating 500 Dummy Students...");
    const departments = ['Computer_Science', 'Information_Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
    const students = [];

    for (let i = 1; i <= 500; i++) {
        // distribute them among departments to test interleaving
        const deptIndex = i % departments.length;
        students.push({
            rollNumber: `2026${departments[deptIndex].substring(0,2).toUpperCase()}${String(i).padStart(4, '0')}`,
            name: `Student Name ${i}`,
            department: departments[deptIndex]
        });
    }

    await Student.insertMany(students);
    console.log("Seeding Complete!");
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
