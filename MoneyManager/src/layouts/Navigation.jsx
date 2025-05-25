import React from 'react'

const Navigation = () => {
  return (
<>
 <div className="md:hidden navy-bg text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Money Manager</h1>
        <button id="mobileMenuBtn" className="focus:outline-none">
            <i className="fas fa-bars text-xl"></i>
        </button>
    </div>
    
    <div id="mobileMenu" className="hidden md:hidden navy-bg text-white animate-fadeIn">
        <div className="p-4 space-y-4">
            <a href="#dashboard" className="block py-2 px-4 hover:bg-opacity-20 hover:bg-blue-200 rounded">
                <i className="fas fa-th-large mr-2"></i> Dashboard
            </a>
            <a href="#transactions" className="block py-2 px-4 hover:bg-opacity-20 hover:bg-blue-200 rounded">
                <i className="fas fa-exchange-alt mr-2"></i> Transactions
            </a>
            <a href="#budgets" className="block py-2 px-4 hover:bg-opacity-20 hover:bg-blue-200 rounded">
                <i className="fas fa-chart-pie mr-2"></i> Budgets
            </a>
            <a href="#goals" className="block py-2 px-4 hover:bg-opacity-20 hover:bg-blue-200 rounded">
                <i className="fas fa-bullseye mr-2"></i> Goals
            </a>
            <a href="#reports" className="block py-2 px-4 hover:bg-opacity-20 hover:bg-blue-200 rounded">
                <i className="fas fa-chart-bar mr-2"></i> Reports
            </a>
            <a href="#settings" className="block py-2 px-4 hover:bg-opacity-20 hover:bg-blue-200 rounded">
                <i className="fas fa-cog mr-2"></i> Settings
            </a>
            <div className="pt-4 border-t border-gray-600">
                <a href="#profile" className="flex items-center py-2 px-4">
                    <div className="bg-light-blue-bg rounded-full h-8 w-8 flex items-center justify-center text-navy-bg font-bold">JD</div>
                    <div className="ml-2">
                        <div className="text-sm">John Doe</div>
                        <div className="text-xs text-gray-300">john.doe@example.com</div>
                    </div>
                </a>
                <a href="#logout" className="block py-2 px-4 mt-2 text-orange hover:bg-opacity-20 hover:bg-red-200 rounded">
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                </a>
            </div>
        </div>
    </div>
</>
  )
}

export default Navigation
