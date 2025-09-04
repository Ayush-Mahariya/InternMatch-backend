const express = require('express');
const Company = require('../models/Company');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get company profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.userId }).populate('userId');
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create/Update company profile
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const companyData = { ...req.body, userId: req.user.userId };
    
    let company = await Company.findOne({ userId: req.user.userId });
    if (company) {
      company = await Company.findOneAndUpdate(
        { userId: req.user.userId },
        { ...companyData, updatedAt: new Date() },
        { new: true }
      );
    } else {
      company = new Company(companyData);
      await company.save();
    }
    
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
