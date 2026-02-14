import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import createError from 'http-errors';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies or Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      throw createError(401, 'Not authorized, no token');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw createError(401, 'User not found');
    }
    
    req.user = user;
    next();
  } catch (error) {
    next(createError(401, 'Not authorized, token failed'));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'Not authorized to access this route'));
    }
    next();
  };
};