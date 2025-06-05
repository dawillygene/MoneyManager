import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  "Food & Dining",
  "Income",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Housing",
  "Healthcare",
  "Other"
];

function AddTransactionForm({ onSubmit, onClose }) {
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "Expense",
    notes: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
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
      className="modal-content bg-white rounded-2xl shadow-2xl px-6 py-6 mx-4 relative w-full max-w-lg"
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
          <i className="fas fa-receipt text-2xl" style={{ color: 'var(--orange)' }}></i>
        </div>
        <h2 id="modal-title" className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>
          Add Transaction
        </h2>
        <p id="modal-description" className="text-gray-500 text-sm text-center">
          Record a new income or expense for your account.
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
        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="date" style={{ color: "var(--navy)" }}>
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
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
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="description" style={{ color: "var(--navy)" }}>
            Description
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
            required
            placeholder="e.g. Grocery Shopping"
          />
        </div>
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
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="amount" style={{ color: "var(--navy)" }}>
              Amount
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
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="type" style={{ color: "var(--navy)" }}>
              Type
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
              style={{
                borderColor: "var(--light-blue)",
                backgroundColor: "var(--light-grey)",
                color: "var(--navy)"
              }}
              required
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="notes" style={{ color: "var(--navy)" }}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
            style={{
              borderColor: "var(--light-blue)",
              backgroundColor: "var(--light-grey)",
              color: "var(--navy)"
            }}
            rows={2}
            placeholder="Optional"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-lg orange-bg text-white font-semibold shadow hover:opacity-90 transition text-lg mt-2"
          style={{ backgroundColor: "var(--orange)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Transaction
        </button>
      </form>
    </motion.div>
  );
}

export default AddTransactionForm;