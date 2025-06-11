import React, { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';
import { goalService } from '../api';

function AddGoalForm({ onSubmit, onClose, categories = [] }) {
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    icon: "fa-bullseye",
    priority: "medium",
    category: "",
    tags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tagInput, setTagInput] = useState("");

  const icons = [
    { value: "fa-plane-departure", label: "Travel/Vacation", category: "travel" },
    { value: "fa-shield-alt", label: "Emergency Fund", category: "emergency" },
    { value: "fa-car", label: "Transportation", category: "transportation" },
    { value: "fa-home", label: "Home/Property", category: "home" },
    { value: "fa-graduation-cap", label: "Education", category: "education" },
    { value: "fa-laptop", label: "Technology", category: "technology" },
    { value: "fa-heartbeat", label: "Health/Wellness", category: "health" },
    { value: "fa-briefcase", label: "Business/Investment", category: "business" },
    { value: "fa-film", label: "Entertainment", category: "entertainment" },
    { value: "fa-gift", label: "Gifts/Events", category: "gifts" },
    { value: "fa-bullseye", label: "Other/General", category: "other" }
  ];

  const priorities = [
    { value: "low", label: "Low Priority", description: "Nice-to-have goals with flexible timelines", color: "text-green-600" },
    { value: "medium", label: "Medium Priority", description: "Important goals with moderate urgency", color: "text-yellow-600" },
    { value: "high", label: "High Priority", description: "Critical goals requiring focused attention", color: "text-red-600" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Auto-select icon based on category
    if (name === 'category') {
      const categoryIcon = icons.find(icon => icon.category === value);
      if (categoryIcon) {
        setForm(prev => ({ ...prev, icon: categoryIcon.value }));
      }
    }
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !form.tags.includes(tag)) {
        setForm(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput("");
      }
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Goal name is required";
    if (form.name.length < 3) return "Goal name must be at least 3 characters";
    if (form.name.length > 100) return "Goal name must be less than 100 characters";
    
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0) return "Target amount must be greater than 0";
    if (parseFloat(form.targetAmount) > 999999999.99) return "Target amount is too large";
    
    if (form.currentAmount && parseFloat(form.currentAmount) > parseFloat(form.targetAmount)) {
      return "Current amount cannot exceed target amount";
    }
    
    if (!form.targetDate) return "Target date is required";
    const targetDate = new Date(form.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (targetDate <= today) return "Target date must be in the future";
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const goalData = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount) || 0,
        targetDate: form.targetDate,
        icon: form.icon,
        priority: form.priority,
        category: form.category || undefined,
        tags: form.tags.length > 0 ? form.tags : undefined
      };

      const newGoal = await goalService.create(goalData);
      
      // Call parent onSubmit with the created goal
      onSubmit(newGoal);
      
      // Close modal on success
      onClose();
    } catch (error) {
      console.error('Goal creation error:', error);
      if (error.response?.data?.code === 'GOAL_DUPLICATE_NAME') {
        setError('A goal with this name already exists. Please choose a different name.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to create goal. Please try again.');
      }
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

  // Set minimum date to tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      ref={modalRef}
      className="modal-content bg-white rounded-2xl shadow-2xl px-8 py-6 mx-4 relative w-full max-w-4xl"
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
      <div className="flex flex-col items-center mb-6">
        <div className="navy-bg rounded-full p-3 mb-3 shadow" style={{ backgroundColor: 'var(--navy)' }}>
          <i className={`fas ${form.icon} text-2xl`} style={{ color: 'var(--orange)' }}></i>
        </div>
        <h2 id="modal-title" className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>
          Create New Goal
        </h2>
        <p id="modal-description" className="text-gray-500 text-sm text-center">
          Set a new financial goal and track your progress towards achieving it.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal Name - full width */}
        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="name" style={{ color: "var(--navy)" }}>
            Goal Name *
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
            maxLength={100}
            placeholder="e.g. Summer Vacation to Europe"
          />
          <div className="text-xs text-gray-500 mt-1">
            {form.name.length}/100 characters
          </div>
        </div>

        {/* Category and Priority side by side */}
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
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="priority" style={{ color: "var(--navy)" }}>
              Priority *
            </label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              required
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              {priorities.find(p => p.value === form.priority)?.description}
            </div>
          </div>
        </div>

        {/* Target Amount and Current Amount side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="targetAmount" style={{ color: "var(--navy)" }}>
              Target Amount (Tsh) *
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
              max="999999999.99"
              step="0.01"
              placeholder="2500000.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="currentAmount" style={{ color: "var(--navy)" }}>
              Current Amount (Tsh)
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
              max={form.targetAmount || "999999999.99"}
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Target Date and Icon side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="targetDate" style={{ color: "var(--navy)" }}>
              Target Date *
            </label>
            <input
              type="date"
              id="targetDate"
              name="targetDate"
              value={form.targetDate}
              onChange={handleChange}
              min={minDateString}
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

        {/* Description - full width */}
        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="description" style={{ color: "var(--navy)" }}>
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
            style={{
              borderColor: "var(--light-blue)",
              backgroundColor: "var(--light-grey)",
              color: "var(--navy)"
            }}
            placeholder="Describe your goal in more detail..."
          />
          <div className="text-xs text-gray-500 mt-1">
            {form.description.length}/500 characters
          </div>
        </div>

        {/* Tags - full width */}
        <div>
          <label className="block text-sm font-medium navy-text mb-1" style={{ color: "var(--navy)" }}>
            Tags (Optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagAdd}
              className="border rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Tags help you organize and filter your goals
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-3 rounded-lg orange-bg text-white font-semibold shadow transition text-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
            style={{ backgroundColor: "var(--orange)" }}
          >
            <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-plus'} mr-2`}></i>
            {isLoading ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default AddGoalForm;