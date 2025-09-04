const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  skills: [String],
  location: String,
  duration: String,
  stipend: Number,
  type: { type: String, enum: ['full-time', 'part-time', 'remote'], default: 'full-time' },
  positions: { type: Number, default: 1 },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  applications: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    appliedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'], default: 'applied' },
    notes: String
  }],
  createdAt: { type: Date, default: Date.now },
  deadline: Date
});

module.exports = mongoose.model('Job', jobSchema);
