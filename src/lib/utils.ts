import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API base URL utility
export const API_BASE_URL = 'http://127.0.0.1:8000';
// export const API_BASE_URL = 'https://sushrusaeclinic.com';  

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
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors and try to refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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
        // Refresh failed, logout but don't reload page
        localStorage.clear();
        // Instead of reloading, redirect to login page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
