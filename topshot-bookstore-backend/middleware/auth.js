const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Main authentication middleware
 * Verifies JWT token from either Authorization header or cookie
 */
const auth = async (req, res, next) => {
  try {
    // 1. Get token from header or cookie
    let token = req.header('Authorization')?.replace('Bearer ', '') || 
               req.cookies?.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find active user
    const user = await User.findOne({ 
      _id: decoded.id,
      isActive: true
    }).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }

    // 4. Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Session expired, please login again' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid authentication token' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

/**
 * Admin authorization middleware
 * Must be used after auth middleware
 */
const admin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  
  res.status(403).json({ 
    success: false,
    message: 'Admin privileges required' 
  });
};

/**
 * Optional authentication middleware
 * Populates req.user if valid token exists, but doesn't block access
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '') || 
               req.cookies?.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
          _id: decoded.id,
          isActive: true
        }).select('-password -refreshToken');
        
        if (user) {
          req.user = user;
          req.token = token;
        }
      } catch (error) {
        console.log('Optional auth token validation failed:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

module.exports = { 
  auth,    // Strict authentication (blocks if invalid)
  admin,   // Admin role check (must be used after auth)
  optionalAuth // Non-blocking authentication
};