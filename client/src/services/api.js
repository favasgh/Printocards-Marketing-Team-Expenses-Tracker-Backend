import axios from 'axios';
import { logger } from '../utils/logger.js';

// Ensure API URL ends with /api
const getApiUrl = () => {
  // In development, always use localhost if running on localhost
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const envUrl = import.meta.env.VITE_API_URL;
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // If on localhost and env URL points to production, force localhost
  if (isLocalhost) {
    if (envUrl && (envUrl.includes('onrender.com') || envUrl.includes('netlify.app') || envUrl.includes('vercel.app'))) {
      const localUrl = 'http://localhost:5000/api';
      if (isDev) {
        logger.log('🔧 Overriding production API URL with local:', localUrl);
        logger.log('   Original VITE_API_URL:', envUrl);
      }
      return localUrl;
    }
    // If no env URL or it's already localhost, use localhost
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      const localUrl = 'http://localhost:5000/api';
      if (isDev) {
        logger.log('🔧 Using local API:', localUrl);
      }
      return localUrl;
    }
  }
  
  // Use environment URL or default to localhost
  const finalUrl = envUrl || 'http://localhost:5000/api';
  // If URL doesn't end with /api, add it
  if (finalUrl && !finalUrl.endsWith('/api')) {
    return finalUrl.endsWith('/') ? `${finalUrl}api` : `${finalUrl}/api`;
  }
  return finalUrl;
};

const apiBaseURL = getApiUrl();
if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
  logger.log('🌐 API Base URL:', apiBaseURL);
  logger.log('🌐 VITE_API_URL env:', import.meta.env.VITE_API_URL || '(not set)');
}

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: false,
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

api.interceptors.request.use((config) => {
  const token = authToken || (typeof window !== 'undefined' ? window.localStorage.getItem('printo_token') : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // For blob responses (file downloads), return as-is
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response;
  },
  (error) => {
    // Handle blob error responses
    if (error.response?.config?.responseType === 'blob' && error.response?.data instanceof Blob) {
      // Try to parse error message from blob
      return error.response.data.text().then((text) => {
        try {
          const errorData = JSON.parse(text);
          error.response.data = errorData;
        } catch {
          error.response.data = { message: 'Failed to download file' };
        }
        return Promise.reject(error);
      });
    }
    return Promise.reject(error);
  }
);

export default api;

