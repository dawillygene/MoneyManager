import React, { useState } from 'react';
import AddTransactionForm from '../components/AddTransactionForm';

// EXAMPLE: Replace with your actual transaction data source!
const initialTransactions = [
  // ... your transaction objects here (date, description, category, amount, type: 'Income' or 'Expense') ...
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "housing", label: "Housing" },
  { value: "food", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "income", label: "Income" },
];

const Transaction = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);

  // Filter states
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState("this-month");
  const [search, setSearch] = useState("");

  const handleAddTransaction = (data) => {
    setTransactions([data, ...transactions]);
    setShowAdd(false);
  };

  // --- Filtering logic ---
  const now = new Date();
  const getStartEndDates = () => {
    let start, end = new Date();
    if (dateRange === "this-month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (dateRange === "last-month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = lastMonth;
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (dateRange === "last-3-months") {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      start = new Date(0);
      end = new Date(9999, 11, 31);
    }
    return [start, end];
  };

  const [startDate, endDate] = getStartEndDates();

  const filteredTransactions = transactions.filter(tx => {
    // Type filter
    if (typeFilter !== "all" && tx.type.toLowerCase() !== typeFilter) return false;
    // Category filter
    if (categoryFilter !== "all" && tx.category.toLowerCase() !== categoryFilter) return false;
    // Date range filter (assumes tx.date is ISO string or Date)
    const txDate = new Date(tx.date);
    if (txDate < startDate || txDate > endDate) return false;
    // Search filter (case insensitive)
    if (
      search &&
      !(
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase())
      )
    ) {
      return false;
    }
    return true;
  });

  return (
    <>
      <section id="transactions" className="mb-12">
  <div
    className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
  >
    <h2 className="text-2xl font-bold navy-text mb-2 md:mb-0">Transactions</h2>
    <div className="flex space-x-2">
      <button
        className="orange-bg text-white rounded-md px-3 py-1 text-sm hover:bg-opacity-90"
        onClick={() => setShowAdd(true)}
      >
        <i className="fas fa-plus mr-2"></i> Add Transaction
      </button>
    </div>
  </div>

  {/* Filters and Search */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div className="col-span-1">
      <label className="block text-sm text-gray-600 mb-1">Transaction Type</label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        value={typeFilter}
        onChange={e => setTypeFilter(e.target.value)}
      >
        <option value="all">All Transactions</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
    </div>
    <div className="col-span-1">
      <label className="block text-sm text-gray-600 mb-1">Category</label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        value={categoryFilter}
        onChange={e => setCategoryFilter(e.target.value)}
      >
        {categoryOptions.map(opt => (
          <option value={opt.value} key={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    <div className="col-span-1">
      <label className="block text-sm text-gray-600 mb-1">Date Range</label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        value={dateRange}
        onChange={e => setDateRange(e.target.value)}
      >
        <option value="this-month">This Month</option>
        <option value="last-month">Last Month</option>
        <option value="last-3-months">Last 3 Months</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>
    <div className="col-span-1">
      <label className="block text-sm text-gray-600 mb-1">Search</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search transactions..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
      </div>
    </div>
  </div>

  {/* Transactions Table */}
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="table-responsive">
      <table className="w-full">
        <thead className="navy-bg text-white">
          <tr>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Description</th>
            <th className="py-3 px-4 text-left">Category</th>
            <th className="py-3 px-4 text-right">Amount</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((tx, idx) => (
            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <div
                    className={`rounded-full p-1.5 mr-2 text-xs ${
                      tx.type === 'Income'
                        ? 'bg-green-100 text-green-500'
                        : 'bg-red-100 text-red-500'
                    }`}
                  >
                    <i className={`fas ${tx.type === 'Income' ? 'fa-plus' : 'fa-minus'}`}></i>
                  </div>
                  <span className="text-sm">{tx.description}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm">{tx.category}</td>
              <td className="py-3 px-4 text-sm text-right">
                {tx.type === 'Income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
              </td>
              <td className="py-3 px-4 text-center">
                <button className="text-blue-500 hover:text-blue-700 mx-1">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="text-red-500 hover:text-red-700 mx-1">
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>


    <div
      className="py-3 px-4 border-t border-gray-200 flex items-center justify-between"
    >
      <div className="text-sm text-gray-500">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>
      <div className="flex space-x-1">
        <button
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button className="px-3 py-1 navy-bg text-white rounded-md text-sm">
          1
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
          2
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
          3
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
          Next
        </button>
      </div>
    </div>
  </div>
</section>

{showAdd && (
  <div 
    className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center"
    onClick={(e) => {
      // Close modal when clicking on backdrop, but not on the modal content
      if (e.target === e.currentTarget) {
        setShowAdd(false);
      }
    }}
  >
    <AddTransactionForm
      onSubmit={handleAddTransaction}
      onClose={() => setShowAdd(false)}
    />
  </div>
)}
    </>
  )
}

export default Transaction
