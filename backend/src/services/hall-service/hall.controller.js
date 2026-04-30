const mongoose = require('mongoose');
const Hall = require('../../models/Hall');
const SeatingAllocation = require('../../models/SeatingAllocation');

const validateHallPayload = (payload, isUpdate = false) => {
  const errors = [];
  const name = payload.name?.trim();
  const rows = Number(payload.rows);
  const cols = Number(payload.cols);
  const capacity = payload.capacity !== undefined ? Number(payload.capacity) : undefined;

  if (!isUpdate || payload.name !== undefined) {
    if (!name) errors.push('name is required');
  }

  if (!isUpdate || payload.rows !== undefined) {
    if (!Number.isInteger(rows) || rows <= 0) errors.push('rows must be a positive integer');
  }

  if (!isUpdate || payload.cols !== undefined) {
    if (!Number.isInteger(cols) || cols <= 0) errors.push('cols must be a positive integer');
  }

  if (capacity !== undefined && (!Number.isInteger(capacity) || capacity <= 0)) {
    errors.push('capacity must be a positive integer when provided');
  }

  if (Number.isInteger(rows) && Number.isInteger(cols) && rows > 0 && cols > 0 && capacity !== undefined) {
    if (capacity !== rows * cols) {
      errors.push('capacity must equal rows * cols');
    }
  }

  return {
    errors,
    normalized: {
      name,
      rows: Number.isInteger(rows) ? rows : undefined,
      cols: Number.isInteger(cols) ? cols : undefined,
      capacity: Number.isInteger(capacity) ? capacity : undefined,
    },
  };
};

const getHalls = async (req, res) => {
  try {
    const halls = await Hall.find({}).sort({ name: 1 });
    res.status(200).json(halls);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch halls', error: error.message });
  }
};

const createHall = async (req, res) => {
  try {
    const { errors, normalized } = validateHallPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const hall = await Hall.create({
      name: normalized.name,
      rows: normalized.rows,
      cols: normalized.cols,
      capacity: normalized.capacity ?? normalized.rows * normalized.cols,
    });

    res.status(201).json({ message: 'Hall created successfully', hall });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Hall name already exists' });
    }
    res.status(500).json({ message: 'Failed to create hall', error: error.message });
  }
};

const updateHall = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid hall id' });
    }

    const existing = await Hall.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    const { errors, normalized } = validateHallPayload(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const nextRows = normalized.rows ?? existing.rows;
    const nextCols = normalized.cols ?? existing.cols;
    const nextCapacity = normalized.capacity ?? nextRows * nextCols;

    if (nextCapacity !== nextRows * nextCols) {
      return res.status(400).json({ message: 'capacity must equal rows * cols' });
    }

    const hasAllocations = await SeatingAllocation.exists({ hallId: id });
    const changingGeometry = nextRows !== existing.rows || nextCols !== existing.cols;
    if (hasAllocations && changingGeometry) {
      return res.status(409).json({
        message: 'Cannot change rows/cols for a hall that already has seating allocations',
      });
    }

    existing.name = normalized.name ?? existing.name;
    existing.rows = nextRows;
    existing.cols = nextCols;
    existing.capacity = nextCapacity;
    await existing.save();

    res.status(200).json({ message: 'Hall updated successfully', hall: existing });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Hall name already exists' });
    }
    res.status(500).json({ message: 'Failed to update hall', error: error.message });
  }
};

const deleteHall = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid hall id' });
    }

    const hasAllocations = await SeatingAllocation.exists({ hallId: id });
    if (hasAllocations) {
      return res.status(409).json({
        message: 'Cannot delete hall with existing seating allocations. Remove related allocations first.',
      });
    }

    const deleted = await Hall.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    res.status(200).json({ message: 'Hall deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete hall', error: error.message });
  }
};

module.exports = { getHalls, createHall, updateHall, deleteHall };
