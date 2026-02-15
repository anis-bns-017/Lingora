import api from './api';

const uploadService = {
  // Upload single image
  uploadImage: async (file, type = 'avatar') => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post(`/upload/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // Upload avatar specifically
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  },

  // Upload cover image
  uploadCover: async (file) => {
    try {
      const formData = new FormData();
      formData.append('cover', file);
      
      const response = await api.post('/upload/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Cover upload error:', error);
      throw error;
    }
  },

  // Upload multiple images
  uploadMultiple: async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  },

  // Delete uploaded file
  deleteFile: async (publicId) => {
    try {
      const response = await api.delete(`/upload/${publicId}`);
      return response.data;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
};

export default uploadService;