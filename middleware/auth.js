// middleware/auth.js
const { auth } = require('../config/firebase');
const User = require('../models/User');

// Firebase Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user from MongoDB using Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add both Firebase token data and MongoDB user to request
    req.user = {
      userId: user._id,
      firebaseUid: decodedToken.uid,
      email: user.email,
      role: user.role,
      name: user.name,
      isVerified: user.isVerified
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    
    res.status(403).json({ message: 'Invalid authentication token' });
  }
};

// Optional: Role-based middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = { 
  authenticateToken, 
  requireRole 
};
