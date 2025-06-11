import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api/authService';
import { tokenStorage } from '../api/tokenStorage';
import API_CONFIG from '../api/config';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const interceptRouteAccess = async () => {
            try {
                const currentRoute = location.pathname;
                
                try {
                    const response = await fetch(`${API_CONFIG.FULL_API_URL}/auth/verify`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (data.accessToken) {
                            tokenStorage.setAccessToken(data.accessToken);
                            tokenStorage.setLoginStatus();
                            
                            if (data.user) {
                                const setCookie = (name, value, maxAge = null) => {
                                    let cookieString = `${name}=${value}; path=/; SameSite=Lax`;
                                    if (maxAge) {
                                        cookieString += `; max-age=${maxAge}`;
                                    }
                                    document.cookie = cookieString;
                                };
                                
                                setCookie('user', JSON.stringify({
                                    name: data.user.name,
                                    email: data.user.email
                                }), 604800);
                            }
                        }
                        
                        setIsAuthenticated(true);
                        setIsLoading(false);
                        return;
                    } else {
                        const errorData = await response.json();
                    }
                } catch (verifyError) {
                }

                const hasLoginStatus = authService.isAuthenticated();
                
                if (!hasLoginStatus) {
                    tokenStorage.setLastRoute(currentRoute);
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
                
            } catch (error) {
                tokenStorage.setLastRoute(location.pathname);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        interceptRouteAccess();
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