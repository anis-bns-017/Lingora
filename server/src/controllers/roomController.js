import Room from '../models/Room.js';
import User from '../models/User.js';
import createError from 'http-errors';
import mongoose from 'mongoose';

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req, res, next) => {
  try {
    const { language, topic, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    
    if (language) query.language = language;
    if (topic) query.topic = topic;
    
    const rooms = await Room.find(query)
      .populate('host', 'username avatar')
      .populate('participants.user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Room.countDocuments(query);
    
    res.json({
      success: true,
      data: rooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('host', 'username avatar nativeLanguage bio')
      .populate('moderators', 'username avatar')
      .populate('participants.user', 'username avatar nativeLanguage learningLanguages');
    
    if (!room) {
      throw createError(404, 'Room not found');
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req, res, next) => {
  try {
    const { name, description, language, topic, isPrivate, password, maxParticipants, tags } = req.body;
    
    // Create room
    const room = await Room.create({
      name,
      description,
      host: req.user._id,
      language,
      topic,
      isPrivate,
      password: isPrivate ? password : undefined,
      maxParticipants,
      tags: tags || [],
      participants: [{
        user: req.user._id,
        role: 'speaker',
        joinedAt: Date.now()
      }]
    });
    
    // Populate host info
    await room.populate('host', 'username avatar');
    
    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private
export const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);
    
    if (!room) {
      throw createError(404, 'Room not found');
    }
    
    // Check if user is host or moderator
    const isHost = room.host.toString() === req.user._id.toString();
    const isModerator = room.moderators.some(mod => mod.toString() === req.user._id.toString());
    
    if (!isHost && !isModerator && req.user.role !== 'admin') {
      throw createError(403, 'Not authorized to update this room');
    }
    
    // Update room
    room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('host', 'username avatar')
     .populate('participants.user', 'username avatar');
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      throw createError(404, 'Room not found');
    }
    
    // Check if user is host or admin
    if (room.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw createError(403, 'Not authorized to delete this room');
    }
    
    await room.deleteOne();
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join room
// @route   POST /api/rooms/:id/join
// @access  Private
export const joinRoom = async (req, res, next) => {
  try {
    const { password } = req.body;
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      throw createError(404, 'Room not found');
    }
    
    // Check if room is active
    if (!room.isActive) {
      throw createError(400, 'Room is not active');
    }
    
    // Check if room is full
    if (room.participants.length >= room.maxParticipants) {
      throw createError(400, 'Room is full');
    }
    
    // Check if user is already in room
    const isParticipant = room.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );
    
    if (isParticipant) {
      throw createError(400, 'You are already in this room');
    }
    
    // Check password if private
    if (room.isPrivate) {
      if (!password || password !== room.password) {
        throw createError(401, 'Invalid password');
      }
    }
    
    // Add user to participants
    room.participants.push({
      user: req.user._id,
      role: 'listener',
      joinedAt: Date.now()
    });
    
    await room.save();
    
    // Get updated room with populated fields
    const updatedRoom = await Room.findById(room._id)
      .populate('host', 'username avatar')
      .populate('participants.user', 'username avatar');
    
    res.json({
      success: true,
      data: updatedRoom
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave room
// @route   POST /api/rooms/:id/leave
// @access  Private
export const leaveRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      throw createError(404, 'Room not found');
    }
    
    // Check if user is host
    if (room.host.toString() === req.user._id.toString()) {
      // If host leaves, assign new host or close room
      const otherParticipants = room.participants.filter(
        p => p.user.toString() !== req.user._id.toString()
      );
      
      if (otherParticipants.length > 0) {
        // Assign new host (first participant)
        room.host = otherParticipants[0].user;
      } else {
        // No participants left, close room
        room.isActive = false;
        room.endedAt = Date.now();
      }
    }
    
    // Remove user from participants
    room.participants = room.participants.filter(
      p => p.user.toString() !== req.user._id.toString()
    );
    
    await room.save();
    
    res.json({
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update participant role
// @route   PUT /api/rooms/:id/participants/:userId/role
// @access  Private
export const updateParticipantRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      throw createError(404, 'Room not found');
    }
    
    // Check if user is host or moderator
    const isHost = room.host.toString() === req.user._id.toString();
    const isModerator = room.moderators.some(mod => mod.toString() === req.user._id.toString());
    
    if (!isHost && !isModerator && req.user.role !== 'admin') {
      throw createError(403, 'Not authorized to update roles');
    }
    
    // Find participant
    const participantIndex = room.participants.findIndex(
      p => p.user.toString() === req.params.userId
    );
    
    if (participantIndex === -1) {
      throw createError(404, 'Participant not found');
    }
    
    // Update role
    room.participants[participantIndex].role = role;
    await room.save();
    
    res.json({
      success: true,
      message: 'Participant role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room participants
// @route   GET /api/rooms/:id/participants
// @access  Public
export const getRoomParticipants = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('participants.user', 'username avatar nativeLanguage learningLanguages bio');
    
    if (!room) {
      throw createError(404, 'Room not found');
    }
    
    res.json({
      success: true,
      data: room.participants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active rooms
// @route   GET /api/rooms/active
// @access  Public
export const getActiveRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ 
      isActive: true,
      'participants.0': { $exists: true } // At least one participant
    })
      .populate('host', 'username avatar')
      .populate('participants.user', 'username avatar')
      .sort({ 'participants.length': -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search rooms
// @route   GET /api/rooms/search
// @access  Public
export const searchRooms = async (req, res, next) => {
  try {
    const { q, language, topic, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    
    if (q) {
      query.$text = { $search: q };
    }
    
    if (language) query.language = language;
    if (topic) query.topic = topic;
    
    const rooms = await Room.find(query)
      .populate('host', 'username avatar')
      .populate('participants.user', 'username avatar')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Room.countDocuments(query);
    
    res.json({
      success: true,
      data: rooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};