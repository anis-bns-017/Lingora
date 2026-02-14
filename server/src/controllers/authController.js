import User from '../models/User.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/httpToken.js';
import createError from 'http-errors';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, nativeLanguage } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw createError(400, 'User already exists');
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      nativeLanguage
    });
    
    // Generate token
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        nativeLanguage: user.nativeLanguage,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw createError(401, 'Invalid credentials');
    }
    
    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw createError(401, 'Invalid credentials');
    }
    
    // Update online status
    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    
    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        nativeLanguage: user.nativeLanguage,
        learningLanguages: user.learningLanguages,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        isOnline: false,
        lastSeen: Date.now()
      });
    }
    
    clearTokenCookie(res);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};