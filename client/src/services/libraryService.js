import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const libraryService = {
  // Books CRUD operations
  getBooks: async (params = {}) => {
    try {
      const response = await api.get('/library/books', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBook: async (id) => {
    try {
      const response = await api.get(`/library/books/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addBook: async (bookData) => {
    try {
      const response = await api.post('/library/books', bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/library/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/library/books/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Book requests
  requestBook: async (requestData) => {
    try {
      const response = await api.post('/library/request', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRequests: async (params = {}) => {
    try {
      const response = await api.get('/library/requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  approveRequest: async (id) => {
    try {
      const response = await api.put(`/library/requests/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  rejectRequest: async (id, rejectionReason) => {
    try {
      const response = await api.put(`/library/requests/${id}/reject`, {
        rejectionReason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  issueBook: async (id) => {
    try {
      const response = await api.put(`/library/requests/${id}/issue`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  returnBook: async (id) => {
    try {
      const response = await api.put(`/library/requests/${id}/return`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Statistics
  getStats: async () => {
    try {
      const response = await api.get('/library/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Utility functions
  searchBooks: async (searchTerm, filters = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      return await libraryService.getBooks(params);
    } catch (error) {
      throw error;
    }
  },

  getBooksByCategory: async (category, params = {}) => {
    try {
      return await libraryService.getBooks({
        category,
        ...params
      });
    } catch (error) {
      throw error;
    }
  },

  getAvailableBooks: async (params = {}) => {
    try {
      return await libraryService.getBooks({
        available: 'true',
        ...params
      });
    } catch (error) {
      throw error;
    }
  },

  getUserRequests: async (userId, params = {}) => {
    try {
      return await libraryService.getRequests(params);
    } catch (error) {
      throw error;
    }
  },

  getPendingRequests: async (params = {}) => {
    try {
      return await libraryService.getRequests({
        status: 'pending',
        ...params
      });
    } catch (error) {
      throw error;
    }
  },

  getOverdueBooks: async (params = {}) => {
    try {
      return await libraryService.getRequests({
        status: 'overdue',
        ...params
      });
    } catch (error) {
      throw error;
    }
  }
};

export default libraryService;
