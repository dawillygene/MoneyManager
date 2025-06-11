import { useState, useEffect, useCallback } from 'react';
import { dashboardService, budgetService, transactionService } from '../api/services';
import { tokenStorage } from '../api/tokenStorage';

// Custom hook for dashboard overview data
export const useDashboard = (period = 'this-month') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we have a valid token before making requests
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      
      const dashboardData = await dashboardService.getOverview({
        period,
        includeCharts: true,
        includeProjections: true,
        includeComparisons: true,
        includeTrends: true
      });
      
      setData(dashboardData);
    } catch (err) {
      console.error('Dashboard overview error:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Access denied. Please check your login status.');
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const refreshDashboard = async () => {
    await fetchDashboard();
  };

  return { data, loading, error, refreshDashboard };
};

// Custom hook for dashboard widgets
export const useDashboardWidgets = (widgets = [], period = 'this-month') => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all individual widget data in parallel
      const widgetPromises = {
        balance: dashboardService.getBalanceCard(),
        income: dashboardService.getIncomeCard(),
        expenses: dashboardService.getExpensesCard(),
        savings: dashboardService.getSavingsCard(),
        expenseCategories: dashboardService.getExpenseCategories({ period }),
        cashFlow: dashboardService.getCashFlow({ months: 6, period }),
        budgetProgress: dashboardService.getBudgetProgress({ period }),
        recentTransactions: dashboardService.getRecentTransactions({ limit: 5 }),
        financialSummary: dashboardService.getFinancialSummary({ period })
      };

      // Filter only requested widgets
      const filteredPromises = {};
      widgets.forEach(widget => {
        if (widgetPromises[widget]) {
          filteredPromises[widget] = widgetPromises[widget];
        }
      });

      const results = await Promise.allSettled(Object.entries(filteredPromises).map(
        async ([key, promise]) => {
          try {
            const result = await promise;
            return { key, result, status: 'fulfilled' };
          } catch (error) {
            console.error(`Widget ${key} error:`, error);
            return { key, error, status: 'rejected' };
          }
        }
      ));

      const widgetData = {};
      results.forEach(({ value }) => {
        if (value.status === 'fulfilled') {
          widgetData[value.key] = value.result;
        } else {
          widgetData[value.key] = { error: value.error };
        }
      });

      setData(widgetData);
    } catch (err) {
      console.error('Widget data error:', err);
      setError(err.message || 'Failed to load widget data');
    } finally {
      setLoading(false);
    }
  }, [widgets, period]);

  useEffect(() => {
    if (widgets && widgets.length > 0) {
      fetchWidgets();
    }
  }, [fetchWidgets]);

  return { data, loading, error, refetch: fetchWidgets };
};

// Custom hook for expense categories chart
export const useExpenseCategories = (period = 'this-month') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenseCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ensure valid token before making request
        const token = await tokenStorage.getAccessToken();
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const categoriesData = await dashboardService.getExpenseCategories({
          period,
          includeSubcategories: true,
          minPercentage: 1.0
        });
        
        setData(categoriesData);
      } catch (err) {
        console.error('Expense categories error:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError('Access denied. Please log in again.');
        } else {
          setError(err.message || 'Failed to load expense categories');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseCategories();
  }, [period]);

  return { data, loading, error };
};

// Custom hook for cash flow data
export const useCashFlow = (months = 6) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCashFlow = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await tokenStorage.getAccessToken();
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const cashFlowData = await dashboardService.getCashFlow({
          months,
          includeProjections: true
        });
        
        setData(cashFlowData);
      } catch (err) {
        console.error('Cash flow error:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError('Access denied. Please log in again.');
        } else {
          setError(err.message || 'Failed to load cash flow data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlow();
  }, [months]);

  return { data, loading, error };
};

// Custom hook for budget progress
export const useBudgetProgress = (period = 'this-month') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBudgetProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await tokenStorage.getAccessToken();
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const budgetData = await dashboardService.getBudgetProgress({
          period,
          includeOverBudget: true,
          sortBy: 'usage',
          sortOrder: 'desc'
        });
        
        setData(budgetData);
      } catch (err) {
        console.error('Budget progress error:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError('Access denied. Please log in again.');
        } else {
          setError(err.message || 'Failed to load budget progress');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetProgress();
  }, [period]);

  return { data, loading, error };
};

// Custom hook for recent transactions
export const useRecentTransactions = (limit = 5) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await tokenStorage.getAccessToken();
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const transactionsData = await dashboardService.getRecentTransactions({
          limit
        });
        
        setData(transactionsData);
      } catch (err) {
        console.error('Recent transactions error:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError('Access denied. Please log in again.');
        } else {
          setError(err.message || 'Failed to load recent transactions');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [limit]);

  return { data, loading, error };
};

// Custom hook for financial summary cards
export const useFinancialSummary = (period = 'this-month') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await tokenStorage.getAccessToken();
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const summaryData = await dashboardService.getFinancialSummary({
          period,
          currency: 'TZS'
        });
        
        setData(summaryData);
        console.log('Financial summary data:', summaryData);
      } catch (err) {
        console.error('Financial summary error:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError('Access denied. Please log in again.');
        } else {
          setError(err.message || 'Failed to load financial summary');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialSummary();
  }, [period]);

  return { data, loading, error };
};

// Custom hook for dashboard export
export const useDashboardExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exportDashboard = async (exportOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      if (!tokenStorage.accessToken) {
        throw new Error('Authentication required');
      }

      const defaultOptions = {
        exportType: 'overview',
        format: 'pdf',
        period: 'current-month',
        includeCharts: true,
        sections: [
          'key_metrics',
          'expense_categories',
          'cash_flow',
          'budget_progress',
          'recent_transactions'
        ]
      };

      const exportData = { ...defaultOptions, ...exportOptions };
      
      const blob = await dashboardService.exportDashboard(exportData);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.${exportData.format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      console.error('Dashboard export error:', err);
      setError(err.message || 'Failed to export dashboard');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { exportDashboard, loading, error };
};

// Utility hook for formatting currency
export const useCurrencyFormatter = (currency = 'TZS') => {
  const formatCurrency = useCallback((amount) => {
    if (typeof amount !== 'number') return 'Tsh 0';
    
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'Tsh');
  }, [currency]);

  const formatNumber = useCallback((number) => {
    if (typeof number !== 'number') return '0';
    return new Intl.NumberFormat('en-TZ').format(number);
  }, []);

  return { formatCurrency, formatNumber };
};

// Utility hook for date formatting
export const useDateFormatter = () => {
  const formatDate = useCallback((date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }, []);

  const formatDateTime = useCallback((date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }, []);

  const getRelativeTime = useCallback((date) => {
    if (!date) return '';
    const now = new Date();
    const target = new Date(date);
    const diffInMs = now - target;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInDays < 7) return `${Math.floor(diffInDays)} days ago`;
    return formatDate(date);
  }, [formatDate]);

  return { formatDate, formatDateTime, getRelativeTime };
};