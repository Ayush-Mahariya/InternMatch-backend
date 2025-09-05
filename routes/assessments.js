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

// Create a new assessment
router.post('/create', authenticateToken, async (req, res) => {
  try {
    // Only allow admin or company roles to create assessments
    if (!['admin', 'company'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins and companies can create assessments' });
    }

    const { title, skill, questions, duration, passingScore } = req.body;

    // Input validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions array is required and cannot be empty' });
    }

    if (!duration || typeof duration !== 'number' || duration <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number (in minutes)' });
    }

    if (typeof passingScore !== 'number' || passingScore < 0) {
      return res.status(400).json({ message: 'Passing score must be a non-negative number' });
    }

    // Validate each question structure
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.question || question.question.trim() === '') {
        return res.status(400).json({ message: `Question ${i + 1}: Question text is required` });
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        return res.status(400).json({ message: `Question ${i + 1}: At least 2 options are required` });
      }

      if (typeof question.correctAnswer !== 'number' || 
          question.correctAnswer < 0 || 
          question.correctAnswer >= question.options.length) {
        return res.status(400).json({ 
          message: `Question ${i + 1}: Correct answer must be a valid option index` 
        });
      }

      if (question.difficulty && !['easy', 'medium', 'hard'].includes(question.difficulty)) {
        return res.status(400).json({ 
          message: `Question ${i + 1}: Difficulty must be 'easy', 'medium', or 'hard'` 
        });
      }
    }

    // Create the React assessment
    const assessment = new Assessment({
      title: title.trim(),
      skill: skill,
      questions: questions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty || 'medium'
      })),
      duration,
      passingScore,
      createdBy: req.user.userId
    });

    await assessment.save();

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment: {
        id: assessment._id,
        title: assessment.title,
        skill: assessment.skill,
        totalQuestions: assessment.questions.length,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        createdAt: assessment.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating React assessment:', error);
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
