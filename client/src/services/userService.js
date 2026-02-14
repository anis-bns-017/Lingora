import api from './api';

const userService = {
  // Get user profile
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Follow user
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Unfollow user
  unfollowUser: async (userId) => {
    const response = await api.post(`/users/${userId}/unfollow`);
    return response.data;
  },

  // Get user followers
  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  // Get user following
  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },

  // Update avatar
  updateAvatar: async (formData) => {
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Search users
  searchUsers: async (query) => {
    const response = await api.get('/users/search', { params: { q: query } });
    return response.data;
  },

  // Get user statistics
  getUserStats: async (userId) => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

  // Update language preferences
  updateLanguages: async (languages) => {
    const response = await api.put('/users/languages', { languages });
    return response.data;
  }
};

export default userService;