import React, { useState } from "react";

function AddGoalForm({ onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    icon: "fa-bullseye"
  });

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
          <i className={`fas ${form.icon} text-2xl`} style={{ color: 'var(--orange)' }}></i>
        </div>
        <h2 className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>
          Add New Goal
        </h2>
        <p className="text-gray-500 text-sm text-center">
          Set a new financial goal and track your progress.
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
            placeholder="e.g. Save for a beach trip"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
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
              required
              placeholder="e.g. 2500"
            />
          </div>
          <div className="flex-1">
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
              required
              placeholder="e.g. 1200"
            />
          </div>
        </div>
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
        <button
          type="submit"
          className="w-full py-2 rounded-lg orange-bg text-white font-semibold shadow hover:opacity-90 transition text-lg mt-2"
          style={{ backgroundColor: "var(--orange)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Goal
        </button>
      </form>
    </div>
  );
}

export default AddGoalForm;