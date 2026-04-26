const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Student = require('../../models/Student');

const uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let data = [];
    if (req.file.originalname && req.file.originalname.toLowerCase().endsWith('.txt')) {
      const text = req.file.buffer.toString('utf8');
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      const regex = /^(\d+)\s+([A-Z0-9]+)\s+(.+?)\s+([MF]|-)\s+(B\.Tech\.|-)\s+(.+?)\s+(\d{2}-[A-Za-z]{3}-\d{4}|-)\s+([A-Z]|-)\s+([\w.-]+@[\w.-]+)\s+([\dA-Z]+)\s+(\d+)$/;
      
      for (let i = 1; i < lines.length; i++) {
        const match = lines[i].match(regex);
        if (match) {
          data.push({
            rollNumber: match[2],
            name: match[3],
            department: match[6]
          });
        }
      }
    } else {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(sheet);
    }

    if (data.length === 0) {
      return res.status(400).json({ message: "Uploaded file is empty or could not be parsed" });
    }

    // Validation: Missing tags & duplicates
    const incomingRollNumbers = new Set();
    const studentsToInsert = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rollNumber = row.rollNumber || row.RollNumber || row['Register No.'];
      const name = row.name || row.Name || row['Student Name'];
      const department = row.department || row.Department || row['Branch'];

      if (!rollNumber || !name || !department) {
        errors.push(`Row ${i + 2}: Missing required fields (rollNumber, name, department)`);
        continue;
      }

      if (incomingRollNumbers.has(rollNumber)) {
        errors.push(`Row ${i + 2}: Duplicate rollNumber ${rollNumber} found in file`);
        continue;
      }
      incomingRollNumbers.add(rollNumber);

      studentsToInsert.push({ rollNumber, name, department });
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed:\n${errors.join('\n')}`);
    }

    const ops = studentsToInsert.map(s => ({
      updateOne: {
        filter: { rollNumber: s.rollNumber },
        update: { $set: s },
        upsert: true
      }
    }));
    await Student.bulkWrite(ops);

    res.status(201).json({
      message: "Bulk upload successful",
      insertedCount: studentsToInsert.length
    });

  } catch (error) {
    res.status(400).json({ message: "Upload failed", error: error.message });
  }
};

module.exports = { uploadStudents };
