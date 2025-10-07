// routes/auth.js
const express = require('express');
const { auth } = require('../config/firebase');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// ============================================
// FIREBASE AUTHENTICATION ROUTES
// ============================================

// Register/Login with Firebase (handles both new users and existing users)
router.post('/firebase-auth', async (req, res) => {
  try {
    const { firebaseToken, userData } = req.body;
    
    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is required' });
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(firebaseToken);
    const { uid, email, name, email_verified, picture } = decodedToken;

    console.log('🔥 Firebase Auth - User:', { uid, email, name, email_verified });

    // Check if user exists in MongoDB
    let user = await User.findOne({ firebaseUid: uid });
    let isNewUser = false;
    
    if (!user) {
      // Check if email already exists (migration case)
      const existingEmailUser = await User.findOne({ email });
      
      if (existingEmailUser) {
        // Update existing user with Firebase UID
        existingEmailUser.firebaseUid = uid;
        existingEmailUser.isVerified = email_verified;
        existingEmailUser.profilePicture = picture || existingEmailUser.profilePicture;
        existingEmailUser.lastLoginAt = new Date();
        await existingEmailUser.save();
        user = existingEmailUser;
        console.log('✅ Migrated existing user to Firebase');
      } else {
        // Create completely new user
        if (!userData || !userData.role) {
          return res.status(400).json({
            message: 'User role is required for new registrations'
          });
        }

        // Fallback name if Firebase doesn't provide displayName and client didn't send one
        const fallbackName = name || (userData && userData.name) || (email ? email.split('@')[0] : 'User');

        user = new User({
          firebaseUid: uid,
          name: fallbackName,
          email: email,
          role: userData.role,
          isVerified: email_verified,
          profilePicture: picture || null,
          createdAt: new Date(),
          lastLoginAt: new Date()
        });
        await user.save();
        isNewUser = true;

        console.log('✅ Created new user:', user.email);

        // Create role-specific profile
        if (userData.role === 'student') {
          const studentProfile = new Student({
            userId: user._id,
            profileCompletion: 10,
            status: 'active'
          });
          await studentProfile.save();
          console.log('✅ Created student profile');
        } else if (userData.role === 'company') {
          const companyProfile = new Company({
            userId: user._id,
            companyName: userData.companyName || '',
            verificationStatus: 'pending'
          });
          await companyProfile.save();
          console.log('✅ Created company profile');
        }
      }
    } else {
      // Update existing Firebase user
      user.isVerified = email_verified;
      user.lastLoginAt = new Date();
      user.profilePicture = picture || user.profilePicture;
      await user.save();
      console.log('✅ Updated existing Firebase user');
    }

    // Return success response
    res.json({
      message: isNewUser ? 'Registration successful' : 'Login successful',
      isNewUser,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('🔥 Firebase auth error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    } else if (error.code === 'auth/argument-error') {
      return res.status(400).json({ message: 'Invalid token format' });
    }
    
    res.status(500).json({ 
      message: 'Authentication failed', 
      error: error.message 
    });
  }
});

// Explicit endpoint to reflect email verification status from Firebase into MongoDB
router.post('/verify-email', async (req, res) => {
  try {
    const { firebaseToken, userData } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is required' });
    }

    // Verify Firebase token and read latest email verification flag
    const decodedToken = await auth.verifyIdToken(firebaseToken, true /* checkRevoked */);
    const { uid, email_verified, email, name, picture } = decodedToken;

    // Find user by Firebase UID
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      // Allow creating the user during verification if role is provided
      if (!userData || !userData.role) {
        return res.status(404).json({
          message: 'User not found for this Firebase UID. Provide userData.role to create.'
        });
      }

      const fallbackName = name || (userData && userData.name) || (email ? email.split('@')[0] : 'User');
      user = new User({
        firebaseUid: uid,
        name: fallbackName,
        email: email,
        role: userData.role,
        isVerified: !!email_verified,
        profilePicture: picture || null,
        createdAt: new Date(),
        lastLoginAt: new Date()
      });
      await user.save();
    }

    // Update verification status if changed
    const wasVerified = user.isVerified;
    user.isVerified = !!email_verified;
    await user.save();

    return res.json({
      message: wasVerified === user.isVerified && user.isVerified
        ? 'Email already verified'
        : user.isVerified
          ? 'Email verified successfully'
          : 'Email not verified yet',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Email verification sync error:', error);
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ message: 'Token revoked', code: 'TOKEN_REVOKED' });
    }
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(500).json({ message: 'Failed to verify email', error: error.message });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (profilePicture) user.profilePicture = profilePicture;
    
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user account (deletes from both Firebase and MongoDB)
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const { firebaseUid, userId } = req.user;

    // Delete from Firebase Auth
    await auth.deleteUser(firebaseUid);
    console.log('✅ Deleted Firebase user');

    // Delete from MongoDB
    const user = await User.findByIdAndDelete(userId);
    
    if (user) {
      // Delete associated profiles
      await Student.findOneAndDelete({ userId: user._id });
      await Company.findOneAndDelete({ userId: user._id });
      console.log('✅ Deleted MongoDB user and profiles');
    }

    res.json({ 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      message: 'Failed to delete account', 
      error: error.message 
    });
  }
});

// ============================================
// UTILITY ROUTES
// ============================================

// Check if email is available
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    
    res.json({ 
      available: !user,
      message: user ? 'Email already registered' : 'Email available'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics (for admin)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const students = await User.countDocuments({ role: 'student' });
    const companies = await User.countDocuments({ role: 'company' });

    res.json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      students,
      companies,
      admins: totalUsers - students - companies
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
