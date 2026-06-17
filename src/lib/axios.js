import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401, could trigger logout
    if (error.response?.status === 401) {
      // Let RTK Query handle this for now
    }
    return Promise.reject(error);
  }
);

export default api;
