import React, { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';

function AddFundsForm({ goalName, onSubmit, onClose }) {
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    source: "",
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

  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', handleEscapeKey);
    
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
      className="modal-content bg-white rounded-2xl shadow-2xl px-8 py-5 mx-4 relative w-full max-w-2xl"
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
          <i className="fas fa-piggy-bank text-2xl" style={{ color: 'var(--orange)' }}></i>
        </div>
        <h2 id="modal-title" className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>
          Add Funds
        </h2>
        <p id="modal-description" className="text-gray-500 text-sm text-center">
          Add money to your "{goalName}" goal.
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
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="amount" style={{ color: "var(--navy)" }}>
            Amount to Add
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
            min="0.01"
            step="0.01"
            placeholder="100.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="source" style={{ color: "var(--navy)" }}>
            Source of Funds
          </label>
          <select
            id="source"
            name="source"
            value={form.source}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
            style={{
              borderColor: "var(--light-blue)",
              backgroundColor: "var(--light-grey)",
              color: "var(--navy)"
            }}
            required
          >
            <option value="">Select source</option>
            <option value="salary">Salary</option>
            <option value="savings">Savings</option>
            <option value="bonus">Bonus</option>
            <option value="gift">Gift</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="notes" style={{ color: "var(--navy)" }}>
            Notes (Optional)
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
            placeholder="Add any notes about this contribution"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg orange-bg text-white font-semibold shadow hover:opacity-90 transition text-lg mt-2"
          style={{ backgroundColor: "var(--orange)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Funds
        </button>
      </form>
    </motion.div>
  );
}

export default AddFundsForm;