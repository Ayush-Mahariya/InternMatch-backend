const express = require('express');
const Student = require('../models/Student');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Upload resume
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const student = await Student.findOneAndUpdate(
      { userId: req.user.userId },
      { resume: req.file.path, updatedAt: new Date() },
      { new: true }
    );

    res.json({ message: 'Resume uploaded successfully', path: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
