const express = require('express');
const NewsletterSubscriber = require('../models/Newsletter');
const router = express.Router();

// Backend route: /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email, source } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        message: 'Valid email address is required'
      });
    }

    // Check if email already exists
    const existingSubscriber = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingSubscriber) {
      return res.status(409).json({
        message: 'Email is already subscribed to our newsletter'
      });
    }

    // Save to database
    const subscriber = new NewsletterSubscriber({
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      source: source || 'website',
      status: 'active'
    });
    await subscriber.save();

    // Optional: Send confirmation email
    // await sendConfirmationEmail(email);

    res.status(200).json({
      message: 'Successfully subscribed to newsletter',
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      message: 'Failed to subscribe. Please try again later.'
    });
  }
});

module.exports = router;