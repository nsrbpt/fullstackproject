const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SeatingAllocationSchema = new Schema({
  examId: {
    type: String, // E.g., 'MIDTERM_2026_CS'
    required: true,
    index: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  hallId: {
    type: Schema.Types.ObjectId,
    ref: 'Hall',
    required: true
  },
  seatNumber: {
    type: String, // e.g., 'R1C1'
    required: true
  },
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  },
  qrCodeUrl: {
    type: String
  }
}, { timestamps: true });

// Compound unique index to prevent double-seating
SeatingAllocationSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('SeatingAllocation', SeatingAllocationSchema);
