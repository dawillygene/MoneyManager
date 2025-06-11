import React, { useState, useEffect } from 'react';
import {
  useReports,
  useExpenseAnalysis,
  useIncomeVsExpenses,
  useSavingsReport,
  useBudgetPerformance,
  useReportGeneration,
  useReportExport,
  usePeriodManager
} from '../hooks/useReports';
import { useCurrencyFormatter, useDateFormatter } from '../hooks/useDashboard';

const Reports = () => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeReportType, setActiveReportType] = useState(null);
  
  // Period management
  const { 
    period, 
    customRange, 
    getPeriodParams, 
    updatePeriod, 
    updateCustomRange, 
    getPeriodLabel 
  } = usePeriodManager('this-month');

  // Report management hooks
  const { 
    reports, 
    loading: reportsLoading, 
    error: reportsError, 
    getReportsList, 
    downloadReport, 
    deleteReport 
  } = useReports();

  const { 
    generatingReports, 
    generateReportWithTracking 
  } = useReportGeneration();

  const { exportReport, loading: exportLoading } = useReportExport();

  // Individual report data hooks
  const { data: expenseData, loading: expenseLoading } = useExpenseAnalysis(getPeriodParams());
  const { data: incomeExpensesData, loading: incomeExpensesLoading } = useIncomeVsExpenses(getPeriodParams());
  const { data: savingsData, loading: savingsLoading } = useSavingsReport(getPeriodParams());
  const { data: budgetData, loading: budgetLoading } = useBudgetPerformance(getPeriodParams());

  // Utility hooks
  const { formatCurrency } = useCurrencyFormatter();
  const { formatDate } = useDateFormatter();

  // Load reports list on component mount
  useEffect(() => {
    getReportsList();
  }, []);

  // Handle report generation
  const handleGenerateReport = async (reportType) => {
    try {
      const reportData = {
        reportType,
        reportName: `${getReportTypeLabel(reportType)} - ${getPeriodLabel()}`,
        dateRange: period === 'custom' ? {
          startDate: customRange.startDate,
          endDate: customRange.endDate
        } : undefined,
        parameters: {
          period: period !== 'custom' ? period : undefined,
          includeSubcategories: true,
          includeTrends: true,
          includeRecommendations: true,
          currency: 'TZS'
        },
        format: 'PDF',
        includeCharts: true
      };

      await generateReportWithTracking(reportData);
      setShowGenerateModal(false);
      
      // Refresh reports list after generation
      setTimeout(() => {
        getReportsList();
      }, 2000);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  // Handle report export
  const handleExportReport = async () => {
    try {
      await exportReport({
        reportType: 'comprehensive',
        dateRange: period === 'custom' ? {
          startDate: customRange.startDate,
          endDate: customRange.endDate
        } : undefined,
        period: period !== 'custom' ? period : undefined,
        format: 'pdf',
        dataLevel: 'detailed',
        includeMetadata: true
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle report download
  const handleDownloadReport = async (reportId) => {
    try {
      const result = await downloadReport(reportId);
      if (result.success) {
        // Optional: Show success message
        console.log('Report downloaded successfully');
      }
    } catch (error) {
      console.error('Download failed:', error);
      // The error is already handled in the hook and will show in the UI
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    const reportName = reports.find(r => r.id === reportId)?.reportName || 'this report';
    
    if (window.confirm(`Are you sure you want to delete "${reportName}"? This action cannot be undone.`)) {
      try {
        await deleteReport(reportId);
        // Success feedback could be added here if needed
        console.log('Report deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        // The error is already handled in the hook and will show in the UI
        alert('Failed to delete the report. Please try again.');
      }
    }
  };

  // Helper function to get report type label
  const getReportTypeLabel = (type) => {
    const labels = {
      'expense-analysis': 'Expense Analysis',
      'income-vs-expenses': 'Income vs Expenses',
      'savings-report': 'Savings Report',
      'budget-performance': 'Budget Performance'
    };
    return labels[type] || type;
  };

  // Get summary data for report cards
  const getReportCardData = () => [
    {
      type: 'expense-analysis',
      title: 'Expense Analysis',
      description: 'Breakdown of your expenses by category.',
      icon: 'fa-chart-pie',
      iconColor: 'light-blue-bg navy-text',
      data: expenseData,
      loading: expenseLoading,
      summary: expenseData ? `Total: ${formatCurrency(expenseData.totalExpenses || 0)}` : 'Loading...'
    },
    {
      type: 'income-vs-expenses',
      title: 'Income vs Expenses',
      description: 'Compare your income and expenses over time.',
      icon: 'fa-chart-line',
      iconColor: 'light-blue-bg bg-opacity-20 orange-text',
      data: incomeExpensesData,
      loading: incomeExpensesLoading,
      summary: incomeExpensesData ? `Net: ${formatCurrency(incomeExpensesData.summary?.netIncome || 0)}` : 'Loading...'
    },
    {
      type: 'savings-report',
      title: 'Savings Report',
      description: 'Track your saving habits and progress over time.',
      icon: 'fa-piggy-bank',
      iconColor: 'bg-green-100 text-green-500',
      data: savingsData,
      loading: savingsLoading,
      summary: savingsData ? `Rate: ${savingsData.savingsSummary?.savingsRate?.toFixed(1) || 0}%` : 'Loading...'
    }
  ];

  return (
    <>
      <section id="reports" className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold navy-text mb-2 md:mb-0">Financial Reports</h2>
          <div className="flex space-x-2">
            <select
              value={period}
              onChange={(e) => updatePeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="this-year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {period === 'custom' && (
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={customRange.startDate}
                  onChange={(e) => updateCustomRange(e.target.value, customRange.endDate)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={customRange.endDate}
                  onChange={(e) => updateCustomRange(customRange.startDate, e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <button
              onClick={handleExportReport}
              disabled={exportLoading}
              className="orange-bg text-white rounded-md px-3 py-1 text-sm hover:bg-opacity-90 disabled:opacity-50"
            >
              {exportLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-download mr-2"></i> Export Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Generation Status */}
        {generatingReports.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 navy-text">Generating Reports</h3>
            <div className="space-y-2">
              {generatingReports.map((report) => (
                <div key={report.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-800">{report.reportName}</p>
                      <p className="text-sm text-blue-600">{report.message || 'Processing...'}</p>
                    </div>
                    <div className="flex items-center">
                      {report.status === 'processing' && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      )}
                      <span className="text-sm font-medium text-blue-700">
                        {report.progress || 0}%
                      </span>
                    </div>
                  </div>
                  {report.progress > 0 && (
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${report.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {getReportCardData().map((report) => (
            <div key={report.type} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-2 ${report.iconColor} mr-3`}>
                  <i className={`fas ${report.icon}`}></i>
                </div>
                <h3 className="text-lg font-semibold navy-text">{report.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2">{report.description}</p>
              
              {report.loading ? (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  Loading...
                </div>
              ) : (
                <p className="text-sm font-medium text-navy mb-4">{report.summary}</p>
              )}
              
              <button
                onClick={() => handleGenerateReport(report.type)}
                className="w-full navy-bg text-white rounded-md py-2 text-sm hover:bg-opacity-90"
              >
                Generate Report
              </button>
            </div>
          ))}
        </div>

        {/* Available Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 navy-bg text-white">
            <h3 className="font-semibold">Generated Reports</h3>
          </div>
          <div className="p-0">
            {reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading reports...</span>
              </div>
            ) : reportsError ? (
              <div className="text-center py-8 text-red-600">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Error loading reports: {reportsError}
              </div>
            ) : reports.length > 0 ? (
              <div className="table-responsive">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Report Name
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Type
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Date Range
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Generated On
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{report.reportName}</td>
                        <td className="py-3 px-4 text-sm">{getReportTypeLabel(report.reportType)}</td>
                        <td className="py-3 px-4 text-sm">
                          {report.dateRange ? 
                            `${formatDate(report.dateRange.startDate)} - ${formatDate(report.dateRange.endDate)}` :
                            report.period || 'N/A'
                          }
                        </td>
                        <td className="py-3 px-4 text-sm">{formatDate(report.generatedAt)}</td>
                        <td className="py-3 px-4 text-sm text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            report.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => handleDownloadReport(report.id)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Download"
                            >
                              <i className="fas fa-download"></i>
                            </button>
                            <button 
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-file-alt text-4xl mb-4"></i>
                <p>No reports generated yet.</p>
                <p className="text-sm">Generate your first report using the cards above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights Section */}
        {(expenseData || incomeExpensesData || savingsData) && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expense Insights */}
            {expenseData && (
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold navy-text mb-3">Expense Insights</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Expenses:</span>
                    <span className="text-sm font-medium">{formatCurrency(expenseData.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Highest Category:</span>
                    <span className="text-sm font-medium">{expenseData.insights?.highestCategory || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Trend:</span>
                    <span className={`text-sm font-medium ${
                      expenseData.trends?.trendDirection === 'increasing' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {expenseData.trends?.trendDirection || 'N/A'} 
                      {expenseData.trends?.percentageChange && ` (${expenseData.trends.percentageChange})`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Income vs Expenses Insights */}
            {incomeExpensesData && (
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold navy-text mb-3">Income vs Expenses</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Net Income:</span>
                    <span className={`text-sm font-medium ${
                      (incomeExpensesData.summary?.netIncome || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatCurrency(incomeExpensesData.summary?.netIncome || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Savings Rate:</span>
                    <span className={`text-sm font-medium ${
                      (incomeExpensesData.summary?.savingsRate || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {incomeExpensesData.summary?.savingsRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expense Ratio:</span>
                    <span className="text-sm font-medium">
                      {incomeExpensesData.summary?.expenseRatio?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Savings Insights */}
            {savingsData && (
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold navy-text mb-3">Savings Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Saved:</span>
                    <span className="text-sm font-medium">{formatCurrency(savingsData.savingsSummary?.totalSaved || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Average:</span>
                    <span className="text-sm font-medium">{formatCurrency(savingsData.savingsSummary?.monthlySavingsAverage || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Emergency Fund:</span>
                    <span className="text-sm font-medium">
                      {savingsData.savingsSummary?.emergencyFundMonths?.toFixed(1) || 0} months
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default Reports;
