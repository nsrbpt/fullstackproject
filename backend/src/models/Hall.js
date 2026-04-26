const mongoose = require('mongoose');

const HallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  rows: {
    type: Number,
    required: true
  },
  cols: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Hall', HallSchema);
