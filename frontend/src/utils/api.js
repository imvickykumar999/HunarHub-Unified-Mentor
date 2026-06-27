const BASE_URL = window.location.port === '5173' ? 'http://localhost:5000/api' : '/api';

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // GET requests
  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  // POST requests
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  // PUT requests
  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  // DELETE requests
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  // File upload helper
  upload: async (endpoint, file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error(`UPLOAD failed:`, error);
      return { success: false, message: 'File upload failed' };
    }
  },
};
