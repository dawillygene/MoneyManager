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
        // Skip token injection for auth endpoints to avoid loops
        if (config.url?.includes('/auth/')) {
            return config;
        }
        
        // Get current access token from memory (don't trigger refresh here)
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

        // Skip retry for auth endpoints
        if (originalRequest.url?.includes('/auth/')) {
            return Promise.reject(error);
        }

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log('API interceptor: Attempting token refresh due to 401');
                
                // Attempt to refresh token using credentials
                const refreshed = await tokenStorage.refreshToken();
                
                if (refreshed && tokenStorage.accessToken) {
                    console.log('API interceptor: Token refresh successful, retrying request');
                    // Retry original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${tokenStorage.accessToken}`;
                    return api(originalRequest);
                } else {
                    console.log('API interceptor: Token refresh failed');
                    throw new Error('Token refresh failed');
                }
            } catch (refreshError) {
                console.error('API interceptor: Token refresh error:', refreshError);
                // Clear login status and let the error propagate
                tokenStorage.clearLoginStatus();
                return Promise.reject(refreshError);
            }
        }

        // For other 401 errors or if refresh failed
        if (error.response?.status === 401) {
            console.log('API interceptor: Clearing login status due to persistent 401');
            tokenStorage.clearLoginStatus();
        }

        return Promise.reject(error);
    }
);

export default api;