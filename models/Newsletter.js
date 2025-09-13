const mongoose = require('mongoose');

// Newsletter Subscriber Schema
const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'website'
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  }
});

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
