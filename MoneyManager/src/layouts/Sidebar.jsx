import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../api'

// Cookie utility functions
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get user info from cookies instead of localStorage
  let user = {};
  try {
      const userCookie = getCookie('user');
      user = userCookie && userCookie !== 'undefined' ? JSON.parse(userCookie) : {};
  } catch {
      user = {};
  }
  const displayName = user.fullName || user.name || user.email || 'User';
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-th-large', label: 'Dashboard', description: 'Overview & insights' },
    { path: '/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions', description: 'Income & expenses' },
    { path: '/budgets', icon: 'fas fa-chart-pie', label: 'Budgets', description: 'Spending limits' },
    { path: '/goals', icon: 'fas fa-bullseye', label: 'Goals', description: 'Savings targets' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports', description: 'Analytics & trends' },
    { path: '/profile', icon: 'fas fa-user-cog', label: 'Profile', description: 'Account settings' },
  ];

  const isActive = (path) => location.pathname === path;

  // Logout handler using the new authentication service
  const handleLogout = async () => {
    try {
      await authService.logout();
      // authService.logout() already handles clearing tokens and redirecting
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local tokens and redirect
      navigate('/login');
    }
  };

  return (
    <>
      <div className={`hidden md:flex ${isCollapsed ? 'md:w-20' : 'md:w-72'} flex-shrink-0 flex-col shadow-xl transition-all duration-300 ease-in-out relative`} 
           style={{ 
             backgroundColor: 'var(--navy)',
             background: `linear-gradient(180deg, var(--navy) 0%, rgba(10, 35, 66, 0.9) 100%)`
           }}>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          style={{ backgroundColor: 'var(--orange)' }}
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-white text-xs`}></i>
        </button>
        
        {/* Header */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          <div className="flex items-center">
            <div className="rounded-xl p-3 mr-4 shadow-lg" style={{ backgroundColor: 'var(--orange)' }}>
              <i className="fas fa-wallet text-2xl text-white"></i>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">Money Manager</h1>
                <p className="text-xs font-medium" style={{ color: 'var(--light-blue)' }}>
                  Financial Dashboard
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg" 
                   style={{ backgroundColor: 'var(--light-blue)' }}>
                {userInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" 
                   style={{ backgroundColor: 'var(--orange)' }}></div>
            </div>
            {!isCollapsed && (
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--light-blue)' }}>
                  {user.email || 'Premium Account'}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: 'var(--orange)' }}></div>
                  <span className="text-xs" style={{ color: 'var(--orange)' }}>Online</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                  isActive(item.path)
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 hover:transform hover:scale-102'
                }`}
                style={isActive(item.path) ? { 
                  backgroundColor: 'var(--orange)',
                  boxShadow: '0 4px 15px rgba(242, 153, 74, 0.3)'
                } : {}}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${
                  isActive(item.path) 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-white bg-opacity-5 group-hover:bg-opacity-15'
                }`}>
                  <i className={`${item.icon} text-base`}></i>
                </div>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs opacity-70 truncate">{item.description}</p>
                  </div>
                )}
                {isActive(item.path) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          {!isCollapsed && (
            <div className="mt-8 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 backdrop-blur-sm">
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Quick Overview
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">This Month</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--orange)' }}>+12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Budget Used</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--light-blue)' }}>67%</span>
                </div>
                <div className="w-full bg-gray-700 bg-opacity-50 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-500" 
                       style={{ 
                         width: '67%', 
                         background: `linear-gradient(90deg, var(--orange) 0%, var(--light-blue) 100%)`
                       }}></div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          {/* Help & Support */}
          {!isCollapsed && (
            <div className="mb-4 p-3 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-question-circle text-sm" style={{ color: 'var(--light-blue)' }}></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Need Help?</p>
                  <p className="text-xs" style={{ color: 'var(--light-blue)' }}>24/7 Support</p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg transition-all duration-200 hover:text-white hover:bg-red-500 hover:bg-opacity-20 group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white bg-opacity-5 group-hover:bg-red-500 group-hover:bg-opacity-20 transition-colors duration-200">
              <i className="fas fa-sign-out-alt text-base"></i>
            </div>
            {!isCollapsed && (
              <span className="ml-3">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Button - Fixed position */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: 'var(--orange)' }}
      >
        <i className="fas fa-bars text-white text-lg"></i>
      </button>

      {/* Mobile Sidebar Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
        isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ 
        backgroundColor: 'var(--navy)',
        background: `linear-gradient(180deg, var(--navy) 0%, rgba(10, 35, 66, 0.9) 100%)`
      }}>
        
        {/* Mobile Header */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-xl p-3 mr-4 shadow-lg" style={{ backgroundColor: 'var(--orange)' }}>
                <i className="fas fa-wallet text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Money Manager</h1>
                <p className="text-xs font-medium" style={{ color: 'var(--light-blue)' }}>
                  Financial Dashboard
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        {/* Mobile User Profile */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg" 
                   style={{ backgroundColor: 'var(--light-blue)' }}>
                {userInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" 
                   style={{ backgroundColor: 'var(--orange)' }}></div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {displayName}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--light-blue)' }}>
                {user.email || 'Premium Account'}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: 'var(--orange)' }}></div>
                <span className="text-xs" style={{ color: 'var(--orange)' }}>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                  isActive(item.path)
                    ? 'text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
                style={isActive(item.path) ? { 
                  backgroundColor: 'var(--orange)',
                  boxShadow: '0 4px 15px rgba(242, 153, 74, 0.3)'
                } : {}}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 mr-3 ${
                  isActive(item.path) 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-white bg-opacity-5 group-hover:bg-opacity-15'
                }`}>
                  <i className={`${item.icon} text-base`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs opacity-70 truncate">{item.description}</p>
                </div>
                {isActive(item.path) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Bottom Section */}
        <div className="p-4 border-t border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          {/* Mobile Help & Support */}
          <div className="mb-4 p-3 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-question-circle text-sm" style={{ color: 'var(--light-blue)' }}></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Need Help?</p>
                <p className="text-xs" style={{ color: 'var(--light-blue)' }}>24/7 Support</p>
              </div>
            </div>
          </div>

          {/* Mobile Logout */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg transition-all duration-200 hover:text-white hover:bg-red-500 hover:bg-opacity-20"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white bg-opacity-5 group-hover:bg-red-500 group-hover:bg-opacity-20 transition-colors duration-200 mr-3">
              <i className="fas fa-sign-out-alt text-base"></i>
            </div>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
