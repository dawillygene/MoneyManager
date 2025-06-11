import React from 'react'
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

  // Get user info from cookies instead of localStorage
  let user = {};
  try {
      const userCookie = getCookie('user');
      user = userCookie && userCookie !== 'undefined' ? JSON.parse(userCookie) : {};
  } catch {
      user = {};
  }
  const displayName = user.fullName || user.name || user.email || 'User';

  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
    { path: '/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions' },
    { path: '/budgets', icon: 'fas fa-chart-pie', label: 'Budgets' },
    { path: '/goals', icon: 'fas fa-bullseye', label: 'Goals' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
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
      <div className="hidden md:flex md:w-72 flex-shrink-0 flex-col shadow-xl" 
           style={{ 
             backgroundColor: 'var(--navy)',
             background: `linear-gradient(180deg, var(--navy) 0%, rgba(10, 35, 66, 0.95) 100%)`
           }}>
        {/* Header */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          <div className="flex items-center">
            <div className="rounded-full p-3 mr-4 shadow-lg" style={{ backgroundColor: 'var(--orange)' }}>
              <i className="fas fa-wallet text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Money Manager</h1>
              <p className="text-xs opacity-75" style={{ color: 'var(--light-blue)' }}>
                Financial Control Center
              </p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" 
                 style={{ backgroundColor: 'var(--light-blue)' }}>
              <i className="fas fa-user text-white"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-300 truncate">
                {user.email || 'User Account'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
              style={isActive(item.path) ? { backgroundColor: 'var(--orange)' } : {}}
            >
              <i className={`${item.icon} mr-3 text-base`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg transition-all duration-200 hover:text-white hover:bg-white hover:bg-opacity-10"
          >
            <i className="fas fa-sign-out-alt mr-3 text-base"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Sidebar (simplified for now) */}
      <div className="md:hidden">
        {/* Mobile navigation can be implemented here if needed */}
      </div>
    </>
  )
}

export default Sidebar
