import React, { useState } from 'react';
import AddGoalForm from '../components/AddGoalForm';
import AddFundsForm from '../components/AddFundsForm';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);

  const handleAddGoal = (newGoal) => {
    setGoals([...goals, newGoal]);
    setShowAddGoal(false);
  };

  const handleAddFunds = (selectedGoal, amount) => {
    setShowAddFunds(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Goal
          </button>
          <button
            onClick={() => setShowAddFunds(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Add Funds
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">{goal.name}</h3>
            <p className="text-gray-600 mb-4">{goal.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Target:</span>
                <span className="font-semibold">${goal.targetAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Current:</span>
                <span className="font-semibold">${goal.currentAmount || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${((goal.currentAmount || 0) / goal.targetAmount) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddGoal && (
        <AddGoalForm
          onSubmit={handleAddGoal}
          onClose={() => setShowAddGoal(false)}
        />
      )}

      {showAddFunds && (
        <AddFundsForm
          goals={goals}
          onSubmit={handleAddFunds}
          onClose={() => setShowAddFunds(false)}
        />
      )}
    </div>
  );
};

export default Goals;
