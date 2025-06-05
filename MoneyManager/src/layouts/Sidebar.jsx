import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
    { path: '/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions' },
    { path: '/budgets', icon: 'fas fa-chart-pie', label: 'Budgets' },
    { path: '/goals', icon: 'fas fa-bullseye', label: 'Goals' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
  ];

  const isActive = (path) => location.pathname === path;

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

        {/* Navigation Menu */}
        <div className="flex flex-col flex-grow px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`
                sidebar-item flex items-center py-3 px-4 rounded-xl transition-all duration-200 group relative
                ${isActive(item.path) 
                  ? 'text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                }
              `}
              style={isActive(item.path) ? {
                backgroundColor: 'var(--orange)',
                boxShadow: '0 4px 15px rgba(255, 130, 67, 0.3)'
              } : {}}
            >
              {/* Active indicator */}
              {isActive(item.path) && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full" 
                     style={{ backgroundColor: 'var(--light-blue)' }}></div>
              )}
              
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-lg mr-3 transition-all
                ${isActive(item.path) 
                  ? 'bg-white bg-opacity-20' 
                  : 'group-hover:bg-white group-hover:bg-opacity-10'
                }
              `}>
                <i className={`${item.icon} text-lg`}></i>
              </div>
              
              <span className="font-medium text-sm">{item.label}</span>
              
              {/* Hover arrow */}
              <i className={`
                fas fa-chevron-right ml-auto text-xs transition-all opacity-0 group-hover:opacity-60
                ${isActive(item.path) ? 'opacity-100' : ''}
              `}></i>
            </Link>
          ))}
          
          {/* Settings - separated at bottom */}
          <div className="flex-grow"></div>
          <Link 
            to="/settings" 
            className={`
              sidebar-item flex items-center py-3 px-4 rounded-xl transition-all duration-200 group relative
              ${isActive('/settings') 
                ? 'text-white shadow-lg' 
                : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
              }
            `}
            style={isActive('/settings') ? {
              backgroundColor: 'var(--orange)',
              boxShadow: '0 4px 15px rgba(255, 130, 67, 0.3)'
            } : {}}
          >
            {isActive('/settings') && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full" 
                   style={{ backgroundColor: 'var(--light-blue)' }}></div>
            )}
            
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-lg mr-3 transition-all
              ${isActive('/settings') 
                ? 'bg-white bg-opacity-20' 
                : 'group-hover:bg-white group-hover:bg-opacity-10'
              }
            `}>
              <i className="fas fa-cog text-lg"></i>
            </div>
            
            <span className="font-medium text-sm">Settings</span>
            
            <i className={`
              fas fa-chevron-right ml-auto text-xs transition-all opacity-0 group-hover:opacity-60
              ${isActive('/settings') ? 'opacity-100' : ''}
            `}></i>
          </Link>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-t border-opacity-20" style={{ borderColor: 'var(--light-blue)' }}>
          <div className="flex items-center p-4 rounded-xl bg-white bg-opacity-5 backdrop-blur-sm">
            <div className="rounded-full h-12 w-12 flex items-center justify-center font-bold text-white shadow-lg" 
                 style={{ backgroundColor: 'var(--light-blue)' }}>
              <span style={{ color: 'var(--navy)' }}>JD</span>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-sm font-semibold text-white">John Doe</div>
              <div className="text-xs opacity-75" style={{ color: 'var(--light-blue)' }}>
                john.doe@example.com
              </div>
            </div>
            <div className="relative group">
              <button className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all">
                <i className="fas fa-ellipsis-v text-gray-300 group-hover:text-white"></i>
              </button>
            </div>
          </div>
          
          <button className="flex items-center w-full mt-4 py-2 px-4 rounded-lg transition-all hover:bg-red-500 hover:bg-opacity-20 group" 
                  style={{ color: 'var(--orange)' }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3 group-hover:bg-red-500 group-hover:bg-opacity-20 transition-all">
              <i className="fas fa-sign-out-alt text-sm"></i>
            </div>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
