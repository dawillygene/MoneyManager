# Complete API Endpoints for Frontend Integration

## Base Configuration
- **Base URL**: `http://localhost:8080`
- **Authentication**: JWT Bearer tokens in Authorization header
- **Content-Type**: `application/json`
- **CORS**: Configured for `http://localhost:3000` and `http://localhost:5173`

## Dashboard Endpoints

### 1. Dashboard Overview
```
GET /api/dashboard/overview
```

**Query Parameters:**
- `period` (optional): `this-month` | `last-month` | `last-3-months` | `last-6-months` | `this-year` | `custom`
- `startDate` (optional): YYYY-MM-DD (required if period=custom)
- `endDate` (optional): YYYY-MM-DD (required if period=custom)
- `includeCharts` (optional): boolean (default: true)
- `includeProjections` (optional): boolean (default: true)

**Example Request:**
```javascript
GET /api/dashboard/overview?period=this-month&includeCharts=true&includeProjections=true
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Response:** Comprehensive dashboard data with summary, charts, budget overview, goals summary, recent transactions, and insights.

### 2. Dashboard Widgets
```
GET /api/dashboard/widgets
```

**Query Parameters:**
- `widgets` (required): Comma-separated list: `balance,income-expenses,expense-pie,budget-progress,goals-progress,recent-transactions`
- `period` (optional): Time period (default: this-month)

**Example Request:**
```javascript
GET /api/dashboard/widgets?widgets=balance,income-expenses,expense-pie&period=this-month
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## Reports Endpoints (Used for Dashboard Data)

### 3. Expense Analysis (was dashboard/expense-categories)
```
GET /api/reports/expense-analysis
```

**Query Parameters:**
- `period` (optional): Time period (default: this-month)
- `startDate` (optional): Start date for custom period
- `endDate` (optional): End date for custom period
- `includeSubcategories` (optional): boolean (default: true)
- `currency` (optional): Currency format (default: TZS)
- `groupBy` (optional): Group data by (default: category)

### 4. Cash Flow Analysis (was dashboard/cash-flow)
```
GET /api/reports/cash-flow
```

**Query Parameters:**
- `period` (optional): Analysis period (default: last-6-months)
- `includeProjections` (optional): boolean (default: true)
- `projectionMonths` (optional): Months to project (default: 3, max: 12)

### 5. Budget Performance (was dashboard/budget-progress)
```
GET /api/reports/budget-performance
```

**Query Parameters:**
- `period` (optional): Time period (default: this-month)
- `startDate` (optional): Start date for custom period
- `endDate` (optional): End date for custom period
- `includeForecasts` (optional): boolean (default: true)

### 6. Financial Health (was dashboard/financial-summary)
```
GET /api/reports/financial-health
```

**Query Parameters:**
- `period` (optional): Analysis period (default: last-6-months)
- `includeRecommendations` (optional): boolean (default: true)

### 7. Generate Report
```
POST /api/reports/generate
```

**Request Body:**
```json
{
  "reportType": "comprehensive",
  "reportName": "Monthly Financial Summary June 2025",
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "format": "PDF",
  "sections": [
    "executive_summary",
    "income_analysis",
    "expense_breakdown",
    "budget_performance",
    "goals_progress",
    "recommendations"
  ],
  "includeCharts": true,
  "emailDelivery": false
}
```

### 8. Report Status
```
GET /api/reports/status/{reportId}
```

**Path Parameters:**
- `reportId`: The ID returned from generate report

### 9. Download Report
```
GET /api/reports/download/{reportId}
```

**Path Parameters:**
- `reportId`: The report ID

**Query Parameters:**
- `format` (optional): Override format (pdf, csv, excel)

