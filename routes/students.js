const express = require('express');
const Student = require('../models/Student');
const { authenticateToken } = require('../middleware/auth');
const { calculateProfileCompletion } = require('../utils/profileCompletion');
const router = express.Router();

// Get student profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).populate('userId');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Calculate and update profile completion
    const profileCompletion = calculateProfileCompletion(student);
    
    // Update profile completion in database if different
    if (student.profileCompletion !== profileCompletion) {
      student.profileCompletion = profileCompletion;
      await student.save();
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create/Update student profile
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const studentData = { ...req.body, userId: req.user.userId };
    
    let student = await Student.findOne({ userId: req.user.userId });
    if (student) {
      student = await Student.findOneAndUpdate(
        { userId: req.user.userId },
        { ...studentData, updatedAt: new Date() },
        { new: true }
      );
    } else {
      student = new Student(studentData);
      await student.save();
    }

    // Calculate and update profile completion
    const profileCompletion = calculateProfileCompletion(student);
    student.profileCompletion = profileCompletion;
    await student.save();
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update skills
router.put('/skills', authenticateToken, async (req, res) => {
  try {
    const { skills } = req.body;
    let student = await Student.findOneAndUpdate(
      { userId: req.user.userId },
      { skills, updatedAt: new Date() },
      { new: true }
    );

    // Calculate and update profile completion
    const profileCompletion = calculateProfileCompletion(student);
    student.profileCompletion = profileCompletion;
    await student.save();

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new route to get profile completion specifically
router.get('/profile-completion', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const profileCompletion = calculateProfileCompletion(student);
    
    // Update profile completion in database
    student.profileCompletion = profileCompletion;
    await student.save();

    res.json({
      profileCompletion,
      completionDetails: getCompletionDetails(student)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to get detailed completion status
const getCompletionDetails = (student) => {
  const sections = {
    basicInfo: {
      completed: ['university', 'major', 'graduationYear', 'gpa'].every(field => 
        student[field] !== null && student[field] !== undefined && student[field] !== ''
      ),
      fields: ['university', 'major', 'graduationYear', 'gpa']
    },
    skills: {
      completed: student.skills && student.skills.length > 0,
      count: student.skills ? student.skills.length : 0
    },
    projects: {
      completed: student.projects && student.projects.length > 0,
      count: student.projects ? student.projects.length : 0
    },
    certifications: {
      completed: student.certifications && student.certifications.length > 0,
      count: student.certifications ? student.certifications.length : 0
    },
    experience: {
      completed: student.experience && student.experience.length > 0,
      count: student.experience ? student.experience.length : 0
    },
    resume: {
      completed: student.resume && student.resume.trim() !== '',
      uploaded: !!student.resume
    },
    portfolio: {
      completed: student.portfolio && student.portfolio.trim() !== '',
      hasLink: !!student.portfolio
    },
    linkedIn: {
      completed: student.linkedIn && student.linkedIn.trim() !== '',
      hasLink: !!student.linkedIn
    },
    github: {
      completed: student.github && student.github.trim() !== '',
      hasLink: !!student.github
    },
    skillAssessments: {
      completed: student.skillAssessments && student.skillAssessments.length > 0,
      count: student.skillAssessments ? student.skillAssessments.length : 0
    },
    preferences: {
      completed: student.preferences && ['jobTypes', 'locations', 'industries', 'salaryExpectation'].some(field => {
        const value = student.preferences[field];
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && value !== '';
      }),
      fields: student.preferences || {}
    }
  };

  return sections;
};

// Search students (for companies)
router.get('/search', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { skills, university, experience, page = 1, limit = 10 } = req.query;
    const query = { status: 'active' };

    if (skills) {
      query.skills = { $in: skills.split(',') };
    }
    if (university) {
      query.university = new RegExp(university, 'i');
    }

    const students = await Student.find(query)
      .populate('userId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
