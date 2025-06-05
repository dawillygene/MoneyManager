import React, { useState } from 'react'
import AddGoalForm from '../components/AddGoalForm';
import AddFundsForm from '../components/AddFundsForm';

const Goals = () => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleAddGoal = (newGoal) => {
    // Logic to add the new goal
    console.log('New Goal Added:', newGoal);
    setShowAddGoal(false);
  };

  const handleAddFunds = (amount) => {
    // Logic to add funds to the selected goal
    console.log(`Added $${amount} to ${selectedGoal}`);
    setShowAddFunds(false);
  };

  return (
   <>
   <section id="goals" className="mb-12">
  <div
    className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
  >
    <h2 className="text-2xl font-bold navy-text mb-2 md:mb-0">Financial Goals</h2>
    <div className="flex space-x-2">
      <button
        className="orange-bg text-white rounded-md px-3 py-1 text-sm hover:bg-opacity-90"
        onClick={() => setShowAddGoal(true)}
      >
        <i className="fas fa-plus mr-2"></i> Add New Goal
      </button>
    </div>
  </div>

  {/* Goals Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Vacation Goal */}
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="h-28 relative" style={{ background: 'linear-gradient(135deg, var(--navy) 0%, rgba(10, 35, 66, 0.8) 100%)' }}>
        <div className="absolute right-4 top-4">
          <button className="text-white opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white hover:bg-opacity-20">
            <i className="fas fa-ellipsis-v text-sm"></i>
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-2 left-4 w-3 h-3 rounded-full bg-white opacity-20"></div>
        <div className="absolute bottom-3 right-8 w-2 h-2 rounded-full bg-white opacity-30"></div>
      </div>
      <div className="p-6 -mt-12 relative">
        <div className="w-24 h-24 rounded-full mx-auto bg-white p-2 shadow-lg ring-4 ring-white">
          <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(142, 202, 230, 0.15)' }}>
            <i className="fas fa-plane-departure text-3xl" style={{ color: 'var(--light-blue)' }}></i>
          </div>
        </div>
        <div className="text-center mt-4">
          <h3 className="text-xl font-bold navy-text" style={{ color: 'var(--navy)' }}>Summer Vacation</h3>
          <p className="text-sm text-gray-500 mt-1">Save for a beach trip</p>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--navy)' }}>
            <span className="font-medium">Progress</span>
            <span className="font-bold">$1,200 / $2,500</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ 
              width: '48%', 
              background: 'linear-gradient(90deg, var(--light-blue) 0%, rgba(142, 202, 230, 0.8) 100%)'
            }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">48% completed</div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-500">Target:</span>
            <span className="font-semibold ml-1" style={{ color: 'var(--navy)' }}>Aug 15, 2025</span>
          </div>
          <button
            className="text-sm text-white px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 hover:shadow-md"
            style={{ backgroundColor: 'var(--orange)' }}
            onClick={() => { setSelectedGoal({ name: 'Summer Vacation' }); setShowAddFunds(true); }}
          >
            <i className="fas fa-plus mr-1"></i>
            Add Funds
          </button>
        </div>
      </div>
    </div>

    {/* Emergency Fund Goal */}
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="h-28 relative" style={{ background: 'linear-gradient(135deg, var(--navy) 0%, rgba(10, 35, 66, 0.8) 100%)' }}>
        <div className="absolute right-4 top-4">
          <button className="text-white opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white hover:bg-opacity-20">
            <i className="fas fa-ellipsis-v text-sm"></i>
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-2 left-4 w-3 h-3 rounded-full bg-white opacity-20"></div>
        <div className="absolute bottom-3 right-8 w-2 h-2 rounded-full bg-white opacity-30"></div>
      </div>
      <div className="p-6 -mt-12 relative">
        <div className="w-24 h-24 rounded-full mx-auto bg-white p-2 shadow-lg ring-4 ring-white">
          <div className="w-full h-full rounded-full bg-green-50 flex items-center justify-center">
            <i className="fas fa-shield-alt text-3xl text-green-500"></i>
          </div>
        </div>
        <div className="text-center mt-4">
          <h3 className="text-xl font-bold navy-text" style={{ color: 'var(--navy)' }}>Emergency Fund</h3>
          <p className="text-sm text-gray-500 mt-1">3 months of expenses</p>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--navy)' }}>
            <span className="font-medium">Progress</span>
            <span className="font-bold">$5,400 / $9,000</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">60% completed</div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-500">Target:</span>
            <span className="font-semibold ml-1" style={{ color: 'var(--navy)' }}>Dec 31, 2025</span>
          </div>
          <button
            className="text-sm text-white px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 hover:shadow-md"
            style={{ backgroundColor: 'var(--orange)' }}
            onClick={() => { setSelectedGoal({ name: 'Emergency Fund' }); setShowAddFunds(true); }}
          >
            <i className="fas fa-plus mr-1"></i>
            Add Funds
          </button>
        </div>
      </div>
    </div>

    {/* New Car Goal */}
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="h-28 relative" style={{ background: 'linear-gradient(135deg, var(--navy) 0%, rgba(10, 35, 66, 0.8) 100%)' }}>
        <div className="absolute right-4 top-4">
          <button className="text-white opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white hover:bg-opacity-20">
            <i className="fas fa-ellipsis-v text-sm"></i>
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-2 left-4 w-3 h-3 rounded-full bg-white opacity-20"></div>
        <div className="absolute bottom-3 right-8 w-2 h-2 rounded-full bg-white opacity-30"></div>
      </div>
      <div className="p-6 -mt-12 relative">
        <div className="w-24 h-24 rounded-full mx-auto bg-white p-2 shadow-lg ring-4 ring-white">
          <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 130, 67, 0.15)' }}>
            <i className="fas fa-car text-3xl" style={{ color: 'var(--orange)' }}></i>
          </div>
        </div>
        <div className="text-center mt-4">
          <h3 className="text-xl font-bold navy-text" style={{ color: 'var(--navy)' }}>New Car</h3>
          <p className="text-sm text-gray-500 mt-1">Down payment for a car</p>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--navy)' }}>
            <span className="font-medium">Progress</span>
            <span className="font-bold">$3,500 / $10,000</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ 
              width: '35%', 
              background: 'linear-gradient(90deg, var(--orange) 0%, rgba(255, 130, 67, 0.8) 100%)'
            }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">35% completed</div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-500">Target:</span>
            <span className="font-semibold ml-1" style={{ color: 'var(--navy)' }}>Jun 30, 2026</span>
          </div>
          <button
            className="text-sm text-white px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 hover:shadow-md"
            style={{ backgroundColor: 'var(--orange)' }}
            onClick={() => { setSelectedGoal({ name: 'New Car' }); setShowAddFunds(true); }}
          >
            <i className="fas fa-plus mr-1"></i>
            Add Funds
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Completed Goals */}
  <div className="mt-12">
    <h3 className="text-xl font-bold navy-text mb-6" style={{ color: 'var(--navy)' }}>Completed Goals</h3>
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="grid grid-cols-4 gap-4">
          <span className="text-sm font-semibold text-gray-700">Goal Name</span>
          <span className="text-sm font-semibold text-gray-700">Target Amount</span>
          <span className="text-sm font-semibold text-gray-700">Completion Date</span>
          <span className="text-sm font-semibold text-gray-700 text-right">Actions</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="flex items-center">
              <div className="rounded-full w-10 h-10 bg-purple-100 flex items-center justify-center mr-3 shadow-sm">
                <i className="fas fa-laptop text-purple-500"></i>
              </div>
              <div>
                <span className="font-semibold" style={{ color: 'var(--navy)' }}>New Laptop</span>
                <p className="text-xs text-gray-500">For work and personal use</p>
              </div>
            </div>
            <div className="font-semibold" style={{ color: 'var(--navy)' }}>$1,200.00</div>
            <div className="text-gray-600">May 10, 2025</div>
            <div className="text-right">
              <button className="text-sm px-3 py-1 rounded-lg font-medium transition-colors hover:bg-gray-100" style={{ color: 'var(--orange)' }}>
                <i className="fas fa-clone mr-1"></i> Duplicate
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="flex items-center">
              <div className="rounded-full w-10 h-10 bg-blue-100 flex items-center justify-center mr-3 shadow-sm">
                <i className="fas fa-graduation-cap text-blue-500"></i>
              </div>
              <div>
                <span className="font-semibold" style={{ color: 'var(--navy)' }}>Certification Course</span>
                <p className="text-xs text-gray-500">Professional development</p>
              </div>
            </div>
            <div className="font-semibold" style={{ color: 'var(--navy)' }}>$800.00</div>
            <div className="text-gray-600">March 15, 2025</div>
            <div className="text-right">
              <button className="text-sm px-3 py-1 rounded-lg font-medium transition-colors hover:bg-gray-100" style={{ color: 'var(--orange)' }}>
                <i className="fas fa-clone mr-1"></i> Duplicate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Add Goal Form - Modal */}
  {showAddGoal && (
    <div 
      className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => {
        // Close modal when clicking on backdrop, but not on the modal content
        if (e.target === e.currentTarget) {
          setShowAddGoal(false);
        }
      }}
    >
      <AddGoalForm
        onSubmit={handleAddGoal}
        onClose={() => setShowAddGoal(false)}
      />
    </div>
  )}

  {/* Add Funds Form - Modal */}
  {showAddFunds && (
    <div 
      className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => {
        // Close modal when clicking on backdrop, but not on the modal content
        if (e.target === e.currentTarget) {
          setShowAddFunds(false);
        }
      }}
    >
      <AddFundsForm
        goalName={selectedGoal?.name}
        onSubmit={handleAddFunds}
        onClose={() => setShowAddFunds(false)}
      />
    </div>
  )}
</section>
   </>
  )
}

export default Goals
