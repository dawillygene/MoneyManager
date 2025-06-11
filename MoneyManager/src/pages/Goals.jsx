import React, { useState, useEffect } from 'react';
import AddGoalForm from '../components/AddGoalForm';
import AddFundsForm from '../components/AddFundsForm';
import { goalService } from '../api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const fetchedGoals = await goalService.getAll();
      setGoals(fetchedGoals);
      setError(null);
    } catch (err) {
      setError('Failed to fetch goals. Please try again.');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (newGoal) => {
    try {
      // The API call is handled in AddGoalForm, so we just need to refresh the list
      await fetchGoals();
      setShowAddGoal(false);
    } catch (err) {
      console.error('Error after adding goal:', err);
    }
  };

  const handleAddFunds = async (fundData) => {
    try {
      if (selectedGoal) {
        // Update the goal's current amount
        const updatedGoalData = {
          ...selectedGoal,
          currentAmount: (selectedGoal.currentAmount || 0) + parseFloat(fundData.amount)
        };
        
        await goalService.update(selectedGoal.id, updatedGoalData);
        await fetchGoals(); // Refresh the goals list
      }
      setShowAddFunds(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error('Error adding funds:', err);
    }
  };

  const openAddFundsModal = (goal) => {
    setSelectedGoal(goal);
    setShowAddFunds(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-gray-600">Loading goals...</div>
      </div>
    );
  }

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
            disabled={goals.length === 0}
          >
            Add Funds
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 mb-4">
              <i className="fas fa-bullseye text-4xl mb-2"></i>
              <p>No goals yet. Create your first financial goal!</p>
            </div>
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Add Your First Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = ((goal.currentAmount || 0) / goal.targetAmount) * 100;
            return (
              <div key={goal.id || goal._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  <i className={`fas ${goal.icon || 'fa-bullseye'} text-orange-500 mr-2`}></i>
                  <h3 className="text-lg font-semibold">{goal.name}</h3>
                </div>
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
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {progress.toFixed(1)}% complete
                  </div>
                  {goal.targetDate && (
                    <div className="text-sm text-gray-500">
                      Target date: {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openAddFundsModal(goal)}
                  className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Funds
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal backdrop and forms */}
      {(showAddGoal || showAddFunds) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {showAddGoal && (
            <AddGoalForm
              onSubmit={handleAddGoal}
              onClose={() => setShowAddGoal(false)}
            />
          )}

          {showAddFunds && selectedGoal && (
            <AddFundsForm
              goalName={selectedGoal.name}
              onSubmit={handleAddFunds}
              onClose={() => {
                setShowAddFunds(false);
                setSelectedGoal(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Goals;
