import React from 'react'

const SideBar = () => {
  return (
  <>
  <div className="hidden md:flex md:w-64 navy-bg text-white flex-shrink-0 flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center">
                <i className="fas fa-wallet text-2xl text-orange mr-2"></i>
                <h1 className="text-xl font-bold">Money Manager</h1>
            </div>
            <div className="flex flex-col flex-grow p-4 space-y-2">
                <a href="dashboard" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
                    <i className="fas fa-th-large mr-3 w-5 text-center"></i> Dashboard
                </a>
                <a href="#transactions" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
                    <i className="fas fa-exchange-alt mr-3 w-5 text-center"></i> Transactions
                </a>
                <a href="#budgets" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
                    <i className="fas fa-chart-pie mr-3 w-5 text-center"></i> Budgets
                </a>
                <a href="#goals" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
                    <i className="fas fa-bullseye mr-3 w-5 text-center"></i> Goals
                </a>
                <a href="#reports" className="sidebar-item flex items-center py-2 px-4 rounded transition-all">
                    <i className="fas fa-chart-bar mr-3 w-5 text-center"></i> Reports
                </a>
                <a href="#settings" className="sidebar-item flex items-center py-2 px-4 rounded transition-all mt-auto">
                    <i className="fas fa-cog mr-3 w-5 text-center"></i> Settings
                </a>
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

export default SideBar
