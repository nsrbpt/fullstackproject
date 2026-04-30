const express = require('express');
const router = express.Router();
const hallController = require('./hall.controller');
const { isAdmin } = require('../../api-gateway/middleware/auth.middleware');

router.get('/', isAdmin, hallController.getHalls);
router.post('/', isAdmin, hallController.createHall);
router.put('/:id', isAdmin, hallController.updateHall);
router.delete('/:id', isAdmin, hallController.deleteHall);

module.exports = router;
