const mongoose = require('mongoose');
const Student = require('../../models/Student');
const Hall = require('../../models/Hall');
const SeatingAllocation = require('../../models/SeatingAllocation');

const generateAllocation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { examId } = req.body;
    if (!examId) return res.status(400).json({ message: "examId is required" });

    // Check if allocation already exists
    const existing = await SeatingAllocation.findOne({ examId }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Allocation already exists for this Exam ID" });
    }

    const students = await Student.find({}).sort({ rollNumber: 1 }).session(session);
    const halls = await Hall.find({}).session(session);

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

      for (let c = 1; c <= cols; c++) {
        if (hallFull) break;
        let rowStart = c % 2 === 0 ? rows : 1;
        let rowEnd = c % 2 === 0 ? 1 : rows;
        let step = c % 2 === 0 ? -1 : 1;

        for (let r = rowStart; step === 1 ? r <= rowEnd : r >= rowEnd; r += step) {
          if (studentIndex >= mergedStudents.length) {
            hallFull = true;
            break;
          }
          
          let student = mergedStudents[studentIndex];
          const seatNumber = `R${r}C${c}`;
          
          allocationsToSave.push({
            examId,
            studentId: student._id,
            hallId: hall._id,
            seatNumber,
            row: r,
            col: c
          });

          studentIndex++;
        }
      }
      
      if (studentIndex >= mergedStudents.length) break;
    }

    await SeatingAllocation.insertMany(allocationsToSave, { session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Seating Allocation completed successfully",
      allocatedCount: allocationsToSave.length
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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

const getAllAllocations = async (req, res) => {
  try {
    console.log('>>> GET_ALL_ALLOCATIONS CALLED <<<');
    const allocations = await SeatingAllocation.find({}).populate('studentId').populate('hallId');
    console.log('Allocations count:', allocations.length);
    res.status(200).json(allocations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch allocations", error: error.message });
  }
};

const getSystemStats = async (req, res) => {
  try {
    console.log('>>> GET_SYSTEM_STATS CALLED <<<');
    const studentCount = await Student.countDocuments();
    const hallCount = await Hall.countDocuments();
    const allocationDocs = await SeatingAllocation.find({});
    const uniqueExams = [...new Set(allocationDocs.map(a => a.examId))];
    
    const stats = {
      studentCount,
      hallCount,
      examCount: uniqueExams.length,
      exams: uniqueExams
    };
    
    console.log('Stats response:', stats);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

const deleteAllocation = async (req, res) => {
  try {
    const { examId } = req.params;
    await SeatingAllocation.deleteMany({ examId });
    res.status(200).json({ message: "Allocation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete allocation", error: error.message });
  }
};

module.exports = { generateAllocation, getAllocation, getAllAllocations, getSystemStats, deleteAllocation };
