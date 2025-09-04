const express = require('express');
const Assessment = require('../models/Assessment');
const Student = require('../models/Student');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all assessments
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find().select('-questions.correctAnswer');
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Take assessment
router.post('/:id/take', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can take assessments' });
    }

    const { answers } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    let score = 0;
    assessment.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const student = await Student.findOne({ userId: req.user.userId });
    const assessmentResult = {
      skill: assessment.skill,
      score: score,
      maxScore: assessment.questions.length,
      completedDate: new Date(),
      level: score >= assessment.questions.length * 0.8 ? 'Advanced' : 
             score >= assessment.questions.length * 0.6 ? 'Intermediate' : 'Beginner'
    };

    // Update student's skill assessments
    const existingIndex = student.skillAssessments.findIndex(sa => sa.skill === assessment.skill);
    if (existingIndex !== -1) {
      student.skillAssessments[existingIndex] = assessmentResult;
    } else {
      student.skillAssessments.push(assessmentResult);
    }

    await student.save();

    res.json({
      score,
      maxScore: assessment.questions.length,
      percentage: (score / assessment.questions.length) * 100,
      level: assessmentResult.level,
      passed: score >= assessment.passingScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
