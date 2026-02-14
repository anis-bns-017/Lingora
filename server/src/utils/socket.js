import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Message from '../models/Message.js';

// Store active users and their socket connections
const activeUsers = new Map();
const userSockets = new Map();

export const setupSocket = (io) => {
  // Authentication middleware for socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      
      // Store user connection
      activeUsers.set(user._id.toString(), {
        userId: user._id,
        username: user.username,
        socketId: socket.id,
        lastSeen: new Date()
      });
      
      userSockets.set(socket.id, user._id.toString());
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    // Update user online status
    updateUserStatus(socket.user._id, true);

    // Join user to their personal room for private messages
    socket.join(`user:${socket.user._id}`);

    // Emit online users to all connected clients
    io.emit('online-users', getOnlineUsers());

    // Handle joining a room
    socket.on('join-room', async ({ roomId }) => {
      try {
        // Check if room exists and is active
        const room = await Room.findById(roomId);
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (!room.isActive) {
          socket.emit('error', { message: 'Room is not active' });
          return;
        }

        // Check if room is full
        if (room.participants.length >= room.maxParticipants) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }

        // Check if user is already in participants
        const isParticipant = room.participants.some(
          p => p.user.toString() === socket.user._id.toString()
        );

        if (!isParticipant) {
          // Add user to room participants
          room.participants.push({
            user: socket.user._id,
            role: 'listener',
            joinedAt: new Date()
          });
          await room.save();
        }

        // Join socket room
        socket.join(roomId);
        
        // Store room info in socket data
        socket.data.currentRoom = roomId;

        // Get updated room with populated fields
        const updatedRoom = await Room.findById(roomId)
          .populate('participants.user', 'username avatar nativeLanguage')
          .populate('host', 'username avatar');

        // Notify all users in the room
        io.to(roomId).emit('user-joined', {
          user: {
            _id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          room: updatedRoom,
          participants: updatedRoom.participants
        });

        // Send system message
        const systemMessage = {
          _id: new Date().getTime(),
          sender: { _id: 'system', username: 'System' },
          content: `${socket.user.username} joined the room`,
          type: 'system',
          createdAt: new Date()
        };
        
        io.to(roomId).emit('new-message', systemMessage);

        // Send room info to joining user
        socket.emit('room-joined', {
          room: updatedRoom,
          participants: updatedRoom.participants
        });

        console.log(`${socket.user.username} joined room: ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leave-room', async ({ roomId }) => {
      try {
        await handleLeaveRoom(socket, roomId);
      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // Handle chat messages
    socket.on('send-message', async ({ roomId, content, type = 'text', correction = null }) => {
      try {
        // Create message object
        const messageData = {
          room: roomId,
          sender: socket.user._id,
          content,
          type,
          correction,
          readBy: [{
            user: socket.user._id,
            readAt: new Date()
          }]
        };

        // Save to database (optional, depending on your needs)
        // const message = await Message.create(messageData);

        // Create message for broadcast
        const message = {
          _id: new Date().getTime(), // Use actual message ID if saving to DB
          sender: {
            _id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          content,
          type,
          correction,
          createdAt: new Date()
        };

        // Broadcast to room
        io.to(roomId).emit('new-message', message);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.user._id,
        username: socket.user.username,
        isTyping
      });
    });

    // Handle voice chat signaling
    socket.on('voice-offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('voice-offer', {
        userId: socket.user._id,
        username: socket.user.username,
        offer
      });
    });

    socket.on('voice-answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('voice-answer', {
        userId: socket.user._id,
        username: socket.user.username,
        answer
      });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', {
        userId: socket.user._id,
        candidate
      });
    });

    // Handle mute/unmute
    socket.on('toggle-mute', ({ roomId, muted }) => {
      socket.to(roomId).emit('user-muted', {
        userId: socket.user._id,
        username: socket.user.username,
        muted
      });
    });

    // Handle speaking status
    socket.on('speaking', ({ roomId, isSpeaking }) => {
      socket.to(roomId).emit('speaking', {
        userId: socket.user._id,
        username: socket.user.username,
        isSpeaking
      });
    });

    // Handle private messages
    socket.on('private-message', async ({ recipientId, content }) => {
      try {
        const recipient = await User.findById(recipientId);
        
        if (!recipient) {
          socket.emit('error', { message: 'Recipient not found' });
          return;
        }

        const message = {
          _id: new Date().getTime(),
          sender: {
            _id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          content,
          type: 'private',
          createdAt: new Date()
        };

        // Send to recipient's personal room
        io.to(`user:${recipientId}`).emit('private-message', message);
        
        // Also send back to sender for confirmation
        socket.emit('private-message-sent', message);
      } catch (error) {
        console.error('Private message error:', error);
        socket.emit('error', { message: 'Failed to send private message' });
      }
    });

    // Handle user kicking (for moderators/hosts)
    socket.on('kick-user', async ({ roomId, userId }) => {
      try {
        const room = await Room.findById(roomId);
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user has permission (host or moderator)
        const isHost = room.host.toString() === socket.user._id.toString();
        const isModerator = room.moderators.some(
          mod => mod.toString() === socket.user._id.toString()
        );

        if (!isHost && !isModerator && socket.user.role !== 'admin') {
          socket.emit('error', { message: 'Not authorized to kick users' });
          return;
        }

        // Remove user from room
        room.participants = room.participants.filter(
          p => p.user.toString() !== userId
        );
        await room.save();

        // Notify kicked user
        io.to(`user:${userId}`).emit('kicked-from-room', {
          roomId,
          kickedBy: socket.user.username
        });

        // Notify room
        io.to(roomId).emit('user-kicked', {
          userId,
          kickedBy: socket.user.username
        });
      } catch (error) {
        console.error('Kick user error:', error);
        socket.emit('error', { message: 'Failed to kick user' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user?.username} (${socket.id})`);

      // Remove from active users
      if (socket.user) {
        const userId = socket.user._id.toString();
        activeUsers.delete(userId);
        userSockets.delete(socket.id);

        // Update user status
        await updateUserStatus(socket.user._id, false);

        // Leave current room if any
        if (socket.data.currentRoom) {
          await handleLeaveRoom(socket, socket.data.currentRoom);
        }

        // Emit updated online users
        io.emit('online-users', getOnlineUsers());
      }
    });
  });
};

