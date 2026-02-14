import api from './api';

const roomService = {
  // Get all rooms
  getRooms: async (params = {}) => {
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  // Get single room
  getRoom: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Create room
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  // Update room
  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  // Delete room
  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  // Join room
  joinRoom: async (id, password = null) => {
    const response = await api.post(`/rooms/${id}/join`, { password });
    return response.data;
  },

  // Leave room
  leaveRoom: async (id) => {
    const response = await api.post(`/rooms/${id}/leave`);
    return response.data;
  },

  // Update participant role
  updateParticipantRole: async (roomId, userId, role) => {
    const response = await api.put(`/rooms/${roomId}/participants/${userId}/role`, { role });
    return response.data;
  },

  // Get room participants
  getRoomParticipants: async (id) => {
    const response = await api.get(`/rooms/${id}/participants`);
    return response.data;
  },

  // Get active rooms
  getActiveRooms: async () => {
    const response = await api.get('/rooms/active');
    return response.data;
  },

  // Search rooms
  searchRooms: async (params) => {
    const response = await api.get('/rooms/search', { params });
    return response.data;
  }
};

export default roomService;