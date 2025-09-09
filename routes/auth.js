const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const PasswordResetToken = require('../models/PasswordResetToken');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const {generateOTP, sendOTPEmail, sendPasswordResetEmail} = require('../utils/emailConfiguration');

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email address exists' });
    }

    // Check if email is verified (optional - you can remove this if not needed)
    if (!user.isVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email first before resetting password',
        needsVerification: true,
        email: user.email 
      });
    }

    // Rate limiting check - prevent multiple requests
    const recentToken = await PasswordResetToken.findOne({
      userId: user._id,
      createdAt: { $gte: new Date(Date.now() - 60000) } // 1 minute ago
    });

    if (recentToken) {
      return res.status(429).json({ 
        message: 'Please wait 1 minute before requesting another password reset' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Remove any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Create new reset token
    const tokenDoc = new PasswordResetToken({
      userId: user._id,
      token: hashedToken
    });
    await tokenDoc.save();

    // Send email
    await sendPasswordResetEmail(email, resetToken, user.name, user._id);

    res.json({ 
      message: 'Password reset link sent to your email',
      email: email
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify password reset token
router.get('/verify-reset-token/:token/:userId', async (req, res) => {
  try {
    const { token, userId } = req.params;

    if (!token || !userId) {
      return res.status(400).json({ message: 'Token and user ID are required' });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find token in database
    const tokenDoc = await PasswordResetToken.findOne({
      userId: userId,
      token: hashedToken
    });

    if (!tokenDoc) {
      return res.status(400).json({ 
        message: 'Invalid or expired password reset token',
        expired: true 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Token is valid',
      valid: true,
      email: user.email 
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, userId, newPassword } = req.body;

    if (!token || !userId || !newPassword) {
      return res.status(400).json({ message: 'Token, user ID, and new password are required' });
    }

    // Validate password strength (optional)
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find and verify token
    const tokenDoc = await PasswordResetToken.findOne({
      userId: userId,
      token: hashedToken
    });

    if (!tokenDoc) {
      return res.status(400).json({ 
        message: 'Invalid or expired password reset token',
        expired: true 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete the used reset token
    await PasswordResetToken.deleteMany({ userId: userId });

    // Send confirmation email
    try {
      const confirmationMailOptions = {
        from: {
          name: 'InternMatch',
          address: process.env.EMAIL_USER
        },
        to: user.email,
        subject: 'InternMatch - Password Changed Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Changed Successfully</h2>
            <p>Hi ${user.name},</p>
            <p>Your password has been successfully changed for your InternMatch account.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>For security reasons, you may want to:</p>
            <ul>
              <li>Check your recent account activity</li>
              <li>Update passwords on other accounts if you used the same password</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
            <hr>
            <p style="color: #666; font-size: 12px;">© 2025 InternMatch. All rights reserved.</p>
          </div>
        `
      };
      
      await transporter.sendMail(confirmationMailOptions);
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
      // Don't fail the request if confirmation email fails
    }

    res.json({ 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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
