import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api/authService';
import { tokenStorage } from '../api/tokenStorage';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const currentRoute = location.pathname;
                
                const hasLoginStatus = tokenStorage.checkLoginStatus();
                
                if (!hasLoginStatus) {
                    console.log('ProtectedRoute: No login status found, redirecting to login');
                    tokenStorage.setLastRoute(currentRoute);
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                console.log('ProtectedRoute: Login status found, ensuring valid token');
                
                // Try to get a valid access token (this will handle refresh if needed)
                const token = await tokenStorage.getAccessTokenForRoute(currentRoute);
                
                if (!token) {
                    console.log('ProtectedRoute: Failed to get access token, clearing login status');
                    tokenStorage.clearLoginStatus();
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                console.log('ProtectedRoute: Valid token obtained, user is authenticated');
                setIsAuthenticated(true);
                
            } catch (error) {
                console.error('ProtectedRoute: Authentication check failed:', error);
                tokenStorage.setLastRoute(location.pathname);
                tokenStorage.clearLoginStatus();
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, [location.pathname]);

    useEffect(() => {
        if (!isLoading && isAuthenticated === false) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading || isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center min-h-screen" 
                 style={{ backgroundColor: 'var(--light-grey)' }}>
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <span className="text-gray-600">Verifying access...</span>
                </div>
            </div>
        );
    }

    if (isAuthenticated === false) {
        return null;
    }

    return children;
};

export default ProtectedRoute;