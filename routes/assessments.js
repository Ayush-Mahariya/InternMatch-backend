const express = require('express');
const Assessment = require('../models/Assessment');
const Student = require('../models/Student');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all assessments (without questions) - Updated
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find().select('-questions'); // Exclude questions
    
    const assessmentDetails = assessments.map(assessment => ({
      _id: assessment._id,
      title: assessment.title,
      skill: assessment.skill,
      duration: assessment.duration,
      passingScore: assessment.passingScore,
      questionsForEachTest: assessment.questionsForEachTest || 20,
      totalQuestions: assessment.totalQuestions || 0, // Safe access
      createdAt: assessment.createdAt,
      createdBy: assessment.createdBy
    }));
    
    res.json(assessmentDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get random questions for a specific assessment - New API
router.get('/:id/start', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can take assessments' });
    }

    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const questionsForEachTest = assessment.questionsForEachTest || 20;
    const totalQuestions = assessment.totalQuestions;
    
    // If total questions are less than or equal to questionsForEachTest, return all
    if (totalQuestions <= questionsForEachTest) {
      const questionsWithoutAnswers = assessment.questions.map((question, index) => ({
        questionIndex: index, // Add index for answer submission
        question: question.question,
        options: question.options,
        difficulty: question.difficulty
      }));
      
      return res.json({
        assessmentId: assessment._id,
        title: assessment.title,
        skill: assessment.skill,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        questionsForEachTest: questionsForEachTest,
        questions: questionsWithoutAnswers
      });
    }
    
    // Generate random indices for question selection
    const randomIndices = [];
    const availableIndices = Array.from({ length: totalQuestions }, (_, i) => i);
    
    // Fisher-Yates shuffle algorithm for better randomization
    for (let i = 0; i < questionsForEachTest; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      randomIndices.push(availableIndices[randomIndex]);
      availableIndices.splice(randomIndex, 1);
    }
    
    // Select random questions and remove correct answers
    const randomQuestions = randomIndices.map((originalIndex, displayIndex) => ({
      questionIndex: originalIndex, // Original index for answer validation
      displayIndex: displayIndex,   // Display order (0, 1, 2, ...)
      question: assessment.questions[originalIndex].question,
      options: assessment.questions[originalIndex].options,
      difficulty: assessment.questions[originalIndex].difficulty
    }));
    
    res.json({
      assessmentId: assessment._id,
      title: assessment.title,
      skill: assessment.skill,
      duration: assessment.duration,
      passingScore: assessment.passingScore,
      questionsForEachTest: questionsForEachTest,
      questions: randomQuestions
    });
    
  } catch (error) {
    console.error('Error starting assessment:', error);
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

    const { title, skill, questions, duration, passingScore, questionsForEachTest } = req.body;

    // Input validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions array is required and cannot be empty' });
    }
    
    if (questionsForEachTest >= questions.length || questionsForEachTest <= 0) {
      return res.status(400).json({ message: `Questions for each Test should be between 1 to ${questions.length}` });
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

    // Create the assessment
    const assessment = new Assessment({
      title: title.trim(),
      skill: skill,
      questions: questions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty || 'medium'
      })),
      questionsForEachTest,
      totalQuestions: questions.length,
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
        questionsForEachTest: assessment.questionsForEachTest,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        createdAt: assessment.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit assessment - Updated to handle random questions
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can take assessments' });
    }

    const { answers } = req.body; // answers should be { questionIndex: selectedOption }
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Answers object is required' });
    }

    let score = 0;
    let totalAnswered = 0;
    
    // Check answers using original question indices
    Object.keys(answers).forEach(questionIndex => {
      const qIndex = parseInt(questionIndex);
      const selectedAnswer = answers[questionIndex];
      
      if (qIndex >= 0 && qIndex < assessment.questions.length) {
        totalAnswered++;
        if (selectedAnswer === assessment.questions[qIndex].correctAnswer) {
          score++;
        }
      }
    });

    const questionsForEachTest = assessment.questionsForEachTest || 20;
    const student = await Student.findOne({ userId: req.user.userId });
    
    const assessmentResult = {
      skill: assessment.skill,
      score: score,
      maxScore: questionsForEachTest,
      completedDate: new Date(),
      level: score >= questionsForEachTest * 0.9 ? 'Advanced' : 
             score >= questionsForEachTest * 0.7 ? 'Intermediate' : 'Beginner'
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
      maxScore: questionsForEachTest,
      totalAnswered,
      percentage: (score / questionsForEachTest) * 100,
      level: assessmentResult.level,
      passed: score >= assessment.passingScore
    });
    
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
