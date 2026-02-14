import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.authenticated = false;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    // No token needed - it's in HTTP-only cookie
    this.socket = io(SOCKET_URL, {
      withCredentials: true, // Important for cookies
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupEventHandlers();
    
    return this.socket;
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.reconnectAttempts = 0;
      this.authenticated = true;
      this.emit('online-users');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.authenticated = false;
      
      if (reason === 'io server disconnect') {
        this.disconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      this.authenticated = false;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      if (error.message === 'Authentication error') {
        this.authenticated = false;
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.authenticated = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      this.authenticated = false;
    });

    // Auth error handler
    this.socket.on('auth_error', () => {
      this.authenticated = false;
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      this.authenticated = false;
    }
  }

  emit(event, data) {
    if (this.socket?.connected && this.authenticated) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected or authenticated, cannot emit:', event);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
    }
    this.listeners.clear();
  }

  // Room events
  joinRoom(roomId) {
    this.emit('join-room', { roomId });
  }

  leaveRoom(roomId) {
    this.emit('leave-room', { roomId });
  }

  sendMessage(roomId, content, type = 'text', correction = null) {
    this.emit('send-message', { roomId, content, type, correction });
  }

  sendTyping(roomId, isTyping) {
    this.emit('typing', { roomId, isTyping });
  }

  // Voice chat events
  sendVoiceOffer(roomId, offer) {
    this.emit('voice-offer', { roomId, offer });
  }

  sendVoiceAnswer(roomId, answer) {
    this.emit('voice-answer', { roomId, answer });
  }

  sendIceCandidate(roomId, candidate) {
    this.emit('ice-candidate', { roomId, candidate });
  }

  toggleMute(roomId, muted) {
    this.emit('toggle-mute', { roomId, muted });
  }

  sendSpeakingStatus(roomId, isSpeaking) {
    this.emit('speaking', { roomId, isSpeaking });
  }

  // Moderation events
  kickUser(roomId, userId) {
    this.emit('kick-user', { roomId, userId });
  }

  changeUserRole(roomId, userId, role) {
    this.emit('change-role', { roomId, userId, role });
  }

  // Private messaging
  sendPrivateMessage(recipientId, content) {
    this.emit('private-message', { recipientId, content });
  }

  // Connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  isAuthenticated() {
    return this.authenticated;
  }

  getSocketId() {
    return this.socket?.id || null;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;