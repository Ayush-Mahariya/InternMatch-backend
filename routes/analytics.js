const express = require('express');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    let analytics = {};

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.userId });
      const applications = await Application.find({ studentId: student._id });
      
      analytics = {
        totalApplications: applications.length,
        activeApplications: applications.filter(app => app.status === 'applied').length,
        shortlistedApplications: applications.filter(app => app.status === 'shortlisted').length,
        profileCompletion: student.profileCompletion || 0,
        skillsCount: student.skills.length,
        assessmentsPassed: student.skillAssessments.length
      };
    } else if (req.user.role === 'company') {
      const company = await Company.findOne({ userId: req.user.userId });
      const jobs = await Job.find({ companyId: company._id });
      const applications = await Application.find({ companyId: company._id });
      
      analytics = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'active').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'applied').length,
        hiredCandidates: applications.filter(app => app.status === 'hired').length
      };
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
