import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <>
      <div className="hidden md:flex md:w-64 navy-bg text-white flex-shrink-0 flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center">
          <i className="fas fa-wallet text-2xl text-orange mr-2"></i>
          <h1 className="text-xl font-bold">Money Manager</h1>
        </div>
        <div className="flex flex-col flex-grow p-4 space-y-2">
          <Link to="/dashboard" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
            <i className="fas fa-th-large mr-3 w-5 text-center"></i> Dashboard
          </Link>
          <Link to="/transactions" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
            <i className="fas fa-exchange-alt mr-3 w-5 text-center"></i> Transactions
          </Link>
          <Link to="/budgets" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
            <i className="fas fa-chart-pie mr-3 w-5 text-center"></i> Budgets
          </Link>
          <Link to="/goals" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
            <i className="fas fa-bullseye mr-3 w-5 text-center"></i> Goals
          </Link>
          <Link to="/reports" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
            <i className="fas fa-chart-bar mr-3 w-5 text-center"></i> Reports
          </Link>
          <Link to="/settings" className="sidebar-item flex items-center py-2 px-4 rounded transition-all mt-auto">
            <i className="fas fa-cog mr-3 w-5 text-center"></i> Settings
          </Link>
        </div>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="bg-light-blue-bg rounded-full h-10 w-10 flex items-center justify-center text-navy-bg font-bold">JD</div>
            <div className="ml-3">
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-gray-300">john.doe@example.com</div>
            </div>
          </div>
          <a href="#logout" className="flex items-center text-orange mt-4 hover:text-orange-300 transition-all">
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
          </a>
        </div>
      </div>
    </>
  )
}

export default Sidebar
