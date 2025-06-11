import axios from 'axios';
import { tokenStorage } from './tokenStorage';
import { AUTH_ENDPOINTS } from './endpoints';
import API_CONFIG from './config';

// Create axios instance
const api = axios.create({
    baseURL: API_CONFIG.FULL_API_URL,
    withCredentials: API_CONFIG.WITH_CREDENTIALS,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
    async (config) => {
        // Ensure we have a valid token before making the request
        await tokenStorage.ensureValidToken();
        
        // Get current access token from memory
        const token = tokenStorage.accessToken;
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token using credentials
                const refreshed = await tokenStorage.refreshToken();
                
                if (refreshed && tokenStorage.accessToken) {
                    // Retry original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${tokenStorage.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Clear login status and redirect to login
                tokenStorage.clearLoginStatus();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // For other errors or if refresh failed
        if (error.response?.status === 401) {
            tokenStorage.clearLoginStatus();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;