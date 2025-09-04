const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  industry: String,
  size: String,
  description: String,
  website: String,
  location: String,
  contactPerson: String,
  contactPhone: String,
  logo: String,
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', companySchema);
