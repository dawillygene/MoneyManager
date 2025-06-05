import React, { useState } from "react";

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
  const [form, setForm] = useState({
    category: "",
    amount: "",
    startDate: "",
    endDate: "",
    description: "",
    recurring: "None",
    alertLevel: 80
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
        maxHeight: '90vh',           // Limit modal height to 90% of viewport
        overflowY: 'auto'            // Enable vertical scroll if needed
      }}
    >
      {/* Top icon and close button */}
      <div className="flex flex-col items-center mb-6">
        <div className="navy-bg rounded-full p-3 mb-2 shadow" style={{ backgroundColor: 'var(--navy)' }}>
          <i className="fas fa-wallet text-2xl" style={{ color: 'var(--orange)' }}></i>
        </div>
        <h2 className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>
          Create New Budget
        </h2>
        <p className="text-gray-500 text-sm text-center">
          Set a budget for your spending category and track your progress.
        </p>
        {/* Optional close button for modal usage */}
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
            min="0"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
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
          <div className="flex-1">
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
        <div>
          <label className="block text-sm font-medium navy-text mb-1" htmlFor="description" style={{ color: "var(--navy)" }}>
            Description
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
            placeholder="Optional"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
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
          <div className="flex-1">
            <label className="block text-sm font-medium navy-text mb-1" htmlFor="alertLevel" style={{ color: "var(--navy)" }}>
              Alert Level (%)
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
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-lg orange-bg text-white font-semibold shadow hover:opacity-90 transition text-lg mt-2"
          style={{ backgroundColor: "var(--orange)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Create Budget
        </button>
      </form>
    </div>
  );
}

export default CreateBudgetForm;