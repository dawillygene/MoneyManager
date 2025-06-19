import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  useDashboard, 
  useFinancialSummary, 
  useExpenseCategories, 
  useCashFlow, 
  useRecentTransactions,
  useCurrencyFormatter,
  useDateFormatter
} from '../hooks/useDashboard';
import { goalService, budgetService } from '../api';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const { formatCurrency } = useCurrencyFormatter();
  const { getRelativeTime } = useDateFormatter();
  
  // Fetch dashboard data using custom hooks
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refreshDashboard } = useDashboard(selectedPeriod);
  const { data: financialSummary, loading: summaryLoading } = useFinancialSummary(selectedPeriod);
  const { data: expenseCategories, loading: categoriesLoading } = useExpenseCategories(selectedPeriod);
  const { data: cashFlowData, loading: cashFlowLoading } = useCashFlow(6);
  const { data: recentTransactions, loading: transactionsLoading } = useRecentTransactions(5);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Fetch goals data
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setGoalsLoading(true);
        const response = await goalService.getAll({ 
          limit: 2, 
          sortBy: 'progress', 
          sortOrder: 'desc' 
        });
        setGoals(response.goals || response || []);
      } catch (err) {
        console.error('Error fetching goals:', err);
        setGoals([]);
      } finally {
        setGoalsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  // Fetch budget data using the same service as Budget page
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setBudgetLoading(true);
        const response = await budgetService.getAll({
          status: 'active',
          sortBy: 'progress',
          sortOrder: 'desc',
          limit: 10
        });
        setBudgets(response.budgets || []);
      } catch (err) {
        console.error('Error fetching budgets:', err);
        setBudgets([]);
      } finally {
        setBudgetLoading(false);
      }
    };

    fetchBudgets();
  }, [selectedPeriod]);

  // Loading state
  if (dashboardLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <i className="fas fa-exclamation-circle text-red-400 mr-2"></i>
          <div>
            <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
            <p className="text-red-600 text-sm mt-1">{dashboardError}</p>
            <button 
              onClick={refreshDashboard}
              className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section id="dashboard" className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold navy-text mb-2 md:mb-0">Dashboard</h2>
          <div className="flex space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="this-year">This Year</option>
            </select>
            <button
              onClick={refreshDashboard}
              className="bg-gray-100 text-gray-700 border border-gray-300 rounded-md px-3 py-1 text-sm flex items-center hover:bg-gray-200 transition-colors"
              title="Refresh Dashboard"
            >
              <i className="fas fa-sync-alt mr-2"></i> Refresh
            </button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Current Balance Card */}
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <h3 className="text-2xl font-bold navy-text mt-1">
                  {financialSummary ? formatCurrency(financialSummary.summary?.accountBalance || 0) : 'Loading...'}
                </h3>
                {financialSummary?.comparisons?.balanceVsLastMonth ? (
                  <p className={`text-xs flex items-center mt-2 ${
                    financialSummary.comparisons.balanceVsLastMonth.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <i className={`fas ${financialSummary.comparisons.balanceVsLastMonth.percentageChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                    {Math.abs(financialSummary.comparisons.balanceVsLastMonth.percentageChange || 0).toFixed(1)}% from last period
                  </p>
                ) : financialSummary?.comparisons ? (
                  <p className="text-xs text-gray-400 mt-2">
                    <i className="fas fa-minus mr-1"></i>
                    No comparison data available
                  </p>
                ) : null}
              </div>
              <div className="rounded-full p-2 bg-blue-100 text-blue-500">
                <i className="fas fa-wallet text-lg"></i>
              </div>
            </div>
          </div>

          {/* Monthly Income Card */}
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <h3 className="text-2xl font-bold navy-text mt-1">
                  {financialSummary ? formatCurrency(financialSummary.summary?.totalIncome || 0) : 'Loading...'}
                </h3>
                {financialSummary?.comparisons?.incomeVsLastMonth ? (
                  <p className={`text-xs flex items-center mt-2 ${
                    financialSummary.comparisons.incomeVsLastMonth.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <i className={`fas ${financialSummary.comparisons.incomeVsLastMonth.percentageChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                    {Math.abs(financialSummary.comparisons.incomeVsLastMonth.percentageChange || 0).toFixed(1)}% from last period
                  </p>
                ) : financialSummary?.comparisons ? (
                  <p className="text-xs text-gray-400 mt-2">
                    <i className="fas fa-minus mr-1"></i>
                    No comparison data available
                  </p>
                ) : null}
              </div>
              <div className="rounded-full p-2 bg-green-100 text-green-500">
                <i className="fas fa-arrow-down text-lg"></i>
              </div>
            </div>
          </div>

          {/* Monthly Expenses Card */}
          <div className="bg-white rounded-lg shadow p-5 border-l-4 orange-border transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <h3 className="text-2xl font-bold navy-text mt-1">
                  {financialSummary ? formatCurrency(financialSummary.summary?.totalExpenses || 0) : 'Loading...'}
                </h3>
                {financialSummary?.comparisons?.expensesVsLastMonth ? (
                  <p className={`text-xs flex items-center mt-2 ${
                    financialSummary.comparisons.expensesVsLastMonth.percentageChange <= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <i className={`fas ${financialSummary.comparisons.expensesVsLastMonth.percentageChange <= 0 ? 'fa-arrow-down' : 'fa-arrow-up'} mr-1`}></i>
                    {Math.abs(financialSummary.comparisons.expensesVsLastMonth.percentageChange || 0).toFixed(1)}% from last period
                  </p>
                ) : financialSummary?.comparisons ? (
                  <p className="text-xs text-gray-400 mt-2">
                    <i className="fas fa-minus mr-1"></i>
                    No comparison data available
                  </p>
                ) : null}
              </div>
              <div className="rounded-full p-2 bg-orange-100 text-orange">
                <i className="fas fa-arrow-up text-lg"></i>
              </div>
            </div>
          </div>

          {/* Net Income Card */}
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Net Income</p>
                <h3 className="text-2xl font-bold navy-text mt-1">
                  {financialSummary ? formatCurrency(financialSummary.summary?.netIncome || 0) : 'Loading...'}
                </h3>
                {financialSummary?.summary?.savingsRate && (
                  <p className="text-xs flex items-center mt-2 text-purple-600">
                    <i className="fas fa-chart-line mr-1"></i>
                    {financialSummary.summary.savingsRate.toFixed(1)}% savings rate
                  </p>
                )}
              </div>
              <div className="rounded-full p-2 bg-purple-100 text-purple-500">
                <i className="fas fa-chart-line text-lg"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        {financialSummary?.quickStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Largest Expense Category */}
            {financialSummary.quickStats.largestExpenseCategory && (
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Largest Expense Category</p>
                    <h4 className="text-lg font-semibold navy-text">
                      {financialSummary.quickStats.largestExpenseCategory.category}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(financialSummary.quickStats.largestExpenseCategory.amount)} 
                      ({financialSummary.quickStats.largestExpenseCategory.percentage?.toFixed(1) || 0}%)
                    </p>
                  </div>
                  <div className="rounded-full p-2 bg-red-100 text-red-500">
                    <i className="fas fa-exclamation-triangle text-lg"></i>
                  </div>
                </div>
              </div>
            )}

            {/* Largest Transaction */}
            {financialSummary.quickStats.largestTransaction && (
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Largest Transaction</p>
                    <h4 className="text-lg font-semibold navy-text">
                      {financialSummary.quickStats.largestTransaction.description}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(financialSummary.quickStats.largestTransaction.amount)} 
                      ({financialSummary.quickStats.largestTransaction.type})
                    </p>
                    <p className="text-xs text-gray-400">
                      {getRelativeTime(financialSummary.quickStats.largestTransaction.date)}
                    </p>
                  </div>
                  <div className={`rounded-full p-2 ${
                    financialSummary.quickStats.largestTransaction.type === 'income' 
                      ? 'bg-green-100 text-green-500' 
                      : 'bg-blue-100 text-blue-500'
                  }`}>
                    <i className={`fas ${
                      financialSummary.quickStats.largestTransaction.type === 'income' 
                        ? 'fa-arrow-down' 
                        : 'fa-arrow-up'
                    } text-lg`}></i>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget Utilization */}
        {financialSummary?.summary?.budgetUtilization !== undefined && (
          <div className="bg-white rounded-lg shadow p-4 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold navy-text">Overall Budget Utilization</h3>
              <span className="text-sm font-medium">
                {financialSummary.summary.budgetUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="progress-bar bg-gray-200">
              <div 
                className={`progress-fill ${
                  financialSummary.summary.budgetUtilization > 100 ? 'bg-red-500' : 
                  financialSummary.summary.budgetUtilization > 80 ? 'orange-bg' : 
                  'bg-blue-500'
                }`} 
                style={{ width: `${Math.min(financialSummary.summary.budgetUtilization, 100)}%` }}
              ></div>
            </div>
            {financialSummary.summary.budgetUtilization > 100 && (
              <div className="text-xs text-red-500 mt-2">
                <i className="fas fa-exclamation-circle mr-1"></i>
                You are over budget this {financialSummary.period || 'period'}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Goals */}
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold navy-text">Your Goals</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  {goals.filter(g => g.status === 'active').length} Active
                </span>
                <Link 
                  to="/goals" 
                  className="text-orange-500 hover:text-orange-600 transition-colors"
                  title="View all goals"
                >
                  <i className="fas fa-external-link-alt text-sm"></i>
                </Link>
              </div>
            </div>
            
            <div className="space-y-3">
              {goalsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : goals && goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.slice(0, 2).map((goal, index) => {
                    const progress = ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100;
                    const isCompleted = progress >= 100;
                    const isNearTarget = progress >= 80 && progress < 100;
                    const remaining = (goal.targetAmount || 0) - (goal.currentAmount || 0);
                    const daysLeft = goal.targetDate ? Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                      <div 
                        key={goal.id || index} 
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                          isCompleted ? 'border-green-300 bg-gradient-to-r from-green-50 to-green-100' :
                          isNearTarget ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50' :
                          'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
                        }`}
                      >
                        {/* Goal Header */}
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${
                                isCompleted ? 'bg-green-500' :
                                isNearTarget ? 'bg-orange-500' : 
                                'bg-blue-500'
                              }`}>
                                <i className={`fas ${goal.icon || 'fa-bullseye'} text-sm`}></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                  {goal.name || 'Unnamed Goal'}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {goal.category || 'General'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                isCompleted ? 'bg-green-200 text-green-800' :
                                isNearTarget ? 'bg-orange-200 text-orange-800' :
                                'bg-blue-200 text-blue-800'
                              }`}>
                                {Math.min(progress, 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isCompleted ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                isNearTarget ? 'bg-gradient-to-r from-orange-400 to-yellow-500' :
                                'bg-gradient-to-r from-blue-400 to-blue-600'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          
                          {/* Goal Details */}
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-coins text-gray-400"></i>
                              <span className="text-gray-600">
                                {formatCurrency(goal.currentAmount || 0)}
                              </span>
                              <span className="text-gray-400">of</span>
                              <span className="font-semibold text-gray-800">
                                {formatCurrency(goal.targetAmount || 0)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Status Footer */}
                          <div className="mt-2 flex items-center justify-between">
                            {isCompleted ? (
                              <div className="flex items-center text-green-600">
                                <i className="fas fa-check-circle mr-1"></i>
                                <span className="text-xs font-medium">Goal Achieved!</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-500">
                                <i className="fas fa-target mr-1"></i>
                                <span className="text-xs">
                                  {formatCurrency(remaining)} remaining
                                </span>
                              </div>
                            )}
                            
                            {daysLeft > 0 && (
                              <div className={`flex items-center text-xs ${
                                daysLeft <= 30 ? 'text-red-500' : 
                                daysLeft <= 90 ? 'text-orange-500' : 
                                'text-gray-500'
                              }`}>
                                <i className="fas fa-calendar mr-1"></i>
                                <span>{daysLeft} days left</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </div>
                    );
                  })}
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link 
                      to="/goals" 
                      className="flex items-center justify-center text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors group"
                    >
                      <span>View all goals</span>
                      <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 h-40 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <i className="fas fa-bullseye text-2xl text-gray-400"></i>
                  </div>
                  <span className="text-sm font-medium">No goals set yet</span>
                  <p className="text-xs text-gray-400 mb-3 text-center">
                    Create your first financial goal to start tracking your progress
                  </p>
                  <Link 
                    to="/goals" 
                    className="text-xs bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    <i className="fas fa-plus mr-1"></i>Create Goal
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Cash Flow */}
          <div className="bg-white rounded-lg shadow p-4 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 navy-text">Monthly Cash Flow</h3>
            <div className="chart-container">
              {cashFlowLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : cashFlowData?.monthlyData && cashFlowData.monthlyData.length > 0 ? (
                <div className="w-full h-full px-4">
                  <div className="h-48 flex items-end">
                    <div className="border-b border-gray-300 w-full absolute bottom-8"></div>
                    <div className="h-full w-full flex items-end justify-between">
                      {cashFlowData.monthlyData.slice(-6).map((month, index) => {
                        const maxAmount = Math.max(...cashFlowData.monthlyData.map(m => Math.max(m.income || 0, m.expenses || 0)));
                        const incomeHeight = ((month.income || 0) / maxAmount) * 180;
                        const expenseHeight = ((month.expenses || 0) / maxAmount) * 180;
                        
                        return (
                          <div key={month.month} className="flex flex-col items-center">
                            <div className="flex space-x-1">
                              <div
                                className="w-8 bg-green-400 rounded-t"
                                style={{ height: `${incomeHeight}px` }}
                                title={`Income: ${formatCurrency(month.income || 0)}`}
                              ></div>
                              <div
                                className="w-8 orange-bg rounded-t"
                                style={{ height: `${expenseHeight}px` }}
                                title={`Expenses: ${formatCurrency(month.expenses || 0)}`}
                              ></div>
                            </div>
                            <span className="text-xs mt-2">{month.monthLabel || month.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 h-48 flex items-center justify-center">
                  No cash flow data available
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                <span className="text-xs">Income</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full orange-bg mr-2"></div>
                <span className="text-xs">Expenses</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Progress */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold navy-text">Budget Progress</h3>
                <p className="text-sm text-gray-500 mt-1">Top 3 budgets by usage this period</p>
              </div>
              <Link 
                to="/budgets" 
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <i className="fas fa-eye mr-1.5"></i>
                View All
              </Link>
            </div>

            {budgetLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading budgets...</span>
              </div>
            ) : budgets && budgets.length > 0 ? (
              <div className="space-y-5">
                {budgets
                  .slice(0, 3) // Show only top 3
                  .map((budget, index) => {
                  const used = budget.spent || 0;
                  const total = budget.amount || 0;
                  const percentage = budget.progress || (total > 0 ? (used / total) * 100 : 0);
                  const remaining = Math.max(0, total - used);
                  const budgetName = budget.name || budget.category || 'Unnamed Budget';
                  
                  return (
                    <div key={budget.id} className="group hover:bg-gray-50 rounded-xl p-4 transition-all duration-200 border border-gray-100">
                      {/* Budget Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm
                            ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                              index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                              'bg-gradient-to-r from-orange-500 to-orange-600'}
                          `}>
                            {budgetName.charAt(0)?.toUpperCase() || 'B'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {budgetName}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span className="text-blue-600 font-medium">{budget.category}</span>
                              <span>•</span>
                              <span>Used: {formatCurrency(used)}</span>
                              <span>•</span>
                              <span>Total: {formatCurrency(total)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            ${budget.isOverBudget ? 'bg-red-100 text-red-800' :
                              percentage > 80 ? 'bg-orange-100 text-orange-800' :
                              percentage > 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'}
                          `}>
                            {percentage.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {budget.isOverBudget ? 
                              `Over by ${formatCurrency(used - total)}` : 
                              `${formatCurrency(remaining)} left`
                            }
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`
                              h-2.5 rounded-full transition-all duration-500 ease-out
                              ${budget.isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                percentage > 80 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                percentage > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-green-500 to-green-600'}
                            `}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Status Message */}
                      {budget.isOverBudget && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700 flex items-center">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            Budget exceeded! Consider reviewing your spending in this category.
                          </p>
                        </div>
                      )}
                      
                      {percentage > 80 && !budget.isOverBudget && (
                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs text-orange-700 flex items-center">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            Almost at budget limit. Monitor spending carefully.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Summary Footer */}
                {budgets.length > 3 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      Showing top 3 budgets by usage. 
                      <Link to="/budgets" className="text-blue-600 hover:text-blue-800 ml-1 font-medium">
                        View all {budgets.length} budgets →
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-chart-pie text-2xl text-gray-400"></i>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Budgets</h4>
                <p className="text-gray-500 mb-4">Create budgets with spending to see your progress here</p>
                <Link 
                  to="/budgets" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Manage Budgets
                </Link>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold navy-text">Recent Transactions</h3>
                <p className="text-sm text-gray-500 mt-1">Latest financial activities</p>
              </div>
              <Link 
                to="/transactions" 
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <i className="fas fa-eye mr-1.5"></i>
                View All
              </Link>
            </div>

            {transactionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading transactions...</span>
              </div>
            ) : recentTransactions?.transactions && recentTransactions.transactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.transactions.map((transaction, index) => {
                  const isIncome = transaction.type === 'income';
                  const categoryIcons = {
                    'Food & Dining': 'fa-utensils',
                    'Housing': 'fa-home',
                    'Transportation': 'fa-car',
                    'Entertainment': 'fa-film',
                    'Shopping': 'fa-shopping-bag',
                    'Healthcare': 'fa-heartbeat',
                    'Income': 'fa-building',
                    'Other': 'fa-circle'
                  };
                  
                  return (
                    <div key={transaction.id} className="group hover:bg-gray-50 rounded-xl p-4 transition-all duration-200 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border-2
                            ${isIncome ? 'bg-green-500 text-white border-green-600' : 
                              transaction.category === 'Food & Dining' ? 'bg-orange-500 text-white border-orange-600' :
                              transaction.category === 'Healthcare' ? 'bg-red-500 text-white border-red-600' :
                              transaction.category === 'Shopping' ? 'bg-purple-500 text-white border-purple-600' :
                              transaction.category === 'Transportation' ? 'bg-blue-500 text-white border-blue-600' :
                              'bg-gray-700 text-white border-gray-800'}
                          `}>
                            {transaction.category === 'Food & Dining' ? '🍽️' :
                             transaction.category === 'Healthcare' ? '🏥' :
                             transaction.category === 'Shopping' ? '🛍️' :
                             transaction.category === 'Transportation' ? '🚌' :
                             isIncome ? '💰' : '💸'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {transaction.description}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{getRelativeTime(transaction.date)}</span>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">{transaction.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold
                            ${isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          `}>
                            {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {isIncome ? 'Income' : 'Expense'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-receipt text-2xl text-gray-400"></i>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Transactions</h4>
                <p className="text-gray-500 mb-4">Your recent transactions will appear here</p>
                <Link 
                  to="/transactions" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Transaction
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
