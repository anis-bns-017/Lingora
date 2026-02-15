import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Track if we're currently refreshing to prevent multiple requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Always log in development
    console.log(`🚀 ${config.method?.toUpperCase() || 'UNKNOWN'} ${config.url}`, {
      data: config.data,
      params: config.params,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('📤 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase() || 'UNKNOWN'} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    // Log the complete error object
    console.error('❌ Response error details:', {
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      },
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      },
      request: error.request ? 'Request was made but no response received' : 'No request made'
    });

    // Network error - no response received
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Request timeout - server took too long to respond');
        return Promise.reject({
          message: 'Request timeout. Please check if the server is running.',
          original: error
        });
      }
      
      if (error.code === 'ERR_NETWORK') {
        console.error('🌐 Network error - cannot reach server');
        return Promise.reject({
          message: 'Cannot connect to server. Please check if the backend is running at ' + API_URL,
          original: error
        });
      }
      
      console.error('❓ Unknown network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please try again.',
        original: error
      });
    }

    const originalRequest = error.config;

    // Handle token expiration (401) - try to refresh
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token using HTTP-only cookie
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true,
          timeout: 5000
        });
        
        if (response.data?.success) {
          processQueue(null);
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('🔄 Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        
        // Only redirect if not on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 400:
        console.error('❌ Bad request:', error.response.data);
        return Promise.reject(error.response.data?.message || 'Invalid request');
      
      case 401:
        console.error('🔒 Unauthorized:', error.response.data);
        return Promise.reject(error.response.data?.message || 'Authentication required');
      
      case 403:
        console.error('🚫 Forbidden:', error.response.data);
        return Promise.reject(error.response.data?.message || 'Access denied');
      
      case 404:
        console.error('🔍 Not found:', error.response.data);
        return Promise.reject(error.response.data?.message || 'Resource not found');
      
      case 409:
        console.error('⚔️ Conflict:', error.response.data);
        return Promise.reject(error.response.data?.message || 'Resource already exists');
      
      case 422:
        console.error('📋 Validation error:', error.response.data);
        return Promise.reject(error.response.data?.message || 'Validation failed');
      
      case 429:
        console.error('⏳ Too many requests:', error.response.data);
        return Promise.reject('Too many requests. Please try again later.');
      
      case 500:
        console.error('💥 Server error:', error.response.data);
        return Promise.reject(error.response.data?.message || 'Internal server error');
      
      default:
        return Promise.reject(error.response?.data?.message || 'An unexpected error occurred');
    }
  }
);

// Helper methods with better error handling
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const post = async (url, data = {}) => {
  try {
    console.log(`📤 POST to ${url} with data:`, data);
    const response = await api.post(url, data);
    console.log(`📥 POST response from ${url}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`📤 POST error for ${url}:`, error);
    throw error;
  }
};

export const put = async (url, data = {}) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const patch = async (url, data = {}) => {
  try {
    const response = await api.patch(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const del = async (url) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;