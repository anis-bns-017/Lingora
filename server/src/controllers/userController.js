import User from '../models/User.js';
import Room from '../models/Room.js';
import createError from 'http-errors';
import { asyncHandler } from '../middleware/errorHandler.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('followers', 'username avatar')
    .populate('following', 'username avatar');

  if (!user) {
    throw createError(404, 'User not found');
  }

  // Get user's rooms
  const roomsHosted = await Room.countDocuments({ host: user._id });
  
  // Get user's total practice sessions (you can implement this logic)
  const totalSessions = 0; // Placeholder

  const profileData = {
    ...user.toObject(),
    roomsHosted,
    totalSessions,
    languagesLearned: user.learningLanguages?.length || 0
  };

  res.json({
    success: true,
    data: profileData
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { bio, learningLanguages } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      bio,
      learningLanguages
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    data: user
  });
});

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    throw createError(400, 'You cannot follow yourself');
  }

  const userToFollow = await User.findById(req.params.id);
  if (!userToFollow) {
    throw createError(404, 'User not found');
  }

  // Check if already following
  if (userToFollow.followers.includes(req.user._id)) {
    throw createError(400, 'You are already following this user');
  }

  // Add follower
  await User.findByIdAndUpdate(req.params.id, {
    $addToSet: { followers: req.user._id }
  });

  // Add to following list of current user
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { following: req.params.id }
  });

  res.json({
    success: true,
    message: 'User followed successfully'
  });
});

// @desc    Unfollow user
// @route   POST /api/users/:id/unfollow
// @access  Private
export const unfollowUser = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    throw createError(400, 'You cannot unfollow yourself');
  }

  const userToUnfollow = await User.findById(req.params.id);
  if (!userToUnfollow) {
    throw createError(404, 'User not found');
  }

  // Remove follower
  await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user._id }
  });

  // Remove from following list
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { following: req.params.id }
  });

  res.json({
    success: true,
    message: 'User unfollowed successfully'
  });
});

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
export const getFollowers = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate('followers', 'username avatar bio nativeLanguage');

  if (!user) {
    throw createError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user.followers
  });
});

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Public
export const getFollowing = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate('following', 'username avatar bio nativeLanguage');

  if (!user) {
    throw createError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user.following
  });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
export const searchUsers = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return res.json({ success: true, data: [] });
  }

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  })
    .select('username avatar nativeLanguage bio')
    .limit(10);

  res.json({
    success: true,
    data: users
  });
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
export const getUserStats = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  const roomsHosted = await Room.countDocuments({ host: userId });
  const roomsParticipated = await Room.countDocuments({
    'participants.user': userId
  });

  // Get recent activity (you can implement this based on your activity tracking)
  const recentActivity = [];

  res.json({
    success: true,
    data: {
      roomsHosted,
      roomsParticipated,
      followers: await User.findById(userId).select('followers').then(u => u.followers.length),
      following: await User.findById(userId).select('following').then(u => u.following.length),
      recentActivity
    }
  });
});

// @desc    Update avatar
// @route   POST /api/users/avatar
// @access  Private
export const updateAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw createError(400, 'Please upload an image');
  }

  // Upload to cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'lingora/avatars',
    width: 200,
    height: 200,
    crop: 'fill'
  });

  // Update user avatar
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true }
  ).select('-password');

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update language preferences
// @route   PUT /api/users/languages
// @access  Private
export const updateLanguages = asyncHandler(async (req, res, next) => {
  const { languages } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { learningLanguages: languages },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    data: user
  });
});