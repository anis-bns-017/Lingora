import { useState, useEffect, useCallback } from 'react';
import socketService from '../../../services/socketService';

const useRoomSocket = ({ roomId, user, hasJoined }) => {
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    if (!hasJoined || !socketService.socket) return;

    const socket = socketService.socket;

    // Join room
    socket.emit('join-room', { roomId });

    // Listen for user joined
    socket.on('user-joined', ({ user: newUser, participants: updatedParticipants }) => {
      setParticipants(updatedParticipants);
    });

    // Listen for user left
    socket.on('user-left', ({ userId, participants: updatedParticipants }) => {
      setParticipants(updatedParticipants);
    });

    // Listen for new messages
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing
    socket.on('user-typing', ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(username);
        } else {
          newSet.delete(username);
        }
        return newSet;
      });
    });

    // Listen for participant updates
    socket.on('participant-updated', ({ userId, updates }) => {
      setParticipants(prev => prev.map(p => 
        p.user?._id === userId ? { ...p, ...updates } : p
      ));
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('participant-updated');
      socket.emit('leave-room', { roomId });
    };
  }, [roomId, hasJoined]);

  const sendMessage = useCallback((content) => {
    if (!socketService.socket) return;
    socketService.socket.emit('send-message', {
      roomId,
      content,
      type: 'text'
    });
  }, [roomId]);

  const sendTyping = useCallback((isTyping) => {
    if (!socketService.socket) return;
    socketService.socket.emit('typing', { roomId, isTyping });
  }, [roomId]);

  return {
    participants,
    setParticipants,
    messages,
    setMessages,
    typingUsers,
    sendMessage,
    sendTyping
  };
};

export default useRoomSocket;