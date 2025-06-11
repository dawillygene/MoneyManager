import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { transactionService } from '../api';

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

function EditTransactionForm({ transaction, onSubmit, onClose, fetchTransactions }) {
  const modalRef = useRef(null);
  const [form, setForm] = useState({
    date: transaction?.date?.split('T')[0] || "",
    description: transaction?.description || "",
    category: transaction?.category || "",
    amount: transaction?.amount?.toString() || "",
    type: transaction?.type || "expense",
    notes: transaction?.notes || ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const transactionData = {
        amount: parseFloat(form.amount),
        description: form.description,
        category: form.category,
        type: form.type.toLowerCase(),
        date: form.date,
        notes: form.notes || ''
      };

      const updatedTransaction = await transactionService.update(transaction.id, transactionData);

      if (typeof onSubmit === 'function') {
        onSubmit(updatedTransaction);
      }

      if (typeof fetchTransactions === 'function') {
        fetchTransactions();
      }

      if (typeof onClose === 'function') {
        onClose();
      }

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex flex-col items-center mb-6">
        <div className="navy-bg rounded-full p-3 mb-2 shadow" style={{ backgroundColor: 'var(--navy)' }}>
          <i className="fas fa-edit text-2xl" style={{ color: 'var(--orange)' }}></i>
        </div>
        <h2 id="modal-title" className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>
          Edit Transaction
        </h2>
        <p id="modal-description" className="text-gray-500 text-sm text-center">
          Update the details of this transaction.
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
              <option value="expense">Expense</option>
              <option value="income">Income</option>
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
          <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
          {isLoading ? 'Updating...' : 'Update Transaction'}
        </button>
      </form>
    </motion.div>
  );
}

export default EditTransactionForm;