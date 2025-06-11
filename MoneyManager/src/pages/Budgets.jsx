import React, { useState, useEffect } from "react";
import CreateBudgetForm from "../components/CreateBudgetForm";
import EditBudgetForm from "../components/EditBudgetForm";
import BudgetItem from "../components/BudgetItem";
import { budgetService } from "../api";

const Budgets = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'active',
    category: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch all budget data
  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      
      // Clean filters - remove empty strings and null values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      // Fetch budgets with current filters
      const budgetsResponse = await budgetService.getAll({
        ...cleanFilters,
        page: 1,
        limit: 50
      });
      
      // Fetch summary data
      const summaryResponse = await budgetService.getSummary({
        period: 'current'
      });
      
      // Fetch alerts
      const alertsResponse = await budgetService.getAlerts();
      
      setBudgets(budgetsResponse.budgets || []);
      setSummary(summaryResponse);
      setAlerts(alertsResponse.alerts || []);
      setError('');
    } catch (error) {
      console.error('Error fetching budget data:', error);
      setError('Failed to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBudgetData();
  }, [filters]);

  // Handle creating new budget
  const handleCreateBudget = async (budgetData) => {
    try {
      // The CreateBudgetForm already calls budgetService.create() and passes the result
      // So we just need to update our local state and refresh the summary
      setBudgets(prev => [budgetData, ...prev]);
      setShowCreate(false);
      
      // Only refresh summary and alerts, not the full budget list
      const summaryResponse = await budgetService.getSummary({
        period: 'current'
      });
      const alertsResponse = await budgetService.getAlerts();
      
      setSummary(summaryResponse);
      setAlerts(alertsResponse.alerts || []);
    } catch (error) {
      console.error('Error updating budget data:', error);
      setError('Failed to update budget data. Please refresh the page.');
    }
  };

  // Handle editing budget
  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowEdit(true);
  };

  const handleUpdateBudget = async (updatedBudget) => {
    setBudgets(prev => 
      prev.map(budget => 
        budget.id === updatedBudget.id ? updatedBudget : budget
      )
    );
    setShowEdit(false);
    setEditingBudget(null);
    await fetchBudgetData(); // Refresh to update summary
  };

  // Handle deleting budget
  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    try {
      await budgetService.delete(budgetId);
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
      await fetchBudgetData(); // Refresh to update summary
    } catch (error) {
      console.error('Error deleting budget:', error);
      setError('Failed to delete budget. Please try again.');
    }
  };

  // Handle duplicating budget
  const handleDuplicateBudget = async (budget) => {
    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const year = nextMonth.getFullYear();
      const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
      
      const duplicateData = {
        name: `${budget.name} - ${nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        startDate: `${year}-${month}-01`,
        endDate: new Date(year, nextMonth.getMonth() + 1, 0).toISOString().split('T')[0],
        copyTransactions: false
      };
      
      const duplicatedBudget = await budgetService.duplicate(budget.id, duplicateData);
      setBudgets(prev => [duplicatedBudget, ...prev]);
      await fetchBudgetData();
    } catch (error) {
      console.error('Error duplicating budget:', error);
      setError('Failed to duplicate budget. Please try again.');
    }
  };

  // Handle archiving budget
  const handleArchiveBudget = async (budgetId) => {
    try {
      await budgetService.archive(budgetId);
      await fetchBudgetData();
    } catch (error) {
      console.error('Error archiving budget:', error);
      setError('Failed to archive budget. Please try again.');
    }
  };

  // Handle restoring budget
  const handleRestoreBudget = async (budgetId) => {
    try {
      await budgetService.restore(budgetId);
      await fetchBudgetData();
    } catch (error) {
      console.error('Error restoring budget:', error);
      setError('Failed to restore budget. Please try again.');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('TZS', 'Tsh');
  };

  if (loading && budgets.length === 0) {
    return (
      <section id="budgets" className="mb-12 relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-2"></i>
            <p className="text-gray-500">Loading budgets...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="budgets" className="mb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold navy-text mb-2 md:mb-0">Budget Management</h2>
        <div className="flex space-x-2">
          <button
            className="orange-bg text-white rounded-md px-3 py-1 text-sm hover:bg-opacity-90"
            onClick={() => setShowCreate(true)}
          >
            <i className="fas fa-plus mr-2"></i> Create Budget
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="font-semibold text-orange-800 mb-2">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Budget Alerts ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <p key={alert.budgetId} className="text-orange-700 text-sm">
                <strong>{alert.budgetName}:</strong> {alert.message}
              </p>
            ))}
            {alerts.length > 3 && (
              <p className="text-orange-600 text-sm">
                +{alerts.length - 3} more alerts
              </p>
            )}
          </div>
        </div>
      )}

      {/* Budget Overview Card */}
      {summary && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-r border-gray-200 pr-4">
              <h3 className="text-sm text-gray-500 mb-1">Total Budget</h3>
              <p className="text-2xl font-bold navy-text">
                {formatCurrency(summary.totalBudgetAmount || 0)}
              </p>
              <div className="mt-2 text-xs">
                <span className="text-blue-500">
                  <i className="fas fa-chart-line mr-1"></i>
                  {summary.totalBudgets || 0} total, {summary.activeBudgets || 0} active
                </span>
              </div>
            </div>
            <div className="md:border-r border-gray-200 pr-4 md:px-4">
              <h3 className="text-sm text-gray-500 mb-1">Spent So Far</h3>
              <p className="text-2xl font-bold navy-text">
                {formatCurrency(summary.totalSpent || 0)}
              </p>
              <div className="mt-2 text-xs">
                <span className="text-green-500">
                  {Math.round(((summary.totalSpent || 0) / (summary.totalBudgetAmount || 1)) * 100)}% of total budget
                </span>
              </div>
            </div>
            <div className="md:px-4">
              <h3 className="text-sm text-gray-500 mb-1">Remaining</h3>
              <p className="text-2xl font-bold navy-text">
                {formatCurrency(summary.totalRemaining || 0)}
              </p>
              <div className="mt-2 text-xs">
                <span className={`${summary.overBudgetCount > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {summary.overBudgetCount || 0} over budget
                  {summary.alertTriggeredCount > 0 && (
                    <span className="ml-2 text-orange-500">
                      • {summary.alertTriggeredCount} alerts
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  summary.overBudgetCount > 0 
                    ? 'bg-red-500' 
                    : ((summary.totalSpent || 0) / (summary.totalBudgetAmount || 1)) > 0.8 
                      ? 'bg-orange-500' 
                      : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(((summary.totalSpent || 0) / (summary.totalBudgetAmount || 1)) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Period: {summary.dateRange?.startDate} to {summary.dateRange?.endDate}</span>
              <span>{summary.categoryBreakdown?.length || 0} categories</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              <option value="Housing">Housing</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transportation">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search budgets..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="progress-desc">Highest Usage</option>
              <option value="progress-asc">Lowest Usage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="fas fa-wallet text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No budgets found</h3>
          <p className="text-gray-500 mb-4">
            {filters.status || filters.category || filters.search 
              ? 'Try adjusting your filters or create a new budget.'
              : 'Get started by creating your first budget.'
            }
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="orange-bg text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {budgets.slice(0, Math.ceil(budgets.length / 2)).map((budget) => (
                <BudgetItem
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                  onDuplicate={handleDuplicateBudget}
                  onArchive={handleArchiveBudget}
                  onRestore={handleRestoreBudget}
                />
              ))}
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {budgets.slice(Math.ceil(budgets.length / 2)).map((budget) => (
                <BudgetItem
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                  onDuplicate={handleDuplicateBudget}
                  onArchive={handleArchiveBudget}
                  onRestore={handleRestoreBudget}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Budget Modal */}
      {showCreate && (
        <div 
          className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreate(false);
            }
          }}
        >
          <CreateBudgetForm
            onSubmit={handleCreateBudget}
            onClose={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEdit && editingBudget && (
        <div 
          className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEdit(false);
              setEditingBudget(null);
            }
          }}
        >
          <EditBudgetForm
            budget={editingBudget}
            onSubmit={handleUpdateBudget}
            onClose={() => {
              setShowEdit(false);
              setEditingBudget(null);
            }}
          />
        </div>
      )}
    </section>
  );
};

export default Budgets;