### 10. Reports List
```
GET /api/reports/list
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort direction (default: desc)
- `reportType` (optional): Filter by report type
- `format` (optional): Filter by format
- `status` (optional): Filter by status

### 11. Delete Report
```
DELETE /api/reports/{reportId}
```

**Path Parameters:**
- `reportId`: The report ID to delete

### 12. Export CSV
```
GET /api/reports/export/csv
```

**Query Parameters:**
- `type` (optional): Data type (default: all) - `transactions` | `budgets` | `goals` | `all`
- `period` (optional): Time period (default: this-month)
- `startDate` (optional): Start date for custom period
- `endDate` (optional): End date for custom period
- `categories` (optional): Comma-separated category filter

**Response:** Downloads CSV file directly

### 13. Export PDF
```
GET /api/reports/export/pdf
```

**Query Parameters:**
- `template` (optional): Report template (default: monthly) - `monthly` | `quarterly` | `annual` | `custom`
- `period` (optional): Time period (default: this-month)
- `startDate` (optional): Start date for custom period
- `endDate` (optional): End date for custom period
- `includeCharts` (optional): boolean (default: true)
- `sections` (optional): Comma-separated list of sections

**Response:** Downloads PDF file directly

### 14. Financial Health
```
GET /api/reports/financial-health
```

**Query Parameters:**
- `period` (optional): Analysis period (default: last-6-months)
- `includeRecommendations` (optional): boolean (default: true)

### 15. Cash Flow Analysis
```
GET /api/reports/cash-flow
```

**Query Parameters:**
- `period` (optional): Analysis period (default: last-6-months)
- `includeProjections` (optional): boolean (default: true)
- `projectionMonths` (optional): Months to project (default: 3, max: 12)

### 16. Legacy Monthly Report
```
GET /api/reports/monthly
```

**Query Parameters:**
- `year` (required): Year (YYYY)
- `month` (required): Month (1-12)

### 17. Legacy Yearly Report
```
GET /api/reports/yearly
```

**Query Parameters:**
- `year` (required): Year (YYYY)

### 18. Legacy Custom Report
```
GET /api/reports/custom
```

**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

### 19. Legacy Export
```
GET /api/reports/export
```

**Query Parameters:**
- `type` (required): Report type - `monthly` | `yearly` | `custom`
- `year` (optional): Year (required for monthly/yearly)
- `month` (optional): Month (required for monthly)
- `startDate` (optional): Start date (required for custom)
- `endDate` (optional): End date (required for custom)

## Frontend Integration Examples

### Updated JavaScript/Axios Integration

```javascript
import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token'); // Or from cookies
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard Service - CORRECTED ENDPOINTS
class DashboardService {
  async getDashboardOverview(params = {}) {
    try {
      const response = await api.get('/dashboard/overview', { params });
      return response.data;
    } catch (error) {
      console.error('Dashboard overview error:', error);
      throw error;
    }
  }

  async getWidgetData(widgets, period = 'this-month') {
    try {
      const response = await api.get('/dashboard/widgets', {
        params: { widgets: widgets.join(','), period }
      });
      return response.data;
    } catch (error) {
      console.error('Widget data error:', error);
      throw error;
    }
  }

  // CORRECTED: These are now reports endpoints
  async getExpenseCategories(params = {}) {
    try {
      const response = await api.get('/reports/expense-analysis', { params });
      return response.data;
    } catch (error) {
      console.error('Expense analysis error:', error);
      throw error;
    }
  }

  async getCashFlow(params = {}) {
    try {
      const response = await api.get('/reports/cash-flow', { params });
      return response.data;
    } catch (error) {
      console.error('Cash flow error:', error);
      throw error;
    }
  }

  async getBudgetProgress(params = {}) {
    try {
      const response = await api.get('/reports/budget-performance', { params });
      return response.data;
    } catch (error) {
      console.error('Budget performance error:', error);
      throw error;
    }
  }

  async getFinancialSummary(params = {}) {
    try {
      const response = await api.get('/reports/financial-health', { params });
      return response.data;
    } catch (error) {
      console.error('Financial health error:', error);
      throw error;
    }
  }

  // For recent transactions, use the main transaction endpoint or dashboard overview
  async getRecentTransactions(limit = 5) {
    try {
      // This would need to be implemented in your TransactionController
      const response = await api.get('/transactions', { 
        params: { limit, sortBy: 'date', sortOrder: 'desc' }
      });
      return response.data;
    } catch (error) {
      console.error('Recent transactions error:', error);
      throw error;
    }
  }
}

// Reports Service
class ReportsService {
  async getExpenseAnalysis(params = {}) {
    try {
      const response = await api.get('/reports/expense-analysis', { params });
      return response.data;
    } catch (error) {
      console.error('Expense analysis error:', error);
      throw error;
    }
  }

  async getIncomeVsExpenses(params = {}) {
    try {
      const response = await api.get('/reports/income-vs-expenses', { params });
      return response.data;
    } catch (error) {
      console.error('Income vs expenses error:', error);
      throw error;
    }
  }

  async getBudgetPerformance(params = {}) {
    try {
      const response = await api.get('/reports/budget-performance', { params });
      return response.data;
    } catch (error) {
      console.error('Budget performance error:', error);
      throw error;
    }
  }

