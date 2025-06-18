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

  const downloadReport = async (reportId, format = 'pdf') => {
    setLoading(true);
    setError(null);
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Call the enhanced download method
      const downloadResult = await reportService.downloadReport(reportId, format);
      
      // Extract the data from the enhanced response
      const { blob, filename, fileSize } = downloadResult;
      
      // Create download link with enhanced handling
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

      return { 
        success: true, 
        filename, 
        fileSize 
      };
    } catch (error) {
      console.error('Report download error:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to download report';
      
      if (error.code) {
        // Handle mapped error codes from the API
        switch (error.code) {
          case 'REPORT_GENERATION_FAILED':
            errorMessage = 'Report generation failed. Please try generating the report again.';
            break;
          case 'REPORT_DOWNLOAD_FAILED':
            errorMessage = 'Download failed. Please check your connection and try again.';
            break;
          case 'INVALID_FORMAT':
            errorMessage = 'Invalid file format. Please select PDF, Excel, or CSV.';
            break;
          case 'REPORT_NOT_FOUND':
            errorMessage = 'Report not found. It may have been deleted or expired.';
            break;
          default:
            errorMessage = error.message || 'Failed to download report';
        }
      } else if (error.message === 'Authentication required') {
        errorMessage = 'Please log in to download reports.';
      } else if (error.message.includes('Network error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('Access denied')) {
        errorMessage = 'Access denied. Please check your permissions.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
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

// Enhanced report export hook with format support
export const useReportExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const exportReport = async (exportConfig) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Validate export configuration
      const {
        reportType = 'comprehensive',
        format = 'pdf',
        dateRange,
        period,
        dataLevel = 'detailed',
        includeMetadata = true
      } = exportConfig;

      // Validate format
      const validFormats = ['pdf', 'excel', 'xlsx', 'csv'];
      if (!validFormats.includes(format.toLowerCase())) {
        throw new Error('Invalid format selected');
      }

      setProgress(25);

      // Generate report ID
      const reportId = reportService.generateReportId(reportType, dateRange);
      
      setProgress(50);

      // Download the report with the specified format
      const downloadResult = await reportService.downloadReport(reportId, format);
      
      setProgress(75);

      // Extract the data and handle download
      const { blob, filename, fileSize } = downloadResult;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setProgress(100);

      return {
        success: true,
        filename,
        fileSize,
        format
      };

    } catch (error) {
      console.error('Export error:', error);
      
      let errorMessage = 'Failed to export report';
      if (error.message === 'Authentication required') {
        errorMessage = 'Please log in to export reports.';
      } else if (error.message === 'Invalid format selected') {
        errorMessage = 'Invalid format selected. Please choose PDF, Excel, or CSV.';
      } else if (error.code) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return {
    exportReport,
    loading,
    error,
    progress
  };
};

// Enhanced report generation hook with progress tracking
export const useReportGeneration = () => {
  const [generatingReports, setGeneratingReports] = useState([]);
  const [error, setError] = useState(null);

  const generateReportWithTracking = async (reportData) => {
    const reportId = `temp-${Date.now()}`;
    
    // Add to generating reports list
    const newReport = {
      id: reportId,
      reportName: reportData.reportName,
      reportType: reportData.reportType,
      status: 'processing',
      progress: 0,
      message: 'Initializing report generation...'
    };
    
    setGeneratingReports(prev => [...prev, newReport]);
    setError(null);

    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Update progress
      updateReportProgress(reportId, 25, 'Collecting data...');

      // Generate the report
      const result = await reportService.generateReport(reportData);
      
      updateReportProgress(reportId, 75, 'Processing report...');

      // Simulate completion delay for UX
      setTimeout(() => {
        updateReportProgress(reportId, 100, 'Report generated successfully!');
        
        // Remove from generating list after a delay
        setTimeout(() => {
          setGeneratingReports(prev => prev.filter(r => r.id !== reportId));
        }, 2000);
      }, 1000);

      return result;

    } catch (error) {
      console.error('Report generation error:', error);
      
      // Update report status to failed
      setGeneratingReports(prev => 
        prev.map(r => 
          r.id === reportId 
            ? { ...r, status: 'failed', message: 'Generation failed', progress: 0 }
            : r
        )
      );
      
      setError(error.message || 'Failed to generate report');
      
      // Remove failed report after delay
      setTimeout(() => {
        setGeneratingReports(prev => prev.filter(r => r.id !== reportId));
      }, 5000);
      
      throw error;
    }
  };

  const updateReportProgress = (reportId, progress, message) => {
    setGeneratingReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, progress, message }
          : report
      )
    );
  };

  return {
    generatingReports,
    generateReportWithTracking,
    error
  };
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