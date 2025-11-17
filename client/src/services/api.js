import axios from 'axios';

// Ensure API URL ends with /api
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // If URL doesn't end with /api, add it
  if (envUrl && !envUrl.endsWith('/api')) {
    return envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
  }
  return envUrl;
};

const api = axios.create({
  baseURL: getApiUrl(),
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

