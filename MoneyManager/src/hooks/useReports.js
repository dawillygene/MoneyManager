import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../api/services';
import { tokenStorage } from '../api/tokenStorage';

// Custom hook for reports management
export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure valid token before making request
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const result = await reportService.generateReport(reportData);
      return result;
    } catch (error) {
      console.error('Report generation error:', error);
      setError(error.message || 'Failed to generate report');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getReportsList = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const result = await reportService.getReportsList(params);
      setReports(result.reports || []);
      return result;
    } catch (error) {
      console.error('Reports list error:', error);
      setError(error.message || 'Failed to fetch reports');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId) => {
    setLoading(true);
    setError(null);
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const result = await reportService.deleteReport(reportId);
      
      // Update the reports list immediately (optimistic update)
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      
      // Also refresh from server to ensure consistency
      try {
        await getReportsList();
      } catch (refreshError) {
        console.warn('Failed to refresh reports list after deletion:', refreshError);
        // Don't throw here as the deletion was successful
      }
      
      return result;
    } catch (error) {
      console.error('Report deletion error:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 404) {
        setError('Report not found. It may have already been deleted.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You may not have permission to delete this report.');
      } else if (error.response?.status === 409) {
        setError('Cannot delete report. It may be currently being processed.');
      } else {
        setError('Failed to delete report. Please try again.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId, format = null) => {
    setLoading(true);
    setError(null);
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const blob = await reportService.downloadReport(reportId, format);
      
      // Get proper filename from the blob response or create a default one
      let filename = `financial-report-${reportId}`;
      
      // Try to get filename from Content-Disposition header if available
      // Since we're getting a blob, we need to handle this differently
      const reportFormat = format || 'pdf';
      filename += `.${reportFormat}`;
      
      // Create download link with proper handling
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Set additional attributes for better compatibility
      link.style.display = 'none';
      link.setAttribute('target', '_blank');
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      return { success: true };
    } catch (error) {
      console.error('Report download error:', error);
      setError(error.message || 'Failed to download report');
      
      // Show user-friendly error message
      if (error.response?.status === 404) {
        setError('Report not found. It may have been deleted or expired.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Please check your permissions.');
      } else {
        setError('Failed to download report. Please try again.');
      }
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const previewReport = async (reportId) => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const result = await reportService.previewReport(reportId);
      return result;
    } catch (error) {
      console.error('Report preview error:', error);
      throw error;
    }
  };

  return {
    reports,
    loading,
    error,
    generateReport,
    getReportsList,
    deleteReport,
    downloadReport,
    previewReport
  };
};

// Custom hook for expense analysis
export const useExpenseAnalysis = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenseAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const analysisData = await reportService.getExpenseAnalysis(params);
      setData(analysisData);
    } catch (err) {
      console.error('Expense analysis error:', err);
      setError(err.message || 'Failed to load expense analysis');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchExpenseAnalysis();
  }, [fetchExpenseAnalysis]);

  return { data, loading, error, refetch: fetchExpenseAnalysis };
};

// Custom hook for income vs expenses report
export const useIncomeVsExpenses = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncomeVsExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const reportData = await reportService.getIncomeVsExpenses(params);
      setData(reportData);
    } catch (err) {
      console.error('Income vs expenses error:', err);
      setError(err.message || 'Failed to load income vs expenses report');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchIncomeVsExpenses();
  }, [fetchIncomeVsExpenses]);

  return { data, loading, error, refetch: fetchIncomeVsExpenses };
};

// Custom hook for savings report
export const useSavingsReport = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavingsReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const reportData = await reportService.getSavingsReport(params);
      setData(reportData);
    } catch (err) {
      console.error('Savings report error:', err);
      setError(err.message || 'Failed to load savings report');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchSavingsReport();
  }, [fetchSavingsReport]);

  return { data, loading, error, refetch: fetchSavingsReport };
};

// Custom hook for budget performance report
export const useBudgetPerformance = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgetPerformance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const reportData = await reportService.getBudgetPerformance(params);
      setData(reportData);
    } catch (err) {
      console.error('Budget performance error:', err);
      setError(err.message || 'Failed to load budget performance report');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchBudgetPerformance();
  }, [fetchBudgetPerformance]);

  return { data, loading, error, refetch: fetchBudgetPerformance };
};

// Custom hook for financial health analysis
export const useFinancialHealth = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinancialHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const healthData = await reportService.getFinancialHealth(params);
      setData(healthData);
    } catch (err) {
      console.error('Financial health error:', err);
      setError(err.message || 'Failed to load financial health analysis');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchFinancialHealth();
  }, [fetchFinancialHealth]);

  return { data, loading, error, refetch: fetchFinancialHealth };
};