// Helper function to handle leaving a room
const handleLeaveRoom = async (socket, roomId) => {
  const room = await Room.findById(roomId);
  
  if (room) {
    // Remove user from participants
    const wasParticipant = room.participants.some(
      p => p.user.toString() === socket.user._id.toString()
    );

    if (wasParticipant) {
      room.participants = room.participants.filter(
        p => p.user.toString() !== socket.user._id.toString()
      );

      // If host leaves, assign new host or close room
      if (room.host.toString() === socket.user._id.toString()) {
        if (room.participants.length > 0) {
          // Assign new host (first participant)
          room.host = room.participants[0].user;
        } else {
          // No participants left, close room
          room.isActive = false;
          room.endedAt = new Date();
        }
      }

      await room.save();

      // Notify room
      io.to(roomId).emit('user-left', {
        userId: socket.user._id,
        username: socket.user.username,
        newHost: room.host
      });

      // Send system message
      const systemMessage = {
        _id: new Date().getTime(),
        sender: { _id: 'system', username: 'System' },
        content: `${socket.user.username} left the room`,
        type: 'system',
        createdAt: new Date()
      };
      
      io.to(roomId).emit('new-message', systemMessage);
    }
  }

  // Leave socket room
  socket.leave(roomId);
  socket.data.currentRoom = null;
};

// Helper function to update user status in database
const updateUserStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(activeUsers.values()).map(user => ({
    userId: user.userId,
    username: user.username,
    socketId: user.socketId
  }));
};

// Helper function to get socket ID for a user
export const getUserSocketId = (userId) => {
  for (const [socketId, uid] of userSockets.entries()) {
    if (uid === userId.toString()) {
      return socketId;
    }
  }
  return null;
};

// Helper function to send notification to a specific user
export const notifyUser = (io, userId, event, data) => {
  const socketId = getUserSocketId(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

export default setupSocket;