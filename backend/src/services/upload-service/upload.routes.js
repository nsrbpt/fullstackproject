const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('./upload.controller');
const { isAdmin } = require('../../api-gateway/middleware/auth.middleware');

const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		const name = file.originalname?.toLowerCase() || '';
		const allowed = ['.txt', '.xlsx', '.xls'];
		if (allowed.some((ext) => name.endsWith(ext))) {
			cb(null, true);
			return;
		}
		cb(new Error('Only .txt, .xlsx, and .xls files are allowed'));
	},
});

router.post('/students', isAdmin, upload.single('file'), uploadController.uploadStudents);

module.exports = router;
