const express = require('express');
const Job = require('../models/Job');
const Company = require('../models/Company');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, skills, location, type } = req.query;
    const query = { status: 'active' };
    
    if (skills) query.skills = { $in: skills.split(',') };
    if (location) query.location = new RegExp(location, 'i');
    if (type) query.type = type;

    const jobs = await Job.find(query)
      .populate('companyId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create job
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Only companies can post jobs' });
    }

    const company = await Company.findOne({ userId: req.user.userId });
    const jobData = { ...req.body, companyId: company._id };
    
    const job = new Job(jobData);
    await job.save();
    
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('companyId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
