const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'], default: 'applied' },
  appliedDate: { type: Date, default: Date.now },
  coverLetter: String,
  notes: String,
  interviewDate: Date,
  feedback: String
});

module.exports = mongoose.model('Application', applicationSchema);
