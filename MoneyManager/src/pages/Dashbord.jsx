import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  useDashboard, 
  useFinancialSummary, 
  useExpenseCategories, 
  useCashFlow, 
  useBudgetProgress, 
  useRecentTransactions,
  useCurrencyFormatter,
  useDateFormatter
} from '../hooks/useDashboard';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const { formatCurrency } = useCurrencyFormatter();
  const { getRelativeTime } = useDateFormatter();
  
  // Fetch dashboard data using custom hooks
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refreshDashboard } = useDashboard(selectedPeriod);
  const { data: financialSummary, loading: summaryLoading } = useFinancialSummary(selectedPeriod);
  const { data: expenseCategories, loading: categoriesLoading } = useExpenseCategories(selectedPeriod);
  const { data: cashFlowData, loading: cashFlowLoading } = useCashFlow(6);
  const { data: budgetProgress, loading: budgetLoading } = useBudgetProgress(selectedPeriod);
  const { data: recentTransactions, loading: transactionsLoading } = useRecentTransactions(5);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

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
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <h3 className="text-lg font-semibold mb-4 navy-text">Recent Activity</h3>
            <div className="space-y-3">
              {transactionsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : recentTransactions?.transactions && recentTransactions.transactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.transactions.slice(0, 5).map((transaction, index) => (
                    <div key={transaction.id || index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <i className={`fas ${transaction.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.description || transaction.title || 'Transaction'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.category || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount || 0)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {getRelativeTime(transaction.date || transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <Link 
                      to="/transactions" 
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium block text-center"
                    >
                      View all transactions →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 h-40 flex flex-col items-center justify-center">
                  <i className="fas fa-receipt text-2xl text-gray-300 mb-2"></i>
                  <span className="text-sm">No recent transactions</span>
                  <Link 
                    to="/transactions" 
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Add your first transaction
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
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold navy-text">Budget Progress</h3>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>

            {budgetLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : budgetProgress?.budgets && budgetProgress.budgets.length > 0 ? (
              <div className="space-y-4">
                {budgetProgress.budgets.slice(0, 5).map((budget) => (
                  <div key={budget.id} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{budget.name}</span>
                      <span className="text-sm">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="progress-bar bg-gray-200">
                      <div 
                        className={`progress-fill ${
                          budget.progress > 100 ? 'bg-red-500' : 
                          budget.progress > 80 ? 'orange-bg' : 
                          'bg-blue-500'
                        }`} 
                        style={{ width: `${Math.min(budget.progress, 100)}%` }}
                      ></div>
                    </div>
                    {budget.progress > 100 && (
                      <div className="text-xs text-red-500 mt-1">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        You are over this budget by {formatCurrency(budget.spent - budget.amount)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No budget data available
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold navy-text">Recent Transactions</h3>
              <a href="#transactions" className="text-sm text-blue-500 hover:underline">
                View All
              </a>
            </div>

            {transactionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : recentTransactions?.transactions && recentTransactions.transactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.transactions.map((transaction) => {
                  const isIncome = transaction.type === 'income';
                  const categoryIcons = {
                    'Food & Dining': 'fa-utensils',
                    'Housing': 'fa-home',
                    'Transportation': 'fa-car',
                    'Entertainment': 'fa-film',
                    'Shopping': 'fa-shopping-bag',
                    'Healthcare': 'fa-heartbeat',
                    'Income': 'fa-building'
                  };
                  
                  return (
                    <div key={transaction.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-all">
                      <div className={`rounded-full p-2 mr-3 ${
                        isIncome ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
                      }`}>
                        <i className={`fas ${categoryIcons[transaction.category] || 'fa-circle'}`}></i>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium">{transaction.description}</h4>
                        <p className="text-xs text-gray-500">{getRelativeTime(transaction.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          isIncome ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.category}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No recent transactions
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
