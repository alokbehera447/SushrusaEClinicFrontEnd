import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API base URL utility
export const API_BASE_URL = 'https://sushrusaeclinic.com';
// export const API_BASE_URL = 'http://127.0.0.1:8000';  

import axios from 'axios';
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Attach access token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      params: config.params,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle 401 errors and try to refresh token
api.interceptors.response.use(
  (response) => {
    // Debug logging for successful responses
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
      dataLength: Array.isArray(response.data) ? response.data.length : Object.keys(response.data || {}).length
    });
    return response;
  },
  async (error) => {
    // Debug logging for error responses
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, { refresh: refreshToken });
          if (res.data && res.data.access) {
            localStorage.setItem('accessToken', res.data.access);
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, only logout if we're not already on login page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
