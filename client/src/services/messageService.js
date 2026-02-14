import api from './api';

const messageService = {
  // Get messages for a room
  getRoomMessages: async (roomId, params = {}) => {
    const response = await api.get(`/messages/room/${roomId}`, { params });
    return response.data;
  },

  // Send a message
  sendMessage: async (roomId, content, type = 'text', correction = null) => {
    const response = await api.post(`/messages/room/${roomId}`, {
      content,
      type,
      correction
    });
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Edit a message
  editMessage: async (messageId, content) => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data;
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    const response = await api.post(`/messages/${messageId}/read`);
    return response.data;
  },

  // Get unread messages count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread/count');
    return response.data;
  },

  // Search messages
  searchMessages: async (roomId, query) => {
    const response = await api.get(`/messages/room/${roomId}/search`, {
      params: { q: query }
    });
    return response.data;
  },

  // Get recent messages from all rooms
  getRecentMessages: async () => {
    const response = await api.get('/messages/recent');
    return response.data;
  },

  // Pin a message
  pinMessage: async (messageId) => {
    const response = await api.post(`/messages/${messageId}/pin`);
    return response.data;
  },

  // Unpin a message
  unpinMessage: async (messageId) => {
    const response = await api.post(`/messages/${messageId}/unpin`);
    return response.data;
  },

  // Get pinned messages in a room
  getPinnedMessages: async (roomId) => {
    const response = await api.get(`/messages/room/${roomId}/pinned`);
    return response.data;
  },

  // React to a message
  addReaction: async (messageId, reaction) => {
    const response = await api.post(`/messages/${messageId}/reactions`, { reaction });
    return response.data;
  },

  // Remove reaction from a message
  removeReaction: async (messageId, reaction) => {
    const response = await api.delete(`/messages/${messageId}/reactions/${reaction}`);
    return response.data;
  },

  // Report a message
  reportMessage: async (messageId, reason) => {
    const response = await api.post(`/messages/${messageId}/report`, { reason });
    return response.data;
  }
};

export default messageService;