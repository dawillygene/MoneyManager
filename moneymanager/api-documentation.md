# Money Manager Report Download API Documentation

## Overview

The Money Manager application provides comprehensive report generation and download capabilities in multiple formats (PDF, Excel, CSV). This documentation covers the API endpoints for downloading financial reports.

## Base URL
```
http://localhost:8080/api/reports
```

## Authentication

All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Report Download Endpoint

### Download Report
Generate and download a financial report in the specified format.

**Endpoint:** `GET /download/{reportId}`

**Parameters:**
- `reportId` (path parameter, required): Unique identifier for the report type
- `format` (query parameter, optional): File format - `pdf`, `excel`, `xlsx`, or `csv` (default: `pdf`)

**Report ID Formats:**
- `expense_analysis_YYYYMM_001` - Expense analysis report
- `income_vs_expenses_YYYYMM_001` - Income vs expenses comparison
- `budget_progress_YYYYMM_001` - Budget progress tracking
- `savings_report_YYYYMM_001` - Savings analysis report
- `comprehensive_YYYYMM_001` - Comprehensive financial summary

**Example Requests:**

```bash
# Download PDF expense analysis report
curl -X GET "http://localhost:8080/api/reports/download/expense_analysis_202506_001?format=pdf" \
  -H "Authorization: Bearer your_jwt_token" \
  --output "expense_report.pdf"

# Download Excel budget progress report
curl -X GET "http://localhost:8080/api/reports/download/budget_progress_202506_001?format=excel" \
  -H "Authorization: Bearer your_jwt_token" \
  --output "budget_report.xlsx"

# Download CSV comprehensive report
curl -X GET "http://localhost:8080/api/reports/download/comprehensive_202506_001?format=csv" \
  -H "Authorization: Bearer your_jwt_token" \
  --output "financial_summary.csv"
```

**Response Headers:**
```
Content-Type: application/pdf | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | text/csv
Content-Disposition: attachment; filename="financial-report-{reportId}.{extension}"
Content-Length: {file_size_in_bytes}
X-File-Size: {file_size_in_bytes}
```

**Success Response:**
- **Status Code:** 200 OK
- **Body:** Binary file data

**Error Response:**
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

**Error Codes:**
- `REPORT_GENERATION_FAILED` - Failed to generate the report
- `REPORT_DOWNLOAD_FAILED` - Failed to download the report
- `INVALID_FORMAT` - Unsupported file format
- `REPORT_NOT_FOUND` - Report ID not found

## Frontend Integration Examples

### JavaScript (Vanilla)

```javascript
async function downloadReport(reportId, format = 'pdf') {
    try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`/api/reports/download/${reportId}?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `report.${format}`;

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download report: ' + error.message);
    }
}

// Usage
downloadReport('expense_analysis_202506_001', 'pdf');
```

### React.js

```jsx
import React, { useState } from 'react';

const ReportDownload = () => {
    const [loading, setLoading] = useState(false);

    const downloadReport = async (reportId, format) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`/api/reports/download/${reportId}?format=${format}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `report.${format}`;

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download failed:', error);
            // Handle error (show toast, etc.)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button 
                onClick={() => downloadReport('expense_analysis_202506_001', 'pdf')}
                disabled={loading}
            >
                {loading ? 'Downloading...' : 'Download PDF Report'}
            </button>
            <button 
                onClick={() => downloadReport('expense_analysis_202506_001', 'excel')}
                disabled={loading}
            >
                Download Excel Report
            </button>
            <button 
                onClick={() => downloadReport('expense_analysis_202506_001', 'csv')}
                disabled={loading}
            >
                Download CSV Report
            </button>
        </div>
    );
};

export default ReportDownload;
```

### Axios (Alternative)

```javascript
import axios from 'axios';

const downloadReportWithAxios = async (reportId, format) => {
    try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios({
            method: 'GET',
            url: `/api/reports/download/${reportId}?format=${format}`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            responseType: 'blob', // Important for binary data
        });

        // Extract filename from response headers
        const contentDisposition = response.headers['content-disposition'];
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `report.${format}`;

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Download failed:', error);
        if (error.response && error.response.data) {
            // Handle API error response
            const errorText = await error.response.data.text();
            const errorObj = JSON.parse(errorText);
            alert('Download failed: ' + errorObj.message);
        }
    }
};
```

## Report Content Structure

### PDF Reports
- **Header:** Report title, date range, generation timestamp
- **Summary Section:** Key financial metrics (income, expenses, net income)
- **Transaction Details:** Tabular listing of transactions (limited to 50 for readability)
- **Category Breakdown:** Pie chart data and percentages
- **Footer:** Page numbers and additional metadata

### Excel Reports
- **Summary Sheet:** Financial overview with charts
- **Transactions Sheet:** Complete transaction listing (up to 1000 entries)
- **Categories Sheet:** Category-wise breakdown
- **Charts:** Visual representations of data
- **Formatting:** Professional styling with headers and color coding

### CSV Reports
- **Header Section:** Report metadata and summary
- **Transaction Data:** Complete transaction export
- **Category Summary:** Category-wise totals and percentages
- **Format:** Standard CSV with proper escaping for special characters

## File Size Considerations

- **PDF:** Typically 100KB - 2MB depending on data volume
- **Excel:** 50KB - 5MB with formatting and charts
- **CSV:** 10KB - 1MB (most compact format)

## Rate Limiting

- Maximum 10 report downloads per minute per user
- Large reports (>1000 transactions) may take 5-30 seconds to generate
- Concurrent download limit: 3 per user

## Error Handling

### Common Error Scenarios
1. **Invalid Report ID:** Returns 400 Bad Request
2. **Unauthorized Access:** Returns 401 Unauthorized  
3. **Report Generation Timeout:** Returns 408 Request Timeout
4. **Server Error:** Returns 500 Internal Server Error

### Frontend Error Handling Best Practices
```javascript
const handleDownloadError = (error) => {
    if (error.code === 'REPORT_GENERATION_FAILED') {
        showNotification('Report generation failed. Please try again.', 'error');
    } else if (error.code === 'INVALID_FORMAT') {
        showNotification('Invalid file format selected.', 'warning');
    } else {
        showNotification('Download failed. Please check your connection.', 'error');
    }
};
```

## Security Considerations

- All downloads require valid JWT authentication
- Report data is filtered by user ID automatically
- No sensitive data is logged in download requests
- File downloads use secure headers to prevent XSS

## Browser Compatibility

- **Chrome:** Full support for all formats
- **Firefox:** Full support for all formats
- **Safari:** Full support for all formats
- **Edge:** Full support for all formats
- **IE11:** Limited support (consider polyfills for fetch API)

## Testing the API

### Using Postman
1. Set Authorization header with Bearer token
2. Set request method to GET
3. Use URL: `{{baseUrl}}/api/reports/download/expense_analysis_202506_001?format=pdf`
4. Send request and save response as binary file

### Using cURL
```bash
curl -X GET "http://localhost:8080/api/reports/download/expense_analysis_202506_001?format=pdf" \
  -H "Authorization: Bearer your_jwt_token" \
  -o "report.pdf"
```

## Support and Troubleshooting

### Common Issues
1. **Empty file downloaded:** Check if user has data for the requested period
2. **Download doesn't start:** Verify JWT token is valid and not expired
3. **Corrupted file:** Ensure proper binary handling in frontend code
4. **Slow downloads:** Large datasets may require patience or pagination

For additional support, check the application logs for detailed error messages.
