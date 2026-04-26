const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('./upload.controller');
const { isAdmin } = require('../../api-gateway/middleware/auth.middleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/students', isAdmin, upload.single('file'), uploadController.uploadStudents);

module.exports = router;
