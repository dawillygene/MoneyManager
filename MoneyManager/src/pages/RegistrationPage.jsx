import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../components/RegistrationForm';
import { authService } from '../api/authService';
import { tokenStorage } from '../api/tokenStorage';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const hasValidTokens = authService.isAuthenticated();
        
        if (hasValidTokens) {
          navigate('/dashboard');
          return;
        }

        if (tokenStorage.getRefreshToken()) {
          try {
            const refreshSuccess = await tokenStorage.refreshToken();
            if (refreshSuccess) {
              navigate('/dashboard');
              return;
            }
          } catch (refreshError) {
          }
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
          <i className="fas fa-user-plus text-2xl" style={{ color: 'var(--orange)' }}></i>
        </div>
        <div>
          <h1 className="text-3xl font-bold navy-text" style={{ color: 'var(--navy)' }}>
            Money Manager
          </h1>
          <p className="text-sm text-gray-600">
            Join the financial revolution
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg mx-6">
        <RegistrationForm />
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-gray-500 text-sm z-20">
        <p>&copy; 2025 Money Manager. Secure financial management.</p>
      </div>
    </div>
  );
};

export default RegistrationPage;
