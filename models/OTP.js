const mongoose = require('mongoose');

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 minutes expiry
  verified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 }
});

module.exports = mongoose.model('OTP', otpSchema);
