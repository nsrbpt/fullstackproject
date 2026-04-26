const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Student = require('../../models/Student');
const Hall = require('../../models/Hall');
const SeatingAllocation = require('../../models/SeatingAllocation');

const generateAllocation = async (req, res) => {
  try {
    const { examId } = req.body;
    if (!examId) return res.status(400).json({ message: "examId is required" });

    // Check if allocation already exists
    const existing = await SeatingAllocation.findOne({ examId });
    if (existing) {
      return res.status(400).json({ message: "Allocation already exists for this Exam ID" });
    }

    const students = await Student.find({}).sort({ rollNumber: 1 });
    const halls = await Hall.find({});

    if (students.length === 0) throw new Error("No students in database");
    if (halls.length === 0) throw new Error("No halls in database");

    const totalCapacity = halls.reduce((sum, h) => sum + h.capacity, 0);
    if (totalCapacity < students.length) {
      throw new Error(`Conflict Resolution: Total students (${students.length}) exceed total hall capacity (${totalCapacity}). Please add more halls.`);
    }

    // Interleaving logic: Group by department
    let byDept = {};
    students.forEach(s => {
      byDept[s.department] = byDept[s.department] || [];
      byDept[s.department].push(s);
    });

    let keys = Object.keys(byDept);
    let mergedStudents = [];
    let hasMore = true;

    while (hasMore) {
      hasMore = false;
      for (let k of keys) {
        if (byDept[k].length > 0) {
          mergedStudents.push(byDept[k].shift());
          hasMore = true;
        }
      }
    }

    // Assign seats Column-wise
    let studentIndex = 0;
    let allocationsToSave = [];

    for (let hall of halls) {
      const { rows, cols } = hall;
      let hallFull = false;

      // Column-wise Zig-Zag (filling one vertical row/col before moving to the next)
      for (let c = 1; c <= cols; c++) {
        if (hallFull) break;
        // zig-zag: reverse row order on every alternate column? Or just top-to-bottom.
        // Prompt says "filling one vertical row before moving to the next"
        // Let's do standard top-to-bottom for each column.
        let rowStart = c % 2 === 0 ? rows : 1;
        let rowEnd = c % 2 === 0 ? 1 : rows;
        let step = c % 2 === 0 ? -1 : 1;

        for (let r = rowStart; step === 1 ? r <= rowEnd : r >= rowEnd; r += step) {
          if (studentIndex >= mergedStudents.length) {
            hallFull = true;
            break; // All students allocated
          }
          
          let student = mergedStudents[studentIndex];
          const seatNumber = `R${r}C${c}`;
          
          // Generate QR code content
          const qrPayload = JSON.stringify({
            examId,
            studentId: student._id,
            roll: student.rollNumber,
            hall: hall.name,
            seat: seatNumber
          });
          const qrCodeUrl = await QRCode.toDataURL(qrPayload);

          allocationsToSave.push({
            examId,
            studentId: student._id,
            hallId: hall._id,
            seatNumber,
            row: r,
            col: c,
            qrCodeUrl
          });

          studentIndex++;
        }
      }
      
      if (studentIndex >= mergedStudents.length) {
        break; // All students allocated, stop iterating through halls
      }
    }

    await SeatingAllocation.insertMany(allocationsToSave);

    res.status(200).json({
      message: "Seating Allocation completed successfully",
      allocatedCount: allocationsToSave.length
    });

  } catch (error) {
    res.status(500).json({ message: "Allocation Failed", error: error.message });
  }
};

const getAllocation = async (req, res) => {
  try {
    const { examId } = req.params;
    const allocations = await SeatingAllocation.find({ examId })
      .populate('studentId', 'rollNumber name department')
      .populate('hallId', 'name capacity rows cols');
    res.status(200).json(allocations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch allocation", error: error.message });
  }
};

module.exports = { generateAllocation, getAllocation };