// Custom hook for cash flow analysis
export const useCashFlowAnalysis = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCashFlowAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const cashFlowData = await reportService.getCashFlow(params);
      setData(cashFlowData);
    } catch (err) {
      console.error('Cash flow analysis error:', err);
      setError(err.message || 'Failed to load cash flow analysis');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCashFlowAnalysis();
  }, [fetchCashFlowAnalysis]);

  return { data, loading, error, refetch: fetchCashFlowAnalysis };
};

// Custom hook for report templates
export const useReportTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const templatesData = await reportService.getTemplates();
        setTemplates(templatesData.templates || []);
      } catch (err) {
        console.error('Templates error:', err);
        setError(err.message || 'Failed to load report templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return { templates, loading, error };
};

// Custom hook for report generation with status tracking
export const useReportGeneration = () => {
  const [generatingReports, setGeneratingReports] = useState(new Map());
  const [error, setError] = useState(null);

  const generateReportWithTracking = async (reportData) => {
    try {
      setError(null);
      
      // Start report generation
      const result = await reportService.generateReport(reportData);
      const reportId = result.reportId;

      // Add to tracking map
      setGeneratingReports(prev => new Map(prev).set(reportId, {
        status: 'processing',
        progress: 0,
        reportName: reportData.reportName,
        startTime: new Date()
      }));

      // Poll for status updates
      const pollStatus = async () => {
        try {
          const statusData = await reportService.getReportStatus(reportId);
          
          setGeneratingReports(prev => {
            const updated = new Map(prev);
            updated.set(reportId, {
              ...updated.get(reportId),
              status: statusData.status,
              progress: statusData.progress || 0,
              message: statusData.message
            });
            return updated;
          });

          // Continue polling if still processing
          if (statusData.status === 'processing') {
            setTimeout(pollStatus, 2000); // Poll every 2 seconds
          } else if (statusData.status === 'completed') {
            // Remove from tracking after 5 seconds
            setTimeout(() => {
              setGeneratingReports(prev => {
                const updated = new Map(prev);
                updated.delete(reportId);
                return updated;
              });
            }, 5000);
          }
        } catch (err) {
          console.error('Status polling error:', err);
          setGeneratingReports(prev => {
            const updated = new Map(prev);
            updated.set(reportId, {
              ...updated.get(reportId),
              status: 'failed',
              message: 'Failed to check status'
            });
            return updated;
          });
        }
      };

      // Start polling
      setTimeout(pollStatus, 1000);

      return result;
    } catch (error) {
      console.error('Report generation error:', error);
      setError(error.message || 'Failed to generate report');
      throw error;
    }
  };

  const getReportStatus = (reportId) => {
    return generatingReports.get(reportId) || null;
  };

  const clearReportTracking = (reportId) => {
    setGeneratingReports(prev => {
      const updated = new Map(prev);
      updated.delete(reportId);
      return updated;
    });
  };

  return {
    generatingReports: Array.from(generatingReports.entries()).map(([id, data]) => ({ id, ...data })),
    error,
    generateReportWithTracking,
    getReportStatus,
    clearReportTracking
  };
};

// Custom hook for report export functionality
export const useReportExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exportReport = async (exportData) => {
    try {
      setLoading(true);
      setError(null);

      const blob = await reportService.exportReport(exportData);
      
      // Create download link
      const filename = `financial-report-${exportData.reportType}-${new Date().toISOString().split('T')[0]}.${exportData.format}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (err) {
      console.error('Report export error:', err);
      setError(err.message || 'Failed to export report');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { exportReport, loading, error };
};

// Utility hook for period management
export const usePeriodManager = (defaultPeriod = 'this-month') => {
  const [period, setPeriod] = useState(defaultPeriod);
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });

  const getPeriodParams = useCallback(() => {
    if (period === 'custom') {
      return {
        period: 'custom',
        startDate: customRange.startDate,
        endDate: customRange.endDate
      };
    }
    return { period };
  }, [period, customRange]);

  const updatePeriod = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setCustomRange({ startDate: '', endDate: '' });
    }
  };

  const updateCustomRange = (startDate, endDate) => {
    setCustomRange({ startDate, endDate });
    if (period !== 'custom') {
      setPeriod('custom');
    }
  };

  const getPeriodLabel = useCallback(() => {
    switch (period) {
      case 'this-month':
        return 'This Month';
      case 'last-month':
        return 'Last Month';
      case 'last-3-months':
        return 'Last 3 Months';
      case 'last-6-months':
        return 'Last 6 Months';
      case 'this-year':
        return 'This Year';
      case 'custom':
        if (customRange.startDate && customRange.endDate) {
          return `${customRange.startDate} to ${customRange.endDate}`;
        }
        return 'Custom Range';
      default:
        return 'This Month';
    }
  }, [period, customRange]);

  return {
    period,
    customRange,
    getPeriodParams,
    updatePeriod,
    updateCustomRange,
    getPeriodLabel
  };
};