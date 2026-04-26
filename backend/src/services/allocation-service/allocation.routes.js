const express = require('express');
const router = express.Router();
const allocationController = require('./allocation.controller');
const { isAdmin } = require('../../api-gateway/middleware/auth.middleware');

// Static routes MUST come before parameterized routes
router.get('/stats', isAdmin, allocationController.getSystemStats);
router.get('/all', isAdmin, allocationController.getAllAllocations);
router.post('/generate', isAdmin, allocationController.generateAllocation);
router.get('/:examId', isAdmin, allocationController.getAllocation);

module.exports = router;
