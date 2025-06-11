import React, { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';
import { goalService } from '../api';

function AddGoalForm({ onSubmit, onClose }) {
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    icon: "fa-bullseye"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const icons = [
    { value: "fa-plane-departure", label: "Vacation" },
    { value: "fa-shield-alt", label: "Emergency" },
    { value: "fa-car", label: "Car" },
    { value: "fa-laptop", label: "Laptop" },
    { value: "fa-graduation-cap", label: "Education" },
    { value: "fa-home", label: "Home" },
    { value: "fa-bullseye", label: "Other" }
  ];

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
      const goalData = {
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount) || 0,
        targetDate: form.targetDate,
        description: form.description || '',
        icon: form.icon
      };

      const newGoal = await goalService.create(goalData);
      
      // Call parent onSubmit with the created goal
      onSubmit(newGoal);
      
      // Close modal on success
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create goal. Please try again.');
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
      className="modal-content bg-white rounded-2xl shadow-2xl px-8 py-5 mx-4 relative w-full max-w-4xl"
      style={{
        borderTop: '4px solid var(--orange)',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="navy-bg rounded-full p-3 mb-2 shadow" style={{ backgroundColor: 'var(--navy)' }}>
          <i className={`fas ${form.icon} text-2xl`} style={{ color: 'var(--orange)' }}></i>
        </div>
        <h2 id="modal-title" className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>
          Add New Goal
        </h2>
        <p id="modal-description" className="text-gray-500 text-sm text-center">
          Set a new financial goal and track your progress.
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
        {/* Goal Name - full width */}
        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="name" style={{ color: "var(--navy)" }}>
            Goal Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
            style={{
              borderColor: "var(--light-blue)",
              backgroundColor: "var(--light-grey)",
              color: "var(--navy)"
            }}
            required
            placeholder="e.g. Summer Vacation"
          />
        </div>

        {/* Target Amount and Current Amount side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="targetAmount" style={{ color: "var(--navy)" }}>
              Target Amount
            </label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={form.targetAmount}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              min="1"
              step="0.01"
              placeholder="2500.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="currentAmount" style={{ color: "var(--navy)" }}>
              Current Amount
            </label>
            <input
              type="number"
              id="currentAmount"
              name="currentAmount"
              value={form.currentAmount}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              min="0"
              step="0.01"
              placeholder="1200.00"
              required
            />
          </div>
        </div>

        {/* Target Date and Icon side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="targetDate" style={{ color: "var(--navy)" }}>
              Target Date
            </label>
            <input
              type="date"
              id="targetDate"
              name="targetDate"
              value={form.targetDate}
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
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="icon" style={{ color: "var(--navy)" }}>
              Icon
            </label>
            <select
              id="icon"
              name="icon"
              value={form.icon}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
            >
              {icons.map((ic) => (
                <option key={ic.value} value={ic.value}>{ic.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description - full width but compact */}
        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="description" style={{ color: "var(--navy)" }}>
            Description (Optional)
          </label>
          <input
            type="text"
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
            placeholder="e.g. Save for a beach trip"
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
          {isLoading ? 'Creating...' : 'Add Goal'}
        </button>
      </form>
    </motion.div>
  );
}

export default AddGoalForm;