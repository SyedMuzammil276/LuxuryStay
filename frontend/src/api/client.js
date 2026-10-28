import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luxurystay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, and user was on authenticated route
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        !currentPath.includes('/forgot-password') &&
        !currentPath.includes('/reset-password') &&
        currentPath !== '/'
      ) {
        localStorage.removeItem('luxurystay_token');
        localStorage.removeItem('luxurystay_user');
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'A network or unexpected error occurred. Please try again.';
};

export default apiClient;
