import axios from 'axios';
import API_CONFIG from './config';

// Cookie utility functions
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const setCookie = (name, value, maxAge = null) => {
    let cookieString = `${name}=${value}; path=/; SameSite=Lax`;
    if (maxAge) {
        cookieString += `; max-age=${maxAge}`;
    }
    document.cookie = cookieString;
};

const deleteCookie = (name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

class TokenStorage {
    constructor() {
        this.accessToken = null;
        this.tokenExpiration = null;
        this.isRefreshing = false;
        this.failedQueue = [];
        this.lastRoute = null;

        // Check for existing login status on initialization
        this.checkLoginStatus();
        this.loadLastRoute();
    }

    // Store the last route user tried to access
    setLastRoute(route) {
        this.lastRoute = route;
        setCookie('lastRoute', route, 3600); // Store for 1 hour
    }

    // Get the last route user tried to access
    getLastRoute() {
        if (this.lastRoute) return this.lastRoute;

        const storedRoute = getCookie('lastRoute');
        if (storedRoute && storedRoute !== '/login' && storedRoute !== '/register') {
            this.lastRoute = storedRoute;
            return storedRoute;
        }

        return '/dashboard'; // Default fallback
    }

    // Load last route from cookie on initialization
    loadLastRoute() {
        this.lastRoute = getCookie('lastRoute');
    }

    // Clear last route (after successful navigation)
    clearLastRoute() {
        this.lastRoute = null;
        deleteCookie('lastRoute');
    }

    // Check if user is logged in based on status cookie
    checkLoginStatus() {
        const loginStatus = getCookie('isLoggedIn');
        const loginTime = getCookie('loginTime');

        if (loginStatus === 'true' && loginTime) {
            const loginTimestamp = parseInt(loginTime);
            const now = new Date().getTime();
            const timeSinceLogin = now - loginTimestamp;

            // If logged in recently (within 7 days), we can try to get a new access token
            if (timeSinceLogin < 7 * 24 * 60 * 60 * 1000) { // 7 days
                return true;
            } else {
                this.clearLoginStatus();
                return false;
            }
        }

        return false;
    }

    // Set login status when user logs in
    setLoginStatus() {
        const now = new Date().getTime();
        setCookie('isLoggedIn', 'true', 604800); // 7 days
        setCookie('loginTime', now.toString(), 604800); // 7 days
    }

    // Clear login status when user logs out
    clearLoginStatus() {
        deleteCookie('isLoggedIn');
        deleteCookie('loginTime');
        deleteCookie('user');
        this.clearLastRoute();
        this.accessToken = null;
        this.tokenExpiration = null;
    }

    // **MAIN FUNCTION**: Get access token with automatic refresh and route handling
    async getAccessTokenForRoute(intendedRoute = null) {
        // Store the intended route if provided
        if (intendedRoute) {
            this.setLastRoute(intendedRoute);
        }

        // If we have a valid token in memory, use it
        if (this.accessToken && this.tokenExpiration && new Date().getTime() < this.tokenExpiration) {
            return this.accessToken;
        }

        // If no valid token in memory, check if we're logged in
        if (!this.checkLoginStatus()) {
            return null;
        }

        // Try to get new access token using credentials (refresh token in HttpOnly cookie)
        try {
            const refreshSuccess = await this.refreshToken();
            return refreshSuccess ? this.accessToken : null;
        } catch (error) {
            return null;
        }
    }

    // Get access token from memory or request new one via credentials
    async getAccessToken() {
        return this.getAccessTokenForRoute();
    }

    // Store access token in memory after login/refresh
    setAccessToken(accessToken) {
        this.accessToken = accessToken;

        // Decode token to get expiration time
        try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            this.tokenExpiration = payload.exp * 1000; // Convert to milliseconds
        } catch (error) {
            // Set expiration to 15 minutes from now as fallback
            this.tokenExpiration = new Date().getTime() + (15 * 60 * 1000);
        }
    }

    // Handle successful login - store token, set login status, and redirect to last route
    handleLoginSuccess(accessToken, user) {
        this.setAccessToken(accessToken);
        this.setLoginStatus();

        // Store user info for UI (non-HttpOnly cookie)
        setCookie('user', JSON.stringify({
            name: user.name,
            email: user.email
        }), 604800); // 7 days

        // Return the route to redirect to
        const redirectRoute = this.getLastRoute();
        this.clearLastRoute(); // Clear after getting it
        return redirectRoute;
    }

    // **SEAMLESS REFRESH**: Refresh access token using credentials only (no payload)
    async refreshToken() {
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
            });
        }

        this.isRefreshing = true;

        try {
            const refreshApi = axios.create({
                baseURL: API_CONFIG.FULL_API_URL,
                withCredentials: API_CONFIG.WITH_CREDENTIALS,
            });

            // Make refresh request with empty JSON body to satisfy backend requirement
            const response = await refreshApi.post('/auth/refresh', {});

            const { accessToken } = response.data;

            if (!accessToken) {
                throw new Error('No access token received');
            }

            // Store new access token in memory
            this.setAccessToken(accessToken);

            // Process failed queue with new token
            this.failedQueue.forEach(({ resolve }) => resolve(accessToken));
            this.failedQueue = [];

            this.isRefreshing = false;
            return true;

        } catch (error) {
            // Process failed queue
            this.failedQueue.forEach(({ reject }) => reject(error));
            this.failedQueue = [];

            this.isRefreshing = false;

            // If refresh fails with 401/403, clear login status
            if (error.response?.status === 401 || error.response?.status === 403) {
                this.clearLoginStatus();
            }

            return false;
        }
    }

    // Check if user is authenticated (for route protection)
    isAuthenticated() {
        const hasLoginStatus = this.checkLoginStatus();

        if (!hasLoginStatus) {
            return false;
        }

        // If we have login status, we can get an access token
        return true;
    }

    // **ROUTE PROTECTION**: Ensure valid token for route access
    async ensureValidTokenForRoute(route) {
        if (!this.checkLoginStatus()) {
            return false;
        }

        // Store the route we're trying to access
        this.setLastRoute(route);

        // If no token in memory or expiring soon (within 2 minutes), refresh
        const now = new Date().getTime();
        const bufferTime = 2 * 60 * 1000; // 2 minutes

        if (!this.accessToken || !this.tokenExpiration ||
            (this.tokenExpiration - now) < bufferTime) {

            const refreshSuccess = await this.refreshToken();

            if (refreshSuccess) {
                return true;
            } else {
                return false;
            }
        }

        return true;
    }

    // Auto-refresh token before it expires (call this periodically)
    async ensureValidToken() {
        return this.ensureValidTokenForRoute(this.getLastRoute());
    }

    // Handle logout
    async logout() {
        try {
            // Get current access token for the logout request
            const currentToken = this.accessToken;
            
            if (currentToken) {
                // Create axios instance for logout with proper headers
                const logoutApi = axios.create({
                    baseURL: API_CONFIG.FULL_API_URL,
                    withCredentials: API_CONFIG.WITH_CREDENTIALS,
                    headers: {
                        'Authorization': `Bearer ${currentToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                const response = await logoutApi.post('/auth/logout');
                
                if (response.status === 200) {
                }
            } 
            
        } catch (error) {
        } finally {
            // Always clear local state regardless of server response
            this.clearLoginStatus();
        }
    }
}

export const tokenStorage = new TokenStorage();