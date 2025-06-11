import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { authService } from '../api/authService';
import { tokenStorage } from '../api/tokenStorage';
import API_CONFIG from '../api/config';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
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
            
            const redirectRoute = tokenStorage.getLastRoute();
            tokenStorage.clearLastRoute();
            navigate(redirectRoute);
            return;
          } else {
            const errorData = await response.json();
          }
        } catch (verifyError) {
        }
        
        const hasLoginStatus = authService.isAuthenticated();
        
        if (hasLoginStatus) {
          const redirectRoute = tokenStorage.getLastRoute();
          tokenStorage.clearLastRoute();
          navigate(redirectRoute);
          return;
        }
        
      } catch (error) {
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" 
           style={{ backgroundColor: 'var(--light-grey)' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" 
         style={{ 
           backgroundColor: 'var(--light-grey)',
           background: `linear-gradient(135deg, var(--light-grey) 0%, rgba(142, 202, 230, 0.1) 50%, var(--light-grey) 100%)`
         }}>
      {/* Background decorative elements - full coverage */}
      <div className="absolute inset-0 w-full h-full">
        {/* Geometric shapes for visual interest */}
        <div className="absolute top-40 left-10 w-40 h-40 rounded-full opacity-8" style={{ backgroundColor: 'var(--navy)' }}></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 rounded-full opacity-8" style={{ backgroundColor: 'var(--orange)' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full opacity-5" style={{ backgroundColor: 'var(--light-blue)' }}></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 rounded-full opacity-5" style={{ backgroundColor: 'var(--orange)' }}></div>
        <div className="absolute top-1/4 right-1/3 w-20 h-20 rounded-full opacity-3" style={{ backgroundColor: 'var(--navy)' }}></div>
        <div className="absolute bottom-1/4 right-10 w-16 h-16 rounded-full opacity-4" style={{ backgroundColor: 'var(--light-blue)' }}></div>
        
        {/* Additional decorative elements for full coverage */}
        <div className="absolute top-0 left-1/2 w-36 h-36 rounded-full opacity-3" style={{ backgroundColor: 'var(--light-blue)' }}></div>
        <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full opacity-6" style={{ backgroundColor: 'var(--navy)' }}></div>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5" style={{ backgroundColor: 'var(--orange)' }}></div>
        
        {/* Subtle grid pattern covering full screen */}
        <div className="absolute inset-0 w-full h-full opacity-3" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--navy) 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }}></div>
        
        {/* Additional overlay for depth */}
        <div className="absolute inset-0 w-full h-full" style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(10, 35, 66, 0.02) 100%)`
        }}></div>
      </div>

      {/* Header with branding */}
      <div className="absolute top-8 left-8 flex items-center z-20">
        <div className="navy-bg rounded-full p-3 mr-4 shadow-lg" style={{ backgroundColor: 'var(--navy)' }}>
          <i className="fas fa-wallet text-2xl" style={{ color: 'var(--orange)' }}></i>
        </div>
        <div>
          <h1 className="text-3xl font-bold navy-text" style={{ color: 'var(--navy)' }}>
            Money Manager
          </h1>
          <p className="text-sm text-gray-600">
            Take control of your finances
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg mx-6">
        <LoginForm />
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-gray-500 text-sm z-20">
        <p>&copy; 2025 Money Manager. Secure financial management.</p>
      </div>
    </div>
  );
};

export default LoginPage;
