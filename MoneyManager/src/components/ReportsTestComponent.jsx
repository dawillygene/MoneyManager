import React, { useState } from 'react';
import { useReports, useReportExport } from '../hooks/useReports';

/**
 * Test component for validating enhanced report functionality
 * This component can be temporarily imported into the main app for testing
 */
const ReportsTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const { downloadReport } = useReports();
  const { exportReport } = useReportExport();

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runDownloadTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Test 1: PDF Download
    try {
      addTestResult('PDF Download', 'running', 'Testing PDF download...');
      const result = await downloadReport('expense_analysis_202506_001', 'pdf');
      if (result.success) {
        addTestResult('PDF Download', 'success', `Downloaded: ${result.filename || 'Unknown filename'}`);
      } else {
        addTestResult('PDF Download', 'error', result.error || 'Unknown error');
      }
    } catch (error) {
      addTestResult('PDF Download', 'error', error.message);
    }

    // Test 2: Excel Download
    try {
      addTestResult('Excel Download', 'running', 'Testing Excel download...');
      const result = await downloadReport('income_vs_expenses_202506_001', 'excel');
      if (result.success) {
        addTestResult('Excel Download', 'success', `Downloaded: ${result.filename || 'Unknown filename'}`);
      } else {
        addTestResult('Excel Download', 'error', result.error || 'Unknown error');
      }
    } catch (error) {
      addTestResult('Excel Download', 'error', error.message);
    }

    // Test 3: CSV Download
    try {
      addTestResult('CSV Download', 'running', 'Testing CSV download...');
      const result = await downloadReport('savings_report_202506_001', 'csv');
      if (result.success) {
        addTestResult('CSV Download', 'success', `Downloaded: ${result.filename || 'Unknown filename'}`);
      } else {
        addTestResult('CSV Download', 'error', result.error || 'Unknown error');
      }
    } catch (error) {
      addTestResult('CSV Download', 'error', error.message);
    }

    // Test 4: Invalid Format
    try {
      addTestResult('Invalid Format', 'running', 'Testing invalid format handling...');
      const result = await downloadReport('test_report_202506_001', 'xml');
      addTestResult('Invalid Format', 'error', 'Should have failed but succeeded');
    } catch (error) {
      if (error.message.includes('Invalid') || error.message.includes('INVALID_FORMAT')) {
        addTestResult('Invalid Format', 'success', 'Correctly rejected invalid format');
      } else {
        addTestResult('Invalid Format', 'error', `Unexpected error: ${error.message}`);
      }
    }

    // Test 5: Export with Progress
    try {
      addTestResult('Export Test', 'running', 'Testing export functionality...');
      const result = await exportReport({
        reportType: 'comprehensive',
        format: 'pdf',
        period: 'this-month'
      });
      if (result.success) {
        addTestResult('Export Test', 'success', `Exported: ${result.filename || 'Unknown filename'}`);
      } else {
        addTestResult('Export Test', 'error', result.error || 'Unknown error');
      }
    } catch (error) {
      addTestResult('Export Test', 'error', error.message);
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Reports Enhancement Test Suite
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            This component tests the enhanced report download and export functionality.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={runDownloadTests}
              disabled={isRunning}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Running Tests...
                </>
              ) : (
                'Run Tests'
              )}
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-md flex items-center justify-between ${
                    result.status === 'success' ? 'bg-green-100 border border-green-200' :
                    result.status === 'error' ? 'bg-red-100 border border-red-200' :
                    'bg-yellow-100 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`mr-3 ${
                      result.status === 'success' ? 'text-green-600' :
                      result.status === 'error' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {result.status === 'success' && <i className="fas fa-check-circle"></i>}
                      {result.status === 'error' && <i className="fas fa-exclamation-circle"></i>}
                      {result.status === 'running' && <i className="fas fa-spinner fa-spin"></i>}
                    </span>
                    <div>
                      <span className="font-medium">{result.test}</span>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Test Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click "Run Tests" to execute all test scenarios</li>
            <li>• Tests will attempt to download reports in different formats</li>
            <li>• Check browser's download folder for downloaded files</li>
            <li>• Green results indicate successful operations</li>
            <li>• Red results indicate errors (some are expected for invalid format test)</li>
            <li>• Yellow results indicate tests in progress</li>
          </ul>
        </div>

        {/* Expected Results */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-green-800">Expected Results</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• PDF, Excel, and CSV downloads should succeed (if reports exist)</li>
            <li>• Invalid format test should fail gracefully with appropriate error message</li>
            <li>• Export test should show progress and complete successfully</li>
            <li>• All downloaded files should have proper filenames from Content-Disposition headers</li>
            <li>• No console errors related to authentication or API calls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportsTestComponent;
