import React, { useState } from 'react';
import { usePeriodManager } from '../hooks/useReports';
import { reportService } from '../api/services';

const Reports = () => {
  const [selectedReportType, setSelectedReportType] = useState('expense_analysis');
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  const { period, customRange, updatePeriod, updateCustomRange, getPeriodLabel } = usePeriodManager('this-month');

  // Report type options
  const reportTypes = [
    { 
      value: 'expense_analysis', 
      label: 'Expense Analysis', 
      description: 'Detailed breakdown of your expenses by category with trends and insights',
      icon: 'fa-chart-pie',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      value: 'income_vs_expenses', 
      label: 'Income vs Expenses', 
      description: 'Compare your income and expenses with savings analysis',
      icon: 'fa-chart-line',
      color: 'from-green-500 to-green-600'
    },
    { 
      value: 'budget_progress', 
      label: 'Budget Progress', 
      description: 'Track your budget adherence and performance metrics',
      icon: 'fa-bullseye',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      value: 'savings_report', 
      label: 'Savings Report', 
      description: 'Comprehensive savings analysis and goal tracking',
      icon: 'fa-piggy-bank',
      color: 'from-emerald-500 to-emerald-600'
    },
    { 
      value: 'comprehensive', 
      label: 'Comprehensive Report', 
      description: 'Complete financial overview with all metrics and insights',
      icon: 'fa-file-alt',
      color: 'from-orange-500 to-orange-600'
    }
  ];
  
  // Format options
  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: 'fa-file-pdf', color: 'text-red-500' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: 'fa-file-excel', color: 'text-green-500' },
    { value: 'csv', label: 'CSV Data File', icon: 'fa-file-csv', color: 'text-blue-500' }
  ];

  // Generate report ID based on type and current date
  const generateReportId = (type) => {
    const now = new Date();
    const yearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0');
    return `${type}_${yearMonth}_001`;
  };

  // Generate proper report data based on period and type
  const generateReportData = async (reportType, period, customRange) => {
    try {
      let reportData;
      const params = {};
      
      // Set up date parameters
      if (period === 'custom') {
        params.startDate = customRange.startDate;
        params.endDate = customRange.endDate;
      } else {
        params.period = period;
      }

      setDownloadProgress(25);

      // Fetch actual data based on report type
      switch (reportType) {
        case 'expense_analysis':
          reportData = await reportService.getExpenseAnalysis(params);
          break;
        case 'income_vs_expenses':
          reportData = await reportService.getIncomeVsExpenses(params);
          break;
        case 'savings_report':
          reportData = await reportService.getSavingsReport(params);
          break;
        case 'budget_progress':
          reportData = await reportService.getBudgetPerformance(params);
          break;
        case 'comprehensive':
          // Fetch all data for comprehensive report
          const [expenses, income, savings, budget] = await Promise.all([
            reportService.getExpenseAnalysis(params),
            reportService.getIncomeVsExpenses(params),
            reportService.getSavingsReport(params),
            reportService.getBudgetPerformance(params)
          ]);
          reportData = { expenses, income, savings, budget };
          break;
        default:
          throw new Error('Invalid report type selected');
      }

      setDownloadProgress(50);
      return reportData;
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  };

  // Generate and download report using proper API integration
  const generateAndDownloadReport = async (reportType, format, reportData) => {
    try {
      setDownloadProgress(60);

      // Generate report ID
      const reportId = generateReportId(reportType);
      
      // Create report generation request
      const reportRequest = {
        reportType,
        reportName: `${getReportTypeLabel(reportType)} - ${getPeriodLabel()}`,
        data: reportData,
        dateRange: period === 'custom' ? {
          startDate: customRange.startDate,
          endDate: customRange.endDate
        } : undefined,
        parameters: {
          period: period !== 'custom' ? period : undefined,
          includeCharts: true,
          includeAnalysis: true,
          currency: 'TZS'
        },
        format: format.toUpperCase()
      };

      setDownloadProgress(75);

      // Generate the report
      const generateResult = await reportService.generateReport(reportRequest);
      
      setDownloadProgress(85);

      // Download the generated report
      const downloadResult = await reportService.downloadReport(reportId, format);
      
      setDownloadProgress(95);

      // Handle the downloaded file
      const { blob, filename, fileSize } = downloadResult;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setDownloadProgress(100);

      return { 
        success: true, 
        filename,
        fileSize,
        reportData: generateResult
      };

    } catch (error) {
      console.error('Error generating/downloading report:', error);
      throw error;
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerateSuccess(false);
    setGenerateError(null);
    setDownloadProgress(0);
    
    try {
      // Validate custom date range if selected
      if (period === 'custom' && (!customRange.startDate || !customRange.endDate)) {
        throw new Error('Please select both start and end dates for custom range.');
      }

      console.log(`Generating ${selectedReportType} report in ${format} format for period: ${getPeriodLabel()}`);
      
      // Step 1: Generate report data from API
      const reportData = await generateReportData(selectedReportType, period, customRange);
      
      // Step 2: Generate and download the report file
      const result = await generateAndDownloadReport(selectedReportType, format, reportData);
      
      if (result.success) {
        setGenerateSuccess(true);
        console.log(`Report downloaded successfully: ${result.filename} (${Math.round(result.fileSize / 1024)} KB)`);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setGenerateSuccess(false);
          setDownloadProgress(0);
        }, 5000);
      }
      
    } catch (error) {
      console.error('Failed to generate/download report:', error);
      
      // Handle specific error codes and provide user-friendly messages
      let errorMessage = error.message;
      
      if (error.code === 'REPORT_GENERATION_FAILED') {
        errorMessage = 'Report generation failed. Please try again later.';
      } else if (error.code === 'INVALID_FORMAT') {
        errorMessage = 'Invalid file format selected. Please choose PDF, Excel, or CSV.';
      } else if (error.code === 'REPORT_NOT_FOUND') {
        errorMessage = 'No data available for the selected period. Please try a different time range.';
      } else if (error.message.includes('Authentication') || error.message.includes('401')) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('Invalid report type')) {
        errorMessage = 'Invalid report type selected. Please refresh the page and try again.';
      }
      
      setGenerateError(errorMessage);
      
      // Auto-hide error message after 10 seconds
      setTimeout(() => {
        setGenerateError(null);
      }, 10000);
      
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTypeLabel = (type) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? reportType.label : type;
  };

  const getReportTypeDescription = (type) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? reportType.description : '';
  };

  // Helper function to convert Tailwind gradient classes to actual colors
  const getGradientColors = (colorClass) => {
    const colorMap = {
      'from-blue-500 to-blue-600': '#3B82F6, #2563EB',
      'from-green-500 to-green-600': '#10B981, #059669',
      'from-purple-500 to-purple-600': '#8B5CF6, #7C3AED',
      'from-emerald-500 to-emerald-600': '#10B981, #059669',
      'from-orange-500 to-orange-600': '#F97316, #EA580C'
    };
    return colorMap[colorClass] || '#6B7280, #4B5563';
  };

  // Helper function to get format icon colors
  const getFormatIconColor = (format) => {
    const colorMap = {
      'pdf': '#DC2626',     // Red
      'excel': '#059669',   // Green
      'csv': '#2563EB'      // Blue
    };
    return colorMap[format] || '#6B7280';
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold navy-text mb-2">Financial Reports</h1>
          <p className="text-gray-600 text-lg">Generate and download comprehensive financial reports instantly</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleGenerateReport}>
            <div className="space-y-8">
              
              {/* Report Type Selection */}
              <div>
                <label className="block text-lg font-semibold navy-text mb-4">
                  <i className="fas fa-chart-bar mr-2"></i>
                  Select Report Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {reportTypes.map(type => {
                    const isSelected = selectedReportType === type.value;
                    return (
                      <div 
                        key={type.value}
                        onClick={() => setSelectedReportType(type.value)}
                        className={`relative overflow-hidden border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50'
                        }`}
                        style={{
                          background: isSelected ? '#EBF8FF' : '#FFFFFF'
                        }}
                      >
                        <div 
                          className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10"
                          style={{
                            background: `linear-gradient(135deg, ${getGradientColors(type.color)})`
                          }}
                        ></div>
                        <div className="relative">
                          <div className="flex items-center mb-2">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${getGradientColors(type.color)})`
                              }}
                            >
                              <i className={`fas ${type.icon} text-sm`}></i>
                            </div>
                            <input
                              type="radio"
                              name="reportType"
                              value={type.value}
                              checked={isSelected}
                              onChange={() => setSelectedReportType(type.value)}
                              className="ml-auto h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                          </div>
                          <h3 className="font-semibold navy-text text-sm mb-1">{type.label}</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">{type.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Period */}
              <div>
                <label className="block text-lg font-semibold navy-text mb-4">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Time Period
                </label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={period}
                      onChange={(e) => updatePeriod(e.target.value)}
                      className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                    >
                      <option value="this-month">This Month</option>
                      <option value="last-month">Last Month</option>
                      <option value="last-3-months">Last 3 Months</option>
                      <option value="last-6-months">Last 6 Months</option>
                      <option value="this-year">This Year</option>
                      <option value="last-year">Last Year</option>
                      <option value="custom">Custom Date Range</option>
                    </select>
                  </div>
                  {period === 'custom' && (
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={customRange.startDate}
                          onChange={(e) => updateCustomRange(e.target.value, customRange.endDate)}
                          className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                        <input
                          type="date"
                          value={customRange.endDate}
                          onChange={(e) => updateCustomRange(customRange.startDate, e.target.value)}
                          className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Report Format */}
              <div>
                <label className="block text-lg font-semibold navy-text mb-4">
                  <i className="fas fa-file-download mr-2"></i>
                  Download Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {formatOptions.map(option => {
                    const isSelected = format === option.value;
                    return (
                      <div 
                        key={option.value}
                        onClick={() => setFormat(option.value)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-center shadow-sm ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 scale-105' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-md'
                        }`}
                        style={{
                          background: isSelected ? '#EBF8FF' : '#FFFFFF'
                        }}
                      >
                        <i className={`fas ${option.icon} text-2xl mb-2`} style={{ 
                          color: isSelected ? '#2563EB' : getFormatIconColor(option.value)
                        }}></i>
                        <p className={`font-medium text-sm mb-2 ${isSelected ? 'text-blue-700' : 'navy-text'}`}>
                          {option.label}
                        </p>
                        <input
                          type="radio"
                          name="format"
                          value={option.value}
                          checked={isSelected}
                          onChange={() => setFormat(option.value)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Report Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold navy-text mb-3">
                  <i className="fas fa-eye mr-2"></i>
                  Report Preview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>
                    <p className="navy-text">{reportTypes.find(rt => rt.value === selectedReportType)?.label}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Period:</span>
                    <p className="navy-text">{getPeriodLabel()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Format:</span>
                    <p className="navy-text">{formatOptions.find(f => f.value === format)?.label}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isGenerating && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Generating Report...</span>
                    <span className="text-sm font-medium text-blue-700">{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isGenerating || (period === 'custom' && (!customRange.startDate || !customRange.endDate))}
                  className={`w-full text-white rounded-xl py-4 font-semibold text-lg transition-all duration-300 shadow-lg ${
                    isGenerating || (period === 'custom' && (!customRange.startDate || !customRange.endDate))
                      ? 'bg-gray-400 cursor-not-allowed opacity-60'
                      : 'orange-bg hover:opacity-90 hover:shadow-xl transform hover:scale-105 active:scale-95'
                  }`}
                  style={{
                    background: isGenerating || (period === 'custom' && (!customRange.startDate || !customRange.endDate))
                      ? '#9CA3AF'
                      : 'linear-gradient(135deg, #F2994A 0%, #E67E22 100%)'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-3"></i>
                      Generating & Downloading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-3"></i>
                      Generate & Download Report
                    </>
                  )}
                </button>
              </div>

              {/* Success Message */}
              {generateSuccess && (
                <div className="bg-green-50 border-2 border-green-200 text-green-800 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                    <div>
                      <p className="font-semibold">Report Downloaded Successfully!</p>
                      <p className="text-sm mt-1">Check your downloads folder for the generated report file.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {generateError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-4">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
                    <div>
                      <p className="font-semibold">Download Failed</p>
                      <p className="text-sm mt-1">{generateError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold navy-text mb-3">
            <i className="fas fa-info-circle mr-2"></i>
            Report Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>PDF Reports:</strong> Professional formatted documents with charts and summaries
            </div>
            <div>
              <strong>Excel Reports:</strong> Detailed spreadsheets with multiple sheets and data analysis
            </div>
            <div>
              <strong>CSV Reports:</strong> Raw data exports perfect for further analysis
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reports;
