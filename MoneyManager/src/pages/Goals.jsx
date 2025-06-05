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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-24 navy-bg relative">
        <div className="absolute right-4 top-4">
          <button className="text-white opacity-50 hover:opacity-100">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      <div className="p-4 -mt-12">
        <div className="w-20 h-20 rounded-full mx-auto bg-white p-1 shadow">
          <div
            className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center"
          >
            <i className="fas fa-plane-departure text-2xl light-blue-text"></i>
          </div>
        </div>
        <div className="text-center mt-3">
          <h3 className="text-lg font-semibold navy-text">Summer Vacation</h3>
          <p className="text-sm text-gray-500">Save for a beach trip</p>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>$1,200 / $2,500</span>
          </div>
          <div className="progress-bar bg-gray-200">
            <div className="progress-fill light-blue-bg" style={{ width: '48%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">48% completed</div>
        </div>
        <div
          className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center"
        >
          <div className="text-sm">
            <span className="text-gray-500">Target date:</span>
            <span className="font-medium">Aug 15, 2023</span>
          </div>
          <button
            className="text-sm navy-bg text-white px-3 py-1 rounded-md hover:bg-opacity-90"
            onClick={() => { setSelectedGoal('Summer Vacation'); setShowAddFunds(true); }}
          >
            Add Funds
          </button>
        </div>
      </div>
    </div>

    {/* Emergency Fund Goal */}
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-24 navy-bg relative">
        <div className="absolute right-4 top-4">
          <button className="text-white opacity-50 hover:opacity-100">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      <div className="p-4 -mt-12">
        <div className="w-20 h-20 rounded-full mx-auto bg-white p-1 shadow">
          <div
            className="w-full h-full rounded-full bg-green-100 flex items-center justify-center"
          >
            <i className="fas fa-shield-alt text-2xl text-green-500"></i>
          </div>
        </div>
        <div className="text-center mt-3">
          <h3 className="text-lg font-semibold navy-text">Emergency Fund</h3>
          <p className="text-sm text-gray-500">3 months of expenses</p>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>$5,400 / $9,000</span>
          </div>
          <div className="progress-bar bg-gray-200">
            <div className="progress-fill bg-green-500" style={{ width: '60%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">60% completed</div>
        </div>
        <div
          className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center"
        >
          <div className="text-sm">
            <span className="text-gray-500">Target date:</span>
            <span className="font-medium">Dec 31, 2023</span>
          </div>
          <button
            className="text-sm navy-bg text-white px-3 py-1 rounded-md hover:bg-opacity-90"
            onClick={() => { setSelectedGoal('Emergency Fund'); setShowAddFunds(true); }}
          >
            Add Funds
          </button>
        </div>
      </div>
    </div>

    {/* New Car Goal */}
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-24 navy-bg relative">
        <div className="absolute right-4 top-4">
          <button className="text-white opacity-50 hover:opacity-100">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      <div className="p-4 -mt-12">
        <div className="w-20 h-20 rounded-full mx-auto bg-white p-1 shadow">
          <div
            className="w-full h-full rounded-full orange-bg bg-opacity-20 flex items-center justify-center"
          >
            <i className="fas fa-car text-2xl orange-text"></i>
          </div>
        </div>
        <div className="text-center mt-3">
          <h3 className="text-lg font-semibold navy-text">New Car</h3>
          <p className="text-sm text-gray-500">Down payment for a car</p>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>$3,500 / $10,000</span>
          </div>
          <div className="progress-bar bg-gray-200">
            <div className="progress-fill orange-bg" style={{ width: '35%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">35% completed</div>
        </div>
        <div
          className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center"
        >
          <div className="text-sm">
            <span className="text-gray-500">Target date:</span>
            <span className="font-medium">Jun 30, 2024</span>
          </div>
          <button
            className="text-sm navy-bg text-white px-3 py-1 rounded-md hover:bg-opacity-90"
            onClick={() => { setSelectedGoal('New Car'); setShowAddFunds(true); }}
          >
            Add Funds
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Completed Goals */}
  <div className="mt-8">
    <h3 className="text-lg font-semibold navy-text mb-4">Completed Goals</h3>
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left font-medium">Goal Name</th>
            <th className="py-3 px-4 text-left font-medium">Target Amount</th>
            <th className="py-3 px-4 text-left font-medium">Completion Date</th>
            <th className="py-3 px-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-3 px-4 text-sm">
              <div className="flex items-center">
                <div
                  className="rounded-full w-8 h-8 bg-purple-100 flex items-center justify-center mr-2"
                >
                  <i className="fas fa-laptop text-purple-500"></i>
                </div>
                <div>
                  <span className="font-medium">New Laptop</span>
                  <p className="text-xs text-gray-500">For work and personal use</p>
                </div>
              </div>
            </td>
            <td className="py-3 px-4 text-sm">$1,200.00</td>
            <td className="py-3 px-4 text-sm">May 10, 2023</td>
            <td className="py-3 px-4 text-right">
              <button className="text-sm text-blue-500 hover:text-blue-700">
                <i className="fas fa-clone mr-1"></i> Duplicate
              </button>
            </td>
          </tr>
          <tr>
            <td className="py-3 px-4 text-sm">
              <div className="flex items-center">
                <div
                  className="rounded-full w-8 h-8 bg-blue-100 flex items-center justify-center mr-2"
                >
                  <i className="fas fa-graduation-cap text-blue-500"></i>
                </div>
                <div>
                  <span className="font-medium">Certification Course</span>
                  <p className="text-xs text-gray-500">Professional development</p>
                </div>
              </div>
            </td>
            <td className="py-3 px-4 text-sm">$800.00</td>
            <td className="py-3 px-4 text-sm">March 15, 2023</td>
            <td className="py-3 px-4 text-right">
              <button className="text-sm text-blue-500 hover:text-blue-700">
                <i className="fas fa-clone mr-1"></i> Duplicate
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  {/* Add Goal Form - Modal */}
  {showAddGoal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <AddGoalForm
        onSubmit={handleAddGoal}
        onClose={() => setShowAddGoal(false)}
      />
    </div>
  )}

  {/* Add Funds Form - Modal */}
  {showAddFunds && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
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
