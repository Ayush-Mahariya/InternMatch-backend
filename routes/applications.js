const express = require('express');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Create application
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply for jobs' });
    }

    const { jobId, coverLetter } = req.body;
    const student = await Student.findOne({ userId: req.user.userId });
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      studentId: student._id,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    const application = new Application({
      studentId: student._id,
      jobId: jobId,
      companyId: job.companyId,
      coverLetter
    });

    await application.save();
    
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student applications
router.get('/student', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await Student.findOne({ userId: req.user.userId });
    const applications = await Application.find({ studentId: student._id })
      .populate('jobId')
      .populate('companyId')
      .sort({ appliedDate: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get company applications
router.get('/company', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const company = await Company.findOne({ userId: req.user.userId });
    const applications = await Application.find({ companyId: company._id })
      .populate('studentId')
      .populate('jobId')
      .sort({ appliedDate: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
