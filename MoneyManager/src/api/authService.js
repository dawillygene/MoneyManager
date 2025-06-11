import api from './apiConfig';
import { tokenStorage } from './tokenStorage';
import { AUTH_ENDPOINTS } from './endpoints';

// Cookie utility function
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

class AuthService {
    // Login user
    async login(credentials) {
        try {
            const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
            
            const { accessToken, user } = response.data;
            
            // Handle login success with new route-aware approach
            const redirectRoute = tokenStorage.handleLoginSuccess(accessToken, user);
            
            return {
                success: true,
                user,
                redirectRoute, // Include the route to redirect to
                message: 'Login successful'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    }

    // Register new user
    async register(userData) {
        try {
            const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
            
            const { accessToken, user } = response.data;
            
            // Handle registration success (auto-login)
            tokenStorage.handleLoginSuccess(accessToken, user);
            
            return {
                success: true,
                user,
                message: 'Registration successful'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    }

    // Logout user
    async logout() {
        try {
            await tokenStorage.logout();
            
            // Redirect to login page after successful logout
            window.location.href = '/login';
        } catch (error) {
            // Even if logout fails, redirect to login for security
            window.location.href = '/login';
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return tokenStorage.isAuthenticated();
    }

    // Get current user info from cookies
    getCurrentUser() {
        try {
            const userCookie = getCookie('user');
            return userCookie ? JSON.parse(userCookie) : null;
        } catch (error) {
            return null;
        }
    }

    // Verify token validity (optional - mainly for server verification)
    async verifyToken() {
        try {
            const token = await tokenStorage.getAccessToken();
            
            if (!token) {
                return false;
            }
            
            const response = await api.get(AUTH_ENDPOINTS.VERIFY_TOKEN);
            return response.data.valid === true;
        } catch (error) {
            return false;
        }
    }
}

export const authService = new AuthService();