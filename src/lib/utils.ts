import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  try {
    // Handle both time strings and datetime strings
    let time: Date;
    if (timeString.includes('T')) {
      time = new Date(timeString);
    } else {
      // If it's just a time string, create a date object for today with that time
      const today = new Date();
      const [hours, minutes] = timeString.split(':');
      time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
    }

    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
}

export function formatDateTime(dateTimeString: string): string {
  try {
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateTimeString;
  }
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

let isLoggingOut = false;

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
        if (window.location.pathname !== '/login' && window.location.pathname !== '/' && !isLoggingOut) {
          isLoggingOut = true; // Set flag to prevent multiple alerts

          // Notify the user via a global alert since we're outside React context
          alert('Your session has expired. You will be redirected to the login page.');

          localStorage.clear();
          // Redirect immediately to the login page
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
