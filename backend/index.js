require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/utils/db');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
const authRoutes = require('./src/services/auth-service/auth.routes');
const uploadRoutes = require('./src/services/upload-service/upload.routes');
const allocationRoutes = require('./src/services/allocation-service/allocation.routes');
const allocationController = require('./src/services/allocation-service/allocation.controller');
const { isAdmin } = require('./src/api-gateway/middleware/auth.middleware');

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Explicit static routes for Express 5 compatibility
app.get('/api/stats', isAdmin, allocationController.getSystemStats);
app.get('/api/allocations/all', isAdmin, allocationController.getAllAllocations);

app.use('/api/allocation', allocationRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
