import React, { useState, useEffect } from 'react';
import AddTransactionForm from '../components/AddTransactionForm';
import EditTransactionForm from '../components/EditTransactionForm';
import { transactionService } from '../api';

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "housing", label: "Housing" },
  { value: "food & dining", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "income", label: "Income" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Other" },
];

const Transaction = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState("this-month");
  const [search, setSearch] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);

  // Fetch transactions from API with filters
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = buildFilters();
      const data = await transactionService.getFiltered(filters);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Build filter object for API
  const buildFilters = () => {
    const filters = {};
    
    if (typeFilter !== "all") {
      filters.type = typeFilter;
    }
    
    if (categoryFilter !== "all") {
      filters.category = categoryFilter;
    }
    
    // Handle date filtering
    const now = new Date();
    if (dateRange === "this-month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filters.startDate = startOfMonth.toISOString().split('T')[0];
      filters.endDate = endOfMonth.toISOString().split('T')[0];
    } else if (dateRange === "last-month") {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      filters.startDate = startOfLastMonth.toISOString().split('T')[0];
      filters.endDate = endOfLastMonth.toISOString().split('T')[0];
    } else if (dateRange === "last-3-months") {
      const start3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filters.startDate = start3MonthsAgo.toISOString().split('T')[0];
      filters.endDate = endOfThisMonth.toISOString().split('T')[0];
    } else if (dateRange === "custom" && customStartDate && customEndDate) {
      filters.startDate = customStartDate;
      filters.endDate = customEndDate;
    }
    
    return filters;
  };

  // Load transactions on component mount and when filters change
  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, dateRange, customStartDate, customEndDate]);

  const handleAddTransaction = (data) => {
    setTransactions([data, ...transactions]);
    setShowAdd(false);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowEdit(true);
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    setTransactions(transactions.map(tx => 
      tx.id === updatedTransaction.id ? updatedTransaction : tx
    ));
    setShowEdit(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionService.delete(transactionId);
      setTransactions(transactions.filter(tx => tx.id !== transactionId));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  // Filter transactions locally for search
  const filteredTransactions = transactions.filter(tx => {
    if (search) {
      return (
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        tx.notes?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

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

  {/* Custom Date Range Inputs */}
  {dateRange === "custom" && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Start Date</label>
        <input
          type="date"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={customStartDate}
          onChange={e => setCustomStartDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">End Date</label>
        <input
          type="date"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={customEndDate}
          onChange={e => setCustomEndDate(e.target.value)}
        />
      </div>
    </div>
  )}

  {/* Error message */}
  {error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <div className="flex">
        <div className="py-1">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
        <button 
          onClick={fetchTransactions}
          className="ml-auto text-red-700 hover:text-red-900"
        >
          <i className="fas fa-refresh"></i> Retry
        </button>
      </div>
    </div>
  )}

  {/* Loading state */}
  {isLoading ? (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
      <p className="text-gray-500">Loading transactions...</p>
    </div>
  ) : (
    /* Transactions Table */
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {filteredTransactions.length === 0 ? (
        <div className="p-8 text-center">
          <i className="fas fa-receipt text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-500 mb-2">No transactions found</h3>
          <p className="text-gray-400 mb-4">
            {transactions.length === 0 
              ? "Start by adding your first transaction!" 
              : "Try adjusting your filters to see more results."
            }
          </p>
          <button
            className="orange-bg text-white rounded-md px-4 py-2 text-sm hover:bg-opacity-90"
            onClick={() => setShowAdd(true)}
          >
            <i className="fas fa-plus mr-2"></i> Add First Transaction
          </button>
        </div>
      ) : (
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
              {currentTransactions.map((tx, idx) => (
                <tr key={tx.id || idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div
                        className={`rounded-full p-1.5 mr-2 text-xs ${
                          tx.type === 'income' || tx.type === 'Income'
                            ? 'bg-green-100 text-green-500'
                            : 'bg-red-100 text-red-500'
                        }`}
                      >
                        <i className={`fas ${tx.type === 'income' || tx.type === 'Income' ? 'fa-plus' : 'fa-minus'}`}></i>
                      </div>
                      <span className="text-sm">{tx.description}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{tx.category}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    {tx.type === 'income' || tx.type === 'Income' ? '+' : '-'}Tsh {Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      className="text-blue-500 hover:text-blue-700 mx-1"
                      onClick={() => handleEditTransaction(tx)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="text-red-500 hover:text-red-700 mx-1" onClick={() => handleDeleteTransaction(tx.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTransactions.length > 0 && (
        <div className="py-3 px-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {currentTransactions.length} of {filteredTransactions.length} transactions
          </div>
          <div className="flex space-x-1">
            <button 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === i + 1
                    ? 'navy-bg text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )}

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
      fetchTransactions={fetchTransactions}
    />
  </div>
)}

{showEdit && editingTransaction && (
  <div 
    className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center"
    onClick={(e) => {
      // Close modal when clicking on backdrop, but not on the modal content
      if (e.target === e.currentTarget) {
        setShowEdit(false);
        setEditingTransaction(null);
      }
    }}
  >
    <EditTransactionForm
      transaction={editingTransaction}
      onSubmit={handleUpdateTransaction}
      onClose={() => {
        setShowEdit(false);
        setEditingTransaction(null);
      }}
    />
  </div>
)}
    </>
  )
}

export default Transaction
