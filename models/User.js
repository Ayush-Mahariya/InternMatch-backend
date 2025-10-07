// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'company', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: Date.now },
  profilePicture: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  
  // Firebase handles passwords - remove password field
  // password: { type: String, required: true }, // REMOVED
  // emailVerifiedAt: { type: Date, default: null }, // REMOVED - Firebase handles this
});

module.exports = mongoose.model('User', userSchema);
