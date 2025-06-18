/**
 * Integration test script for enhanced report functionality
 * This script can be run in the browser console to test API methods
 */

// Import necessary services (these would need to be available in the browser context)
// import { reportService } from '../api/services';

const ReportTestSuite = {
  async testReportIdGeneration() {
    console.log('=== Testing Report ID Generation ===');
    
    try {
      // Test different report types
      const testCases = [
        { type: 'expense-analysis', dateRange: { startDate: '2025-06-01' } },
        { type: 'income-vs-expenses', dateRange: { startDate: '2025-05-01' } },
        { type: 'savings-report' }, // No date range provided
        { type: 'comprehensive', dateRange: { startDate: '2025-04-15' } }
      ];

      for (const testCase of testCases) {
        const reportId = reportService.generateReportId(testCase.type, testCase.dateRange);
        console.log(`Type: ${testCase.type}, Generated ID: ${reportId}`);
        
        // Validate the generated ID
        const isValid = reportService.validateReportId(reportId);
        console.log(`ID Valid: ${isValid}`);
        
        if (isValid) {
          const parsed = reportService.parseReportId(reportId);
          console.log('Parsed:', parsed);
        }
        console.log('---');
      }
    } catch (error) {
      console.error('Report ID generation test failed:', error);
    }
  },

  async testDownloadErrorMapping() {
    console.log('=== Testing Error Code Mapping ===');
    
    const errorCodes = [
      'REPORT_GENERATION_FAILED',
      'REPORT_DOWNLOAD_FAILED',
      'INVALID_FORMAT',
      'REPORT_NOT_FOUND',
      'UNKNOWN_ERROR'
    ];

    for (const code of errorCodes) {
      const message = reportService.mapDownloadErrorCode(code, 'Original message');
      console.log(`${code}: ${message}`);
    }
  },

  async testFormatValidation() {
    console.log('=== Testing Format Validation ===');
    
    const formats = ['pdf', 'excel', 'xlsx', 'csv', 'doc', 'xml', 'json'];
    const validFormats = ['pdf', 'excel', 'xlsx', 'csv'];
    
    for (const format of formats) {
      const isValid = validFormats.includes(format.toLowerCase());
      console.log(`Format: ${format}, Valid: ${isValid}`);
    }
  },

  async runAllTests() {
    console.log('🚀 Starting Report Enhancement Tests');
    console.log('=====================================');
    
    await this.testReportIdGeneration();
    await this.testDownloadErrorMapping();
    await this.testFormatValidation();
    
    console.log('=====================================');
    console.log('✅ All tests completed');
  }
};

// Usage instructions
console.log(`
To run these tests in the browser console:

1. Open the Money Manager application
2. Open browser developer tools (F12)
3. Go to the Console tab
4. Paste this entire script
5. Run: ReportTestSuite.runAllTests()

Individual tests can be run with:
- ReportTestSuite.testReportIdGeneration()
- ReportTestSuite.testDownloadErrorMapping()
- ReportTestSuite.testFormatValidation()
`);

// Export for use in development
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReportTestSuite;
}

// Make available globally for browser console testing
if (typeof window !== 'undefined') {
  window.ReportTestSuite = ReportTestSuite;
}
