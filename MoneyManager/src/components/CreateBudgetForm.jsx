import React, { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';
import { budgetService } from '../api';

const categories = [
  "Housing",
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Other"
];

function CreateBudgetForm({ onSubmit, onClose }) {
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    startDate: "",
    endDate: "",
    description: "",
    recurring: "None",
    alertLevel: 80
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const budgetData = {
        name: form.category, // Use category as name
        amount: parseFloat(form.amount),
        category: form.category,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description || '',
        recurring: form.recurring,
        alertLevel: parseInt(form.alertLevel)
      };

      const result = await budgetService.create(budgetData);
      
      // Call parent onSubmit with the created budget
      onSubmit(result);
      
      // Close modal on success
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle escape key to close modal and manage body scroll
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    // Prevent body scroll when modal is open
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', handleEscapeKey);
    
    // Focus the modal when it opens
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      ref={modalRef}
      className="modal-content bg-white rounded-2xl shadow-2xl px-6 py-6 mx-4 relative w-full max-w-xl"
      style={{
        borderTop: '4px solid var(--orange)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Top icon and close button */}
      <div className="flex flex-col items-center mb-6">
        <div className="navy-bg rounded-full p-3 mb-2 shadow" style={{ backgroundColor: 'var(--navy)' }}>
          <i className="fas fa-wallet text-2xl" style={{ color: 'var(--orange)' }}></i>
        </div>
        <h2 id="modal-title" className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>
          Create New Budget
        </h2>
        <p id="modal-description" className="text-gray-500 text-sm text-center">
          Set a budget for your spending category and track your progress.
        </p>
        {typeof onClose === "function" && (
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-orange-500 text-2xl transition-colors"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            &times;
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category and Amount in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="category" style={{ color: "var(--navy)" }}>
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="amount" style={{ color: "var(--navy)" }}>
              Budget Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="startDate" style={{ color: "var(--navy)" }}>
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="endDate" style={{ color: "var(--navy)" }}>
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              required
            />
          </div>
        </div>

        {/* Recurring and Alert Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="recurring" style={{ color: "var(--navy)" }}>
              Recurring
            </label>
            <select
              id="recurring"
              name="recurring"
              value={form.recurring}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
            >
              <option value="None">None</option>
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="alertLevel" style={{ color: "var(--navy)" }}>
              Alert at (%)
            </label>
            <input
              type="number"
              id="alertLevel"
              name="alertLevel"
              value={form.alertLevel}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              min="1"
              max="100"
              placeholder="80"
            />
          </div>
        </div>

        {/* Description - full width but compact */}
        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="description" style={{ color: "var(--navy)" }}>
            Notes (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
            style={{
              borderColor: "var(--light-blue)",
              backgroundColor: "var(--light-grey)",
              color: "var(--navy)"
            }}
            rows={2}
            placeholder="Optional budget description or notes"
          />
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded-lg orange-bg text-white font-semibold shadow transition text-lg mt-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{ backgroundColor: "var(--orange)" }}
        >
          <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-plus'} mr-2`}></i>
          {isLoading ? 'Creating...' : 'Create Budget'}
        </button>
      </form>
    </motion.div>
  );
}

export default CreateBudgetForm;