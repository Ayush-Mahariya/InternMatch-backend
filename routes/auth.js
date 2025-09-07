const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const {generateOTP, sendOTPEmail} = require('../utils/emailConfiguration');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists and verified' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.role = role;
      await existingUser.save();
    }
    else{
      const user = new User({ name, email, password: hashedPassword, role, isVerified: false });
      await user.save();
    }
    // Generate and send OTP
    const otp = generateOTP();
    
    // Remove any existing OTP for this email
    await OTP.deleteMany({ email });
    
    // Save new OTP
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    res.status(200).json({
      message: 'Registration successful. Please check your email for verification code.',
      email,
      needsVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
    // const token = jwt.sign(
    //   { userId: user._id, email: user.email, role: user.role },
    //   process.env.JWT_SECRET || 'fallback-secret',
    //   { expiresIn: '24h' }
    // );

    // res.status(201).json({
    //   message: 'User created successfully',
    //   token,
    //   user: { id: user._id, name: user.name, email: user.email, role: user.role }
    // });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Get basic user information
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Send OTP for email verification
router.post('/send-verification-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check if OTP was sent recently (rate limiting)
    const recentOTP = await OTP.findOne({ 
      email, 
      createdAt: { $gte: new Date(Date.now() - 60000) } // 1 minute ago
    });

    if (recentOTP) {
      return res.status(429).json({ 
        message: 'Please wait 1 minute before requesting new OTP' 
      });
    }

    // Generate and send new OTP
    const otp = generateOTP();
    
    // Remove existing OTP
    await OTP.deleteMany({ email });
    
    // Save new OTP
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();

    // Send email
    await sendOTPEmail(email, otp, user.name);

    res.json({ 
      message: 'Verification code sent to your email',
      email 
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP and activate account
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Find OTP
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) {
      // Increment failed attempts
      await OTP.updateOne({ email }, { $inc: { attempts: 1 } });
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check attempts limit
    if (otpDoc.attempts >= 5) {
      await OTP.deleteMany({ email });
      return res.status(429).json({ 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify user
    user.isVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Remove OTP after successful verification
    await OTP.deleteMany({ email });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Email verified successfully',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isVerified: user.isVerified 
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resend verification OTP
router.post('/resend-verification-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Rate limiting check
    const recentOTP = await OTP.findOne({ 
      email, 
      createdAt: { $gte: new Date(Date.now() - 60000) }
    });

    if (recentOTP) {
      return res.status(429).json({ 
        message: 'Please wait 1 minute before requesting new OTP' 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Remove existing OTP
    await OTP.deleteMany({ email });
    
    // Save new OTP
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();

    // Send email
    await sendOTPEmail(email, otp, user.name);

    res.json({ 
      message: 'New verification code sent to your email' 
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
