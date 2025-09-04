const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  university: String,
  major: String,
  graduationYear: Number,
  gpa: Number,
  skills: [String],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    link: String,
    completedDate: Date
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    credentialId: String
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  resume: String,
  portfolio: String,
  linkedIn: String,
  github: String,
  skillAssessments: [{
    skill: String,
    score: Number,
    maxScore: Number,
    completedDate: Date,
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] }
  }],
  preferences: {
    jobTypes: [String],
    locations: [String],
    industries: [String],
    salaryExpectation: Number
  },
  status: { type: String, enum: ['active', 'hired', 'inactive'], default: 'active' },
  profileCompletion: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
