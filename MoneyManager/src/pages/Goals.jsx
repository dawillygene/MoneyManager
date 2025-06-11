import React, { useState, useEffect } from 'react';
import AddGoalForm from '../components/AddGoalForm';
import AddFundsForm from '../components/AddFundsForm';
import { goalService } from '../api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Filtering and sorting state
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
    sortBy: 'targetDate',
    sortOrder: 'asc'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 12,
    totalPages: 1,
    totalItems: 0
  });

  // Fetch goals and related data on component mount
  useEffect(() => {
    Promise.all([
      fetchGoals(),
      fetchSummary(),
      fetchCategories()
    ]);
  }, []);

  // Refetch goals when filters change
  useEffect(() => {
    fetchGoals();
  }, [filters, pagination.currentPage]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      // Add filters to query params
      if (filters.status !== 'all') queryParams.status = filters.status;
      if (filters.category !== 'all') queryParams.category = filters.category;
      if (filters.priority !== 'all') queryParams.priority = filters.priority;
      if (filters.search.trim()) queryParams.search = filters.search.trim();

      const response = await goalService.getAll(queryParams);
      
      // Handle both paginated and non-paginated responses
      if (response.goals) {
        setGoals(response.goals);
        setPagination(prev => ({
          ...prev,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || response.goals.length
        }));
      } else {
        // Non-paginated response (array of goals)
        setGoals(response);
        setPagination(prev => ({
          ...prev,
          totalPages: 1,
          totalItems: response.length
        }));
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch goals. Please try again.');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await goalService.getSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await goalService.getCategories();
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddGoal = async (newGoal) => {
    try {
      await Promise.all([
        fetchGoals(),
        fetchSummary()
      ]);
      setShowAddGoal(false);
    } catch (err) {
      console.error('Error after adding goal:', err);
    }
  };

  const handleAddFunds = async (fundData) => {
    try {
      if (selectedGoal) {
        await goalService.contribute(selectedGoal.id, fundData);
        await Promise.all([
          fetchGoals(),
          fetchSummary()
        ]);
      }
      setShowAddFunds(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error('Error adding funds:', err);
      setError('Failed to add funds. Please try again.');
    }
  };

  const openAddFundsModal = (goal) => {
    setSelectedGoal(goal);
    setShowAddFunds(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSortChange = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: newSortOrder
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('TZS', 'Tsh');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && goals.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading goals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Goals</h1>
          <p className="text-gray-600">Track your savings progress and achieve your financial dreams</p>
        </div>
        
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 lg:mt-0">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.overview?.activeGoals || 0}</div>
              <div className="text-sm text-blue-600">Active Goals</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.overview?.completedGoals || 0}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {summary.financial?.overallProgress?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-purple-600">Overall Progress</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.financial?.totalCurrentAmount || 0)}
              </div>
              <div className="text-sm text-orange-600">Total Saved</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search goals..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="paused">Paused</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.displayName}
                </option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className="fas fa-plus"></i>
              Add Goal
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <span className="text-sm text-gray-500 self-center mr-2">Sort by:</span>
          {[
            { key: 'targetDate', label: 'Target Date' },
            { key: 'progress', label: 'Progress' },
            { key: 'targetAmount', label: 'Amount' },
            { key: 'name', label: 'Name' }
          ].map((sort) => (
            <button
              key={sort.key}
              onClick={() => handleSortChange(sort.key)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filters.sortBy === sort.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {sort.label}
              {filters.sortBy === sort.key && (
                <i className={`fas fa-chevron-${filters.sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 mb-4">
              <i className="fas fa-bullseye text-6xl mb-4 text-gray-300"></i>
              <p className="text-xl mb-2">No goals found</p>
              <p className="text-sm">
                {filters.search || filters.status !== 'all' || filters.category !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first financial goal to start tracking your progress!'}
              </p>
            </div>
            {!filters.search && filters.status === 'all' && filters.category === 'all' && (
              <button
                onClick={() => setShowAddGoal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Your First Goal
              </button>
            )}
          </div>
        ) : (
          goals.map((goal) => {
            const progress = goal.progress || goalService.calculateProgress(goal.currentAmount, goal.targetAmount);
            const remainingAmount = goal.remainingAmount || goalService.calculateRemainingAmount(goal.currentAmount, goal.targetAmount);
            const daysRemaining = goal.daysRemaining || goalService.calculateDaysRemaining(goal.targetDate);
            const status = goal.status || goalService.getGoalStatus(goal.targetDate, progress, goal.currentAmount, goal.targetAmount);
            
            return (
              <div key={goal.id || goal._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Goal Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <i className={`fas ${goal.icon || 'fa-bullseye'} text-blue-600 text-xl`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 leading-tight">{goal.name}</h3>
                        {goal.priority && (
                          <div className={`text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                            {goal.priority.toUpperCase()} PRIORITY
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(status)}`}>
                      {status}
                    </span>
                  </div>
                  
                  {goal.description && (
                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  )}
                </div>

                {/* Progress Section */}
                <div className="px-6 pb-4">
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          progress >= 100 ? 'bg-green-500' :
                          progress >= 75 ? 'bg-blue-500' :
                          progress >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">{formatCurrency(goal.currentAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium text-orange-600">{formatCurrency(remainingAmount)}</span>
                    </div>
                    {goal.targetDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Date:</span>
                        <span className={`font-medium ${daysRemaining <= 30 ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(goal.targetDate)}
                        </span>
                      </div>
                    )}
                    {daysRemaining > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days Left:</span>
                        <span className={`font-medium ${daysRemaining <= 30 ? 'text-red-600' : 'text-gray-900'}`}>
                          {daysRemaining}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => openAddFundsModal(goal)}
                    disabled={status === 'completed'}
                    className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                      status === 'completed'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {status === 'completed' ? (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Goal Completed
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus mr-2"></i>
                        Add Funds
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg ${
                pagination.currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modal Backdrop and Forms */}
      {(showAddGoal || showAddFunds) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {showAddGoal && (
            <AddGoalForm
              onSubmit={handleAddGoal}
              onClose={() => setShowAddGoal(false)}
              categories={categories}
            />
          )}

          {showAddFunds && selectedGoal && (
            <AddFundsForm
              goalName={selectedGoal.name}
              goalId={selectedGoal.id}
              onSubmit={handleAddFunds}
              onClose={() => {
                setShowAddFunds(false);
                setSelectedGoal(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Goals;
