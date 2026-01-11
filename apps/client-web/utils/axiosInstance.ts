import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // CRITICAL: This allows the browser to store/send HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You no longer need to manually inject a Bearer token!
    // The browser will automatically send the HttpOnly cookie in the request headers.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Handle 401 Unauthorized globally (e.g., redirect to login)
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;