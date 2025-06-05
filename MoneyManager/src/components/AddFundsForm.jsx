import React, { useState } from "react";

function AddFundsForm({ goalName, onSubmit, onClose }) {
  const [form, setForm] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl px-4 py-6 mx-auto relative w-full max-w-md"
      style={{
        borderTop: '6px solid var(--orange)',
        boxShadow: '0 8px 32px 0 rgba(10,35,66,0.10)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <div className="flex flex-col items-center mb-6">
        <div className="navy-bg rounded-full p-3 mb-2 shadow" style={{ backgroundColor: 'var(--navy)' }}>
          <i className="fas fa-piggy-bank text-2xl" style={{ color: 'var(--orange)' }}></i>
        </div>
        <h2 className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>
          Add Funds {goalName ? `to "${goalName}"` : ""}
        </h2>
        <p className="text-gray-500 text-sm text-center">
          Enter the amount you want to add to your goal.
        </p>
        {typeof onClose === "function" && (
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-orange-500 text-2xl"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            &times;
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
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
            min="1"
            required
            placeholder="e.g. 100"
          />
        </div>
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
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="note" style={{ color: "var(--navy)" }}>
            Note (optional)
          </label>
          <textarea
            id="note"
            name="note"
            value={form.note}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
            style={{
              borderColor: "var(--light-blue)",
              backgroundColor: "var(--light-grey)",
              color: "var(--navy)"
            }}
            rows={2}
            placeholder="e.g. Bonus, savings, etc."
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
    </div>
  );
}

export default AddFundsForm;