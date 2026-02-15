import { post, get } from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('AuthService.register called with:', userData);
      const response = await post('/auth/register', userData);
      console.log('AuthService.register response:', response);
      return response;
    } catch (error) {
      console.error('AuthService.register error:', error);
      throw error; // Re-throw to be handled by the component
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('AuthService.login called with:', credentials);
      const response = await post('/auth/login', credentials);
      console.log('AuthService.login response:', response);
      return response;
    } catch (error) {
      console.error('AuthService.login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await post('/auth/logout');
      return response;
    } catch (error) {
      console.error('AuthService.logout error:', error);
      throw error;
    }
  },

  // Get current user profile
  getMe: async () => {
    try {
      const response = await get('/auth/me');
      return response;
    } catch (error) {
      console.error('AuthService.getMe error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('AuthService.forgotPassword error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  checkAuth: async () => {
    try {
      const response = await get('/auth/check');
      return response;
    } catch {
      return { isAuthenticated: false };
    }
  }
};

export default authService;