  async getSavingsAnalysis(params = {}) {
    try {
      const response = await api.get('/reports/savings-analysis', { params });
      return response.data;
    } catch (error) {
      console.error('Savings analysis error:', error);
      throw error;
    }
  }

  async generateReport(reportData) {
    try {
      const response = await api.post('/reports/generate', reportData);
      return response.data;
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }

  async downloadReport(reportId, format = null) {
    try {
      const params = format ? { format } : {};
      const response = await api.get(`/reports/download/${reportId}`, {
        params,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial-report.${format || 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Report download error:', error);
      throw error;
    }
  }

  async exportCSV(params = {}) {
    try {
      const response = await api.get('/reports/export/csv', {
        params,
        responseType: 'blob'
      });
      
      this.handleFileDownload(response.data, 'financial-data.csv');
    } catch (error) {
      console.error('CSV export error:', error);
      throw error;
    }
  }

  async exportPDF(params = {}) {
    try {
      const response = await api.get('/reports/export/pdf', {
        params,
        responseType: 'blob'
      });
      
      this.handleFileDownload(response.data, 'financial-report.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }

  handleFileDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async getFinancialHealth(params = {}) {
    try {
      const response = await api.get('/reports/financial-health', { params });
      return response.data;
    } catch (error) {
      console.error('Financial health error:', error);
      throw error;
    }
  }

  async getCashFlow(params = {}) {
    try {
      const response = await api.get('/reports/cash-flow', { params });
      return response.data;
    } catch (error) {
      console.error('Cash flow error:', error);
      throw error;
    }
  }
}

// Usage Examples
const dashboardService = new DashboardService();
const reportsService = new ReportsService();

// Get dashboard overview
dashboardService.getDashboardOverview({
  period: 'this-month',
  includeCharts: true,
  includeProjections: true
}).then(data => {
  console.log('Dashboard data:', data);
});

// Get specific widgets
dashboardService.getWidgetData(['balance', 'income-expenses', 'expense-pie'])
  .then(data => {
    console.log('Widget data:', data);
  });

// Generate expense analysis (CORRECTED)
dashboardService.getExpenseCategories({
  period: 'last-3-months',
  includeSubcategories: true
}).then(data => {
  console.log('Expense analysis:', data);
});

// Export data as CSV
reportsService.exportCSV({
  type: 'transactions',
  period: 'this-month'
});

// Generate and download PDF report
reportsService.generateReport({
  reportType: 'comprehensive',
  reportName: 'Monthly Summary',
  dateRange: {
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  },
  format: 'PDF',
  includeCharts: true
}).then(result => {
  console.log('Report generation started:', result.reportId);
  // Check status periodically and download when ready
});
```

### React Hook Examples

```javascript
import { useState, useEffect } from 'react';

// Custom hook for dashboard data
export const useDashboard = (period = 'this-month') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardService.getDashboardOverview({
          period,
          includeCharts: true,
          includeProjections: true
        });
        setData(dashboardData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [period]);

  return { data, loading, error };
};

// Custom hook for reports
export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async (reportData) => {
    setLoading(true);
    try {
      const result = await reportsService.generateReport(reportData);
      return result;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getReportsList = async (params = {}) => {
    setLoading(true);
    try {
      const result = await api.get('/reports/list', { params });
      setReports(result.data.reports);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    reports,
    loading,
    generateReport,
    getReportsList
  };
};
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `DASHBOARD_OVERVIEW_FAILED`
- `WIDGET_DATA_FAILED`
- `EXPENSE_ANALYSIS_FAILED`
- `INCOME_EXPENSES_FAILED`
- `BUDGET_PERFORMANCE_FAILED`
- `SAVINGS_ANALYSIS_FAILED`
- `REPORT_GENERATION_FAILED`
- `REPORT_NOT_FOUND`
- `CSV_EXPORT_FAILED`
- `PDF_EXPORT_FAILED`
- `FINANCIAL_HEALTH_FAILED`
- `CASH_FLOW_FAILED`

## Notes

1. All monetary values are returned as numbers (BigDecimal converted to double)
2. Dates are in YYYY-MM-DD format
3. File downloads return binary data with appropriate headers
4. Pagination follows standard format with `page`, `limit`, `totalPages`, etc.
5. All endpoints require valid JWT authentication
6. CORS is configured for localhost development environments