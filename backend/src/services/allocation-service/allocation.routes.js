const express = require('express');
const router = express.Router();
const allocationController = require('./allocation.controller');
const { isAdmin } = require('../../api-gateway/middleware/auth.middleware');

router.post('/generate', isAdmin, allocationController.generateAllocation);
router.get('/:examId', isAdmin, allocationController.getAllocation);

module.exports = router;
