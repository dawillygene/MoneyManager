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
    limit: 10,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Initial data fetching on component mount
  useEffect(() => {
    Promise.all([
      fetchSummary(),
      fetchCategories()
    ]);
  }, []);

  // Fetch goals when filters or pagination change
  useEffect(() => {
    fetchGoals();
  }, [filters, pagination.currentPage]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      
      // Build API parameters based on filters using existing goalService
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      // Only add filter parameters if they are not 'all'
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }
      
      if (filters.priority && filters.priority !== 'all') {
        params.priority = filters.priority;
      }
      
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      console.log('Fetching goals with params:', params);
      
      // Use existing goalService with fallback handling
      let response;
      try {
        response = await goalService.getAll(params);
        console.log('Goals API response:', response);
      } catch (err) {
        console.log('Parameterized request failed, trying simple request:', err);
        
        // Fallback: try without parameters
        response = await goalService.getAll();
        console.log('Simple API response:', response);
      }
      
      // Handle different response formats
      let goalsArray = [];
      let totalItems = 0;
      let totalPages = 1;
      let hasNextPage = false;
      let hasPrevPage = false;
      
      if (response && response.goals && Array.isArray(response.goals)) {
        goalsArray = response.goals;
        totalItems = response.pagination?.totalItems || response.totalCount || goalsArray.length;
        totalPages = response.pagination?.totalPages || Math.ceil(totalItems / pagination.limit);
        hasNextPage = response.pagination?.hasNextPage || pagination.currentPage < totalPages;
        hasPrevPage = response.pagination?.hasPrevPage || pagination.currentPage > 1;
        console.log('Found goals in response.goals:', goalsArray.length);
      } else if (Array.isArray(response)) {
        goalsArray = response;
        totalItems = goalsArray.length;
        totalPages = Math.ceil(totalItems / pagination.limit);
        hasNextPage = pagination.currentPage < totalPages;
        hasPrevPage = pagination.currentPage > 1;
        console.log('Response is direct array:', goalsArray.length);
      } else if (response && response.data && Array.isArray(response.data)) {
        goalsArray = response.data;
        totalItems = response.totalCount || response.pagination?.totalItems || goalsArray.length;
        totalPages = response.pagination?.totalPages || Math.ceil(totalItems / pagination.limit);
        hasNextPage = response.pagination?.hasNextPage || pagination.currentPage < totalPages;
        hasPrevPage = response.pagination?.hasPrevPage || pagination.currentPage > 1;
        console.log('Found goals in response.data:', goalsArray.length);
      } else {
        console.warn('Unexpected API response format:', response);
        goalsArray = [];
      }
      
      // Apply client-side filtering if API doesn't support it
      if (goalsArray.length > 0) {
        let filteredGoals = [...goalsArray];
        
        // Client-side search filter
        if (filters.search && filters.search.trim()) {
          const searchTerm = filters.search.toLowerCase().trim();
          filteredGoals = filteredGoals.filter(goal => 
            goal.name?.toLowerCase().includes(searchTerm) ||
            goal.description?.toLowerCase().includes(searchTerm) ||
            goal.category?.toLowerCase().includes(searchTerm)
          );
        }
        
        // Client-side status filter
        if (filters.status && filters.status !== 'all') {
          filteredGoals = filteredGoals.filter(goal => {
            const goalStatus = goal.status || calculateGoalStatus(goal);
            return goalStatus.toLowerCase() === filters.status.toLowerCase();
          });
        }
        
        // Client-side category filter
        if (filters.category && filters.category !== 'all') {
          filteredGoals = filteredGoals.filter(goal => 
            goal.category?.toLowerCase() === filters.category.toLowerCase()
          );
        }
        
        // Client-side priority filter
        if (filters.priority && filters.priority !== 'all') {
          filteredGoals = filteredGoals.filter(goal => 
            goal.priority?.toLowerCase() === filters.priority.toLowerCase()
          );
        }
        
        // Client-side sorting
        filteredGoals.sort((a, b) => {
          let aValue, bValue;
          
          switch (filters.sortBy) {
            case 'name':
              aValue = a.name?.toLowerCase() || '';
              bValue = b.name?.toLowerCase() || '';
              break;
            case 'targetAmount':
              aValue = a.targetAmount || 0;
              bValue = b.targetAmount || 0;
              break;
            case 'currentAmount':
              aValue = a.currentAmount || 0;
              bValue = b.currentAmount || 0;
              break;
            case 'targetDate':
              aValue = new Date(a.targetDate || 0);
              bValue = new Date(b.targetDate || 0);
              break;
            case 'progress':
              aValue = a.progress || calculateProgress(a.currentAmount, a.targetAmount);
              bValue = b.progress || calculateProgress(b.currentAmount, b.targetAmount);
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt || a.created_at || 0);
              bValue = new Date(b.createdAt || b.created_at || 0);
              break;
            default:
              aValue = a.targetDate ? new Date(a.targetDate) : new Date(0);
              bValue = b.targetDate ? new Date(b.targetDate) : new Date(0);
          }
          
          if (filters.sortOrder === 'desc') {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });
        
        goalsArray = filteredGoals;
        totalItems = filteredGoals.length;
        totalPages = Math.ceil(totalItems / pagination.limit);
        hasNextPage = pagination.currentPage < totalPages;
        hasPrevPage = pagination.currentPage > 1;
      }
      
      console.log('Final processed goals array:', goalsArray.length);
      setGoals(goalsArray);
      
      setPagination(prev => ({
        ...prev,
        totalPages,
        totalItems,
        hasNextPage,
        hasPrevPage
      }));
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch goals. Please try again.');
      console.error('Error fetching goals:', err);
      setGoals([]);
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
      // Fallback to default categories if API fails
      setCategories([
        { id: 'emergency', displayName: 'Emergency Fund', count: 0 },
        { id: 'vacation', displayName: 'Travel & Vacation', count: 0 },
        { id: 'house', displayName: 'House', count: 0 },
        { id: 'car', displayName: 'Car', count: 0 },
        { id: 'education', displayName: 'Education', count: 0 },
        { id: 'retirement', displayName: 'Retirement', count: 0 },
        { id: 'other', displayName: 'Other', count: 0 }
      ]);
    }
  };

  const handleAddGoal = async (newGoal) => {
    try {
      await goalService.create(newGoal);
      // Refresh goals and summary after successful creation
      await Promise.all([
        fetchGoals(),
        fetchSummary()
      ]);
      setShowAddGoal(false);
    } catch (err) {
      console.error('Error creating goal:', err);
      setError('Failed to create goal. Please try again.');
    }
  };

  const handleAddFunds = async (fundData) => {
    try {
      if (selectedGoal) {
        await goalService.contribute(selectedGoal.id, fundData);
        // Refresh goals and summary after successful contribution
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
    // Reset to first page when filters change
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      priority: 'all',
      search: '',
      sortBy: 'targetDate',
      sortOrder: 'asc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': 
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
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

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {/* Search and Actions Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search goals by name or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-undo"></i>
              Show All
            </button>
            
            <button
              onClick={fetchGoals}
              className="px-4 py-2.5 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
            
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className="fas fa-plus"></i>
              Add Goal
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="paused">Paused</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.displayName} ({category.count})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="targetDate-asc">Target Date (Earliest)</option>
              <option value="targetDate-desc">Target Date (Latest)</option>
              <option value="targetAmount-desc">Target Amount (Highest)</option>
              <option value="targetAmount-asc">Target Amount (Lowest)</option>
              <option value="currentAmount-desc">Current Amount (Highest)</option>
              <option value="currentAmount-asc">Current Amount (Lowest)</option>
              <option value="progress-desc">Progress (Highest)</option>
              <option value="progress-asc">Progress (Lowest)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="createdAt-desc">Date Created (Newest)</option>
              <option value="createdAt-asc">Date Created (Oldest)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(filters.search || filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:text-blue-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs">
                  Status: {filters.status}
                  <button
                    onClick={() => handleFilterChange('status', 'all')}
                    className="ml-1 hover:text-green-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs">
                  Category: {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', 'all')}
                    className="ml-1 hover:text-purple-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              {filters.priority !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs">
                  Priority: {filters.priority}
                  <button
                    onClick={() => handleFilterChange('priority', 'all')}
                    className="ml-1 hover:text-orange-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              <button
                onClick={resetFilters}
                className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {goals.length === 0 ? (
              'No goals found'
            ) : (
              <>
                Showing {goals.length} goal{goals.length !== 1 ? 's' : ''}
                {pagination.totalItems > goals.length && (
                  <span> of {pagination.totalItems} total</span>
                )}
                {(filters.search || filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all') && (
                  <span className="text-blue-600 font-medium"> (filtered)</span>
                )}
              </>
            )}
          </div>
          
          {goals.length > 0 && (
            <div className="text-sm text-gray-500">
              Sorted by {filters.sortBy === 'targetDate' ? 'target date' : 
                        filters.sortBy === 'targetAmount' ? 'target amount' :
                        filters.sortBy === 'currentAmount' ? 'current amount' :
                        filters.sortBy === 'progress' ? 'progress' :
                        filters.sortBy === 'createdAt' ? 'date created' : 
                        filters.sortBy === 'name' ? 'name' : filters.sortBy}
              {' '}({filters.sortOrder === 'asc' ? 'ascending' : 'descending'})
            </div>
          )}
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 mb-4">
              <i className="fas fa-bullseye text-6xl mb-4 text-gray-300"></i>
              <p className="text-xl mb-2">No goals yet</p>
              <p className="text-sm">
                Create your first financial goal to start tracking your progress!
              </p>
            </div>
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Your First Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            // Use API-provided calculated values or fallbacks
            const progress = goal.progress || 0;
            const remainingAmount = goal.remainingAmount || (goal.targetAmount - goal.currentAmount);
            const daysRemaining = goal.daysRemaining || 0;
            const status = goal.status || 'pending';
            
            return (
              <div key={goal.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
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
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(status)}`}>
                        {status}
                      </span>
                      {goal.isOverdue && (
                        <span className="text-xs text-red-600 font-medium">
                          <i className="fas fa-clock mr-1"></i>Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {goal.description && (
                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  )}

                  {goal.tags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {goal.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
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
                        <span className={`font-medium ${daysRemaining <= 30 && daysRemaining > 0 ? 'text-red-600' : 'text-gray-900'}`}>
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
                    
                    {/* Additional API fields */}
                    {goal.onTrack !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">On Track:</span>
                        <span className={`font-medium ${goal.onTrack ? 'text-green-600' : 'text-red-600'}`}>
                          {goal.onTrack ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                    
                    {goal.monthlyTargetAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Target:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(goal.monthlyTargetAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => openAddFundsModal(goal)}
                    disabled={status === 'completed' || goal.isCompleted}
                    className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                      status === 'completed' || goal.isCompleted
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {status === 'completed' || goal.isCompleted ? (
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
            disabled={!pagination.hasPrevPage}
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          {/* Page number display */}
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
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
