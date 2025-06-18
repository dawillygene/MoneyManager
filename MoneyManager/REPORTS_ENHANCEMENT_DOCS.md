# Enhanced Reports Documentation

## Overview

The Money Manager reports system has been enhanced to provide better download functionality, progress tracking, and error handling according to the API documentation specifications.

## Key Features

### 🔧 Enhanced API Service Layer

#### ReportService Improvements

**Enhanced Download Method:**
```javascript
// New signature with format support and metadata extraction
const result = await reportService.downloadReport(reportId, format);
// Returns: { blob, filename, fileSize, contentType }
```

**Report ID Management:**
```javascript
// Generate properly formatted report IDs
const reportId = reportService.generateReportId('expense-analysis', dateRange);
// Returns: "expense_analysis_202506_001"

// Validate report ID format
const isValid = reportService.validateReportId(reportId);

// Parse report ID components
const parsed = reportService.parseReportId(reportId);
// Returns: { type, year, month, sequence }
```

**Error Handling:**
- Maps API error codes to user-friendly messages
- Handles Content-Disposition header parsing
- Extracts file size information
- Supports blob response handling

### 🎣 Enhanced React Hooks

#### useReports Hook
```javascript
const { downloadReport, loading, error } = useReports();

// Enhanced download with format and progress feedback
const result = await downloadReport(reportId, 'excel');
if (result.success) {
  console.log(`Downloaded: ${result.filename}, Size: ${result.fileSize}`);
}
```

#### useReportExport Hook
```javascript
const { exportReport, loading, progress } = useReportExport();

await exportReport({
  reportType: 'comprehensive',
  format: 'pdf',
  dateRange: { startDate: '2025-06-01', endDate: '2025-06-30' },
  dataLevel: 'detailed'
});
```

#### useReportGeneration Hook
```javascript
const { generatingReports, generateReportWithTracking } = useReportGeneration();

// Real-time progress tracking for report generation
await generateReportWithTracking({
  reportType: 'expense-analysis',
  reportName: 'Monthly Expenses - June 2025',
  period: 'this-month'
});
```

### 🎨 Enhanced UI Components

#### Format Selection
- Global format selector for exports (PDF, Excel, CSV)
- Individual download format dropdowns for each report
- Visual feedback during downloads

#### Progress Indicators
- Real-time progress bars for report generation
- Loading states for individual downloads
- Export progress percentage display

#### Error Handling
- User-friendly error messages
- Specific handling for different error scenarios
- Retry mechanisms where appropriate

## API Compliance

### Endpoint Format
```
GET /api/reports/download/{reportId}?format={format}
```

### Supported Formats
- `pdf` - Portable Document Format
- `excel` - Microsoft Excel format
- `xlsx` - Excel Open XML format
- `csv` - Comma Separated Values

### Report ID Format
```
{reportType}_YYYYMM_{sequence}

Examples:
- expense_analysis_202506_001
- income_vs_expenses_202506_001
- budget_progress_202506_001
- savings_report_202506_001
- comprehensive_202506_001
```

### Response Headers
- `Content-Type`: File MIME type
- `Content-Disposition`: Contains filename
- `Content-Length`: File size in bytes
- `X-File-Size`: Alternative file size header

### Error Codes
- `REPORT_GENERATION_FAILED` - Report generation error
- `REPORT_DOWNLOAD_FAILED` - Download process error
- `INVALID_FORMAT` - Unsupported file format
- `REPORT_NOT_FOUND` - Report does not exist

## Authentication Integration

### Memory-Based Token Storage ✅
- Tokens stored in memory (not localStorage)
- Automatic refresh handled by axios interceptors
- No changes to existing authentication flow

### Request Flow
1. Token retrieved from memory via `tokenStorage.getAccessToken()`
2. Token automatically injected by axios interceptors
3. Automatic refresh on 401 errors
4. Download proceeds with valid authentication

## Usage Examples

### Basic Report Download
```javascript
import { useReports } from '../hooks/useReports';

const MyComponent = () => {
  const { downloadReport, loading, error } = useReports();
  
  const handleDownload = async () => {
    const result = await downloadReport('expense_analysis_202506_001', 'pdf');
    if (result.success) {
      alert(`Downloaded: ${result.filename}`);
    }
  };
  
  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? 'Downloading...' : 'Download PDF'}
    </button>
  );
};
```

### Export with Progress
```javascript
import { useReportExport } from '../hooks/useReports';

const ExportComponent = () => {
  const { exportReport, loading, progress } = useReportExport();
  
  const handleExport = async () => {
    await exportReport({
      reportType: 'comprehensive',
      format: 'excel',
      period: 'this-month'
    });
  };
  
  return (
    <div>
      <button onClick={handleExport} disabled={loading}>
        Export Report
      </button>
      {loading && (
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
};
```

### Report Generation with Tracking
```javascript
import { useReportGeneration } from '../hooks/useReports';

const GenerationComponent = () => {
  const { generatingReports, generateReportWithTracking } = useReportGeneration();
  
  const handleGenerate = async () => {
    await generateReportWithTracking({
      reportType: 'expense-analysis',
      reportName: 'Monthly Expense Analysis',
      period: 'this-month',
      includeCharts: true
    });
  };
  
  return (
    <div>
      <button onClick={handleGenerate}>Generate Report</button>
      
      {generatingReports.map(report => (
        <div key={report.id} className="progress-item">
          <p>{report.reportName}</p>
          <div className="progress-bar">
            <div style={{ width: `${report.progress}%` }}>
              {report.progress}%
            </div>
          </div>
          <p>{report.message}</p>
        </div>
      ))}
    </div>
  );
};
```

## Testing

### Test Component
A test component (`ReportsTestComponent.jsx`) is available for validating the enhanced functionality:

```javascript
import ReportsTestComponent from '../components/ReportsTestComponent';

// Add to your app temporarily for testing
<ReportsTestComponent />
```

### Console Testing
Use the provided test script (`test-reports.js`) for browser console testing:

```javascript
// In browser console
ReportTestSuite.runAllTests();
```

## Browser Compatibility

- **Chrome**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support ✅
- **Edge**: Full support ✅
- **IE11**: Limited support (requires fetch polyfill)

## Performance Considerations

- Blob handling optimized for large files
- Memory cleanup after downloads
- Progress tracking with minimal overhead
- Efficient error handling without performance impact

## Security Features

- HttpOnly cookie authentication maintained
- Automatic token refresh during downloads
- Secure blob handling
- XSS prevention through proper header handling
- No localStorage usage (prevents token theft)

## Migration Notes

### Breaking Changes
None - all changes are backward compatible.

### New Features Available
- Enhanced download with metadata
- Progress tracking for generation and export
- Format selection UI components
- Improved error handling

### Recommended Updates
- Update existing download calls to use new format parameter
- Add progress indicators to improve user experience
- Implement error handling for better user feedback
