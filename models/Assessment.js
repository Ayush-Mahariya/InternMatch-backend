const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skill: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
  }],
  totalQuestions: Number,
  questionsForEachTest: {type: Number, default: 20},
  duration: Number, // in minutes
  passingScore: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
