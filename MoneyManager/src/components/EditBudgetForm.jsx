import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { budgetService } from '../api';

const EditBudgetForm = ({ budget, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    category: '',
    startDate: '',
    endDate: '',
    recurring: 'none',
    alertLevel: 80,
    tags: []
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name || '',
        description: budget.description || '',
        amount: budget.amount || '',
        category: budget.category || '',
        startDate: budget.startDate || '',
        endDate: budget.endDate || '',
        recurring: budget.recurring || 'none',
        alertLevel: budget.alertLevel || 80,
        tags: budget.tags || []
      });
    }
  }, [budget]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await budgetService.getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updatedBudget = await budgetService.update(budget.id, formData);
      onSubmit(updatedBudget);
    } catch (error) {
      console.error('Error updating budget:', error);
      setError('Failed to update budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold navy-text">Edit Budget</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (Tsh)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recurring
          </label>
          <select
            name="recurring"
            value={formData.recurring}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alert Level (%)
          </label>
          <input
            type="range"
            name="alertLevel"
            value={formData.alertLevel}
            onChange={handleChange}
            min="1"
            max="100"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1%</span>
            <span className="font-medium">{formData.alertLevel}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 orange-bg text-white py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Budget'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditBudgetForm;