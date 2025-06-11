# Reports and Dashboard API Documentation

## Overview
This document outlines the API structure and requirements for the Reporting and Dashboard features in the Money Manager application. The Reports API provides comprehensive financial analytics, dashboard data, report generation capabilities, and export functionality in CSV and PDF formats.

## Base Configuration
- **Base URL**: `http://localhost:8080/api/reports`
- **Authentication**: JWT Bearer tokens
- **Token Storage**: **HttpOnly cookies ONLY** (no localStorage)
- **Cookies**: HttpOnly cookies with automatic management
- **CORS**: `withCredentials: true` required for cookie handling

## Dashboard API Endpoints

### Dashboard Overview

The dashboard provides real-time financial overview with key metrics, charts, and insights.

#### GET /dashboard/overview
Get comprehensive dashboard data with income, expenses, balances, and charts.

**Query Parameters:**
- `period`: Time period (this-month, last-month, last-3-months, last-6-months, this-year, custom)
- `startDate`: Start date for custom period (YYYY-MM-DD)
- `endDate`: End date for custom period (YYYY-MM-DD)
- `includeCharts`: Include chart data (default: true)
- `includeProjections`: Include future projections (default: true)

**Example Request:**
```
GET /dashboard/overview?period=this-month&includeCharts=true&includeProjections=true
```

**Response:**
```json
{
  "period": "this-month",
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "summary": {
    "totalIncome": 1500000.00,
    "totalExpenses": 1890000.00,
    "netIncome": -390000.00,
    "currentBalance": 2450000.00,
    "savingsRate": -26.0,
    "expenseRatio": 126.0,
    "monthlyBudgetUtilization": 75.6,
    "goalProgress": 68.4
  },
  "incomeVsExpenses": {
    "chartData": [
      {
        "month": "2025-04",
        "income": 1500000.00,
        "expenses": 1650000.00,
        "net": -150000.00
      },
      {
        "month": "2025-05",
        "income": 1500000.00,
        "expenses": 1780000.00,
        "net": -280000.00
      },
      {
        "month": "2025-06",
        "income": 1500000.00,
        "expenses": 1890000.00,
        "net": -390000.00
      }
    ],
    "trend": "declining",
    "projectedNextMonth": {
      "income": 1500000.00,
      "expenses": 1950000.00,
      "net": -450000.00
    }
  },
  "expenseBreakdown": {
    "chartData": [
      {
        "category": "Housing",
        "amount": 850000.00,
        "percentage": 44.97,
        "color": "#FF6384"
      },
      {
        "category": "Food & Dining",
        "amount": 420000.00,
        "percentage": 22.22,
        "color": "#36A2EB"
      },
      {
        "category": "Transportation",
        "amount": 320000.00,
        "percentage": 16.93,
        "color": "#FFCE56"
      },
      {
        "category": "Entertainment",
        "amount": 300000.00,
        "percentage": 15.87,
        "color": "#4BC0C0"
      }
    ],
    "topCategory": "Housing",
    "mostVolatileCategory": "Entertainment"
  },
  "balanceHistory": {
    "chartData": [
      {
        "date": "2025-06-01",
        "balance": 2840000.00
      },
      {
        "date": "2025-06-10",
        "balance": 2720000.00
      },
      {
        "date": "2025-06-20",
        "balance": 2580000.00
      },
      {
        "date": "2025-06-30",
        "balance": 2450000.00
      }
    ],
    "trend": "declining",
    "averageDailyChange": -13000.00
  },
  "budgetOverview": {
    "totalBudgeted": 2500000.00,
    "totalSpent": 1890000.00,
    "utilization": 75.6,
    "categoriesOverBudget": 1,
    "categoriesOnTrack": 4,
    "categoriesUnderUtilized": 2,
    "alerts": [
      {
        "category": "Transportation",
        "severity": "warning",
        "message": "6.67% over budget"
      }
    ]
  },
  "goalsSummary": {
    "totalGoals": 8,
    "activeGoals": 6,
    "completedGoals": 1,
    "overdueGoals": 1,
    "totalProgress": 68.4,
    "nextCompletingGoal": {
      "name": "Summer Vacation",
      "progress": 72.0,
      "estimatedCompletion": "2025-07-15"
    }
  },
  "recentTransactions": [
    {
      "id": 1001,
      "description": "Grocery Shopping",
      "amount": -85000.00,
      "category": "Food & Dining",
      "date": "2025-06-11",
      "type": "expense"
    },
    {
      "id": 1002,
      "description": "Salary Deposit",
      "amount": 1200000.00,
      "category": "Salary",
      "date": "2025-06-10",
      "type": "income"
    },
    {
      "id": 1003,
      "description": "Rent Payment",
      "amount": -650000.00,
      "category": "Housing",
      "date": "2025-06-05",
      "type": "expense"
    }
  ],
  "insights": {
    "alerts": [
      {
        "type": "negative_cash_flow",
        "severity": "high",
        "message": "Expenses exceed income for 3 consecutive months"
      },
      {
        "type": "budget_exceeded",
        "severity": "medium",
        "message": "Transportation budget exceeded by 6.67%"
      }
    ],
    "recommendations": [
      "Urgent: Reduce monthly expenses by at least 25%",
      "Focus on cutting transportation and entertainment costs",
      "Consider additional income sources"
    ],
    "achievements": [
      "Maintained consistent income for 6 months",
      "Housing expenses remain within budget"
    ]
  }
}
```

#### GET /dashboard/widgets
Get individual widget data for customizable dashboard.

**Query Parameters:**
- `widgets`: Comma-separated list of widget names (balance, income-expenses, expense-pie, budget-progress, goals-progress, recent-transactions)
- `period`: Time period for data (default: this-month)

**Response:**
```json
{
  "widgets": {
    "balance": {
      "currentBalance": 2450000.00,
      "changeFromLastMonth": -390000.00,
      "changePercentage": -13.74,
      "trend": "declining"
    },
    "income-expenses": {
      "income": 1500000.00,
      "expenses": 1890000.00,
      "net": -390000.00,
      "chartData": [...]
    },
    "expense-pie": {
      "categories": [...],
      "totalExpenses": 1890000.00
    },
    "budget-progress": {
      "utilization": 75.6,
      "categoriesData": [...]
    },
    "goals-progress": {
      "overallProgress": 68.4,
      "activeGoals": 6,
      "nearCompletion": [...]
    },
    "recent-transactions": {
      "transactions": [...],
      "count": 5
    }
  }
}
```

## Reports API Endpoints

### Core Report Endpoints

#### GET /reports/expense-analysis
Get detailed expense analysis by category with breakdown and trends.

**Query Parameters:**
- `period`: Time period (this-month, last-month, last-3-months, last-6-months, this-year, custom)
- `startDate`: Start date for custom period (YYYY-MM-DD)
- `endDate`: End date for custom period (YYYY-MM-DD)
- `includeSubcategories`: Include subcategory breakdown (default: true)
- `currency`: Currency format (default: TZS)
- `groupBy`: Group data by (day, week, month, category)

**Response:**
```json
{
  "period": "this-month",
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "totalExpenses": 1890000.00,
  "categoryBreakdown": [
    {
      "category": "Housing",
      "amount": 850000.00,
      "percentage": 44.97,
      "transactionCount": 3,
      "averageTransaction": 283333.33,
      "subcategories": [
        {
          "name": "Rent",
          "amount": 650000.00,
          "percentage": 76.47,
          "transactionCount": 1
        },
        {
          "name": "Utilities",
          "amount": 200000.00,
          "percentage": 23.53,
          "transactionCount": 2
        }
      ]
    }
  ],
  "trends": {
    "monthlyComparison": [
      { "month": "2025-04", "amount": 1650000.00 },
      { "month": "2025-05", "amount": 1780000.00 },
      { "month": "2025-06", "amount": 1890000.00 }
    ],
    "averageMonthlyExpense": 1773333.33,
    "trendDirection": "increasing",
    "percentageChange": "+6.18%"
  },
  "insights": {
    "highestCategory": "Housing",
    "fastestGrowingCategory": "Transportation",
    "recommendations": [
      "Consider reducing restaurant expenses",
      "Transportation costs increased by 15% this month"
    ]
  }
}
```

#### GET /reports/income-vs-expenses
Compare income and expenses over time with analysis.

**Query Parameters:**
- `period`: Time period
- `startDate`: Start date for custom period
- `endDate`: End date for custom period
- `includeProjections`: Include future projections (default: true)
- `groupBy`: Group data by (day, week, month)

**Response:**
```json
{
  "period": "last-3-months",
  "summary": {
    "totalIncome": 4500000.00,
    "totalExpenses": 5320000.00,
    "netIncome": -820000.00,
    "savingsRate": -18.22,
    "expenseRatio": 118.22
  },
  "monthlyBreakdown": [
    {
      "month": "2025-04",
      "income": 1500000.00,
      "expenses": 1650000.00,
      "netIncome": -150000.00,
      "savingsRate": -10.0
    }
  ],
  "trends": {
    "incomeGrowthRate": 0.0,
    "expenseGrowthRate": 14.55,
    "projectedNextMonth": {
      "income": 1500000.00,
      "expenses": 1950000.00
    }
  },
  "analysis": {
    "budgetHealth": "poor",
    "recommendations": [
      "Urgent: Reduce monthly expenses by at least 25%",
      "Consider additional income sources"
    ]
  }
}
```

#### GET /reports/budget-performance
Analyze budget performance with variance analysis.

**Query Parameters:**
- `period`: Time period
- `startDate`: Start date for custom period
- `endDate`: End date for custom period
- `includeForecasts`: Include spending forecasts (default: true)

**Response:**
```json
{
  "period": "this-month",
  "overallPerformance": {
    "totalBudgeted": 2500000.00,
    "totalSpent": 1890000.00,
    "totalRemaining": 610000.00,
    "overallUtilization": 75.6,
    "budgetsOnTrack": 4,
    "budgetsOverBudget": 1
  },
  "categoryPerformance": [
    {
      "category": "Housing",
      "budgeted": 1000000.00,
      "spent": 850000.00,
      "remaining": 150000.00,
      "utilization": 85.0,
      "status": "on_track",
      "projectedSpending": 900000.00
    }
  ]
}
```

#### GET /reports/savings-analysis
Track saving habits and goals progress.

**Query Parameters:**
- `period`: Time period
- `includeGoals`: Include savings goals progress (default: true)
- `includeRecommendations`: Include optimization recommendations (default: true)

**Response:**
```json
{
  "savingsSummary": {
    "totalSaved": 2150000.00,
    "targetSavings": 3600000.00,
    "savingsProgress": 59.72,
    "monthlySavingsAverage": 358333.33,
    "savingsRate": 14.33
  },
  "goalsProgress": [
    {
      "goalId": 1,
      "goalName": "Emergency Fund",
      "targetAmount": 12000000.00,
      "currentAmount": 8500000.00,
      "progress": 70.83,
      "onTrack": true
    }
  ],
  "recommendations": [
    "Automate savings transfers to improve consistency",
    "Consider investment options for long-term goals"
  ]
}
```

### Report Generation and Download

#### POST /reports/generate
Generate a comprehensive financial report.

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

**Response:**
```json
{
  "reportId": "rpt_202506_001",
  "status": "processing",
  "message": "Report generation started",
  "estimatedCompletionTime": "2025-06-11T18:35:00Z",
  "statusCheckUrl": "/reports/status/rpt_202506_001"
}
```

#### GET /reports/status/{reportId}
Check report generation status.

**Response:**
```json
{
  "reportId": "rpt_202506_001",
  "status": "completed",
  "progress": 100,
  "downloadUrl": "/reports/download/rpt_202506_001",
  "generatedAt": "2025-06-11T18:33:00Z",
  "fileSize": "3.2 MB",
  "format": "PDF",
  "expiresAt": "2025-07-11T18:33:00Z"
}
```

#### GET /reports/download/{reportId}
Download generated report.

**Query Parameters:**
- `format`: Override format (pdf, csv, excel) - optional

**Response:**
- **Content-Type**: `application/pdf`, `text/csv`, or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="financial-report-june-2025.pdf"`
- **Body**: Binary file content

#### GET /reports/export/csv
Export financial data in CSV format.

**Query Parameters:**
- `type`: Data type (transactions, budgets, goals, all)
- `period`: Time period
- `startDate`: Start date for custom period
- `endDate`: End date for custom period
- `categories`: Comma-separated category filter

**Response:**
- **Content-Type**: `text/csv`
- **Content-Disposition**: `attachment; filename="financial-data-export.csv"`
- **Body**: CSV formatted data

**Example CSV Output:**
```csv
Date,Description,Category,Type,Amount,Balance
2025-06-11,Grocery Shopping,Food & Dining,expense,-85000.00,2365000.00
2025-06-10,Salary Deposit,Salary,income,1200000.00,2450000.00
2025-06-05,Rent Payment,Housing,expense,-650000.00,1250000.00
```

#### GET /reports/export/pdf
Export comprehensive financial report in PDF format.

**Query Parameters:**
- `template`: Report template (monthly, quarterly, annual, custom)
- `period`: Time period
- `startDate`: Start date for custom period
- `endDate`: End date for custom period
- `includeCharts`: Include charts and graphs (default: true)
- `sections`: Comma-separated list of sections to include

**Response:**
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="financial-report.pdf"`
- **Body**: PDF file content

### Historical Reports

#### GET /reports/list
Get list of previously generated reports.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `sortBy`: Sort field (createdAt, reportType, format)
- `sortOrder`: Sort direction (asc, desc)
- `reportType`: Filter by report type
- `format`: Filter by format (PDF, CSV, Excel)

**Response:**
```json
{
  "reports": [
    {
      "id": "rpt_202506_001",
      "reportName": "Monthly Financial Summary",
      "reportType": "comprehensive",
      "format": "PDF",
      "dateRange": {
        "startDate": "2025-06-01",
        "endDate": "2025-06-30"
      },
      "generatedAt": "2025-06-11T18:33:00Z",
      "fileSize": "3.2 MB",
      "downloadCount": 2,
      "downloadUrl": "/reports/download/rpt_202506_001",
      "status": "available"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### DELETE /reports/{reportId}
Delete a generated report.

**Response:**
```json
{
  "message": "Report deleted successfully",
  "reportId": "rpt_202506_001",
  "deletedAt": "2025-06-11T19:00:00Z"
}
```

### Advanced Analytics

#### GET /reports/financial-health
Get comprehensive financial health score and analysis.

**Query Parameters:**
- `period`: Analysis period (last-3-months, last-6-months, this-year)
- `includeRecommendations`: Include recommendations (default: true)

**Response:**
```json
{
  "financialHealthScore": 68,
  "scoreBreakdown": {
    "savingsRate": {
      "score": 45,
      "weight": 25,
      "value": -2.7,
      "status": "poor"
    },
    "budgetAdherence": {
      "score": 75,
      "weight": 20,
      "value": 85.3,
      "status": "good"
    },
    "debtToIncomeRatio": {
      "score": 85,
      "weight": 20,
      "value": 15.2,
      "status": "excellent"
    }
  },
  "recommendations": [
    {
      "priority": "high",
      "category": "savings",
      "title": "Improve Savings Rate",
      "actionItems": [
        "Cut non-essential expenses by 20%",
        "Consider side income opportunities"
      ]
    }
  ]
}
```

#### GET /reports/cash-flow
Analyze cash flow patterns and predictions.

**Query Parameters:**
- `period`: Analysis period
- `includeProjections`: Include projections (default: true)
- `projectionMonths`: Months to project (default: 3, max: 12)

**Response:**
```json
{
  "cashFlowSummary": {
    "totalInflow": 9000000.00,
    "totalOutflow": 9820000.00,
    "netCashFlow": -820000.00,
    "cashFlowVolatility": "high"
  },
  "monthlyCashFlow": [
    {
      "month": "2025-06",
      "inflow": 1500000.00,
      "outflow": 1890000.00,
      "netFlow": -390000.00,
      "endingBalance": 1610000.00
    }
  ],
  "projections": [
    {
      "month": "2025-07",
      "projectedInflow": 1500000.00,
      "projectedOutflow": 1950000.00,
      "projectedNetFlow": -450000.00,
      "confidence": 85
    }
  ],
  "alerts": [
    {
      "type": "liquidity_warning",
      "severity": "high",
      "message": "Cash reserves may be depleted within 4 months"
    }
  ]
}
```

## Chart Data Formats

### Expense Pie Chart
```json
{
  "chartType": "pie",
  "data": [
    {
      "label": "Housing",
      "value": 850000.00,
      "percentage": 44.97,
      "color": "#FF6384"
    }
  ]
}
```

### Income vs Expenses Line Chart
```json
{
  "chartType": "line",
  "datasets": [
    {
      "label": "Income",
      "data": [
        { "x": "2025-04", "y": 1500000.00 },
        { "x": "2025-05", "y": 1500000.00 },
        { "x": "2025-06", "y": 1500000.00 }
      ],
      "borderColor": "#36A2EB",
      "backgroundColor": "rgba(54, 162, 235, 0.1)"
    },
    {
      "label": "Expenses",
      "data": [
        { "x": "2025-04", "y": 1650000.00 },
        { "x": "2025-05", "y": 1780000.00 },
        { "x": "2025-06", "y": 1890000.00 }
      ],
      "borderColor": "#FF6384",
      "backgroundColor": "rgba(255, 99, 132, 0.1)"
    }
  ]
}
```

### Budget Progress Bar Chart
```json
{
  "chartType": "bar",
  "data": [
    {
      "category": "Housing",
      "budgeted": 1000000.00,
      "spent": 850000.00,
      "percentage": 85.0,
      "status": "on_track",
      "color": "#4BC0C0"
    }
  ]
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific field if applicable"
  }
}
```

### Report-Specific Error Codes
- `REPORT_GENERATION_FAILED`: Report generation process failed
- `REPORT_NOT_FOUND`: Requested report does not exist
- `REPORT_EXPIRED`: Report has expired and is no longer available
- `INSUFFICIENT_DATA`: Not enough data for the requested period
- `INVALID_DATE_RANGE`: Date range is invalid or too large
- `EXPORT_FORMAT_UNSUPPORTED`: Requested export format not supported
- `DASHBOARD_DATA_UNAVAILABLE`: Dashboard data temporarily unavailable

## File Generation Specifications

### PDF Report Structure
1. **Cover Page**: Report title, date range, generation date
2. **Executive Summary**: Key metrics and highlights
3. **Financial Overview**: Income, expenses, balance summary
4. **Detailed Analysis**: Category breakdowns with charts
5. **Budget Performance**: Budget vs actual with variance analysis
6. **Goals Progress**: Savings goals status and projections
7. **Recommendations**: Actionable insights and suggestions
8. **Appendix**: Detailed transaction listings (optional)

### CSV Export Structure
- **Headers**: Date, Description, Category, Type, Amount, Balance, Notes
- **Sorting**: Chronological order (newest first)
- **Formatting**: 
  - Dates: YYYY-MM-DD format
  - Amounts: Decimal format with 2 decimal places
  - Negative amounts for expenses

### Excel Export Features
- **Multiple Sheets**: Overview, Transactions, Budgets, Goals
- **Formatting**: Colors for income (green) and expenses (red)
- **Charts**: Embedded charts for visual analysis
- **Formulas**: Automatic calculations and summaries

## Security and Performance

### Rate Limiting
- Dashboard data: 60 requests per minute
- Report generation: 5 requests per hour
- File downloads: 100 requests per hour
- Export operations: 10 requests per hour

### File Storage
- Reports stored securely on server
- Automatic cleanup after 30 days
- Maximum file size: 50MB per report
- Virus scanning for all generated files

### Data Privacy
- Reports contain sensitive financial data
- Access restricted to report owner only
- Secure file transmission with HTTPS
- Audit logs for all report access

## Frontend Integration

### Service Implementation
```javascript
// Dashboard Service
export class DashboardService {
    async getDashboardOverview(params = {}) {
        const response = await api.get('/dashboard/overview', { params });
        return response.data;
    }

    async getWidgetData(widgets, period = 'this-month') {
        const response = await api.get('/dashboard/widgets', {
            params: { widgets: widgets.join(','), period }
        });
        return response.data;
    }
}

// Report Service
export class ReportService {
    async generateReport(reportData) {
        const response = await api.post('/reports/generate', reportData);
        return response.data;
    }

    async downloadReport(reportId, format = null) {
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
    }

    async exportCSV(params = {}) {
        const response = await api.get('/reports/export/csv', {
            params,
            responseType: 'blob'
        });
        return this.handleFileDownload(response.data, 'financial-data.csv');
    }

    async exportPDF(params = {}) {
        const response = await api.get('/reports/export/pdf', {
            params,
            responseType: 'blob'
        });
        return this.handleFileDownload(response.data, 'financial-report.pdf');
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
}
```

### Chart Integration
Use Chart.js or similar library for dashboard charts:

```javascript
// Example chart configuration for expense breakdown
const expenseChartConfig = {
    type: 'pie',
    data: {
        labels: data.map(item => item.category),
        datasets: [{
            data: data.map(item => item.amount),
            backgroundColor: data.map(item => item.color)
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'right'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${formatCurrency(context.parsed)} (${context.parsed}%)`;
                    }
                }
            }
        }
    }
};
```

This comprehensive documentation covers all the reporting and dashboard requirements, including real-time dashboard data, financial analytics, report generation, and export capabilities in both CSV and PDF formats.

 Dashboard API Documentation

## Overview
This document outlines the Dashboard API endpoints required for the Money Manager application's main dashboard functionality. The Dashboard API provides real-time financial overview, key metrics, charts data, and summary information for the authenticated user.

## Base Configuration
- **Base URL**: `http://localhost:8080/api/dashboard`
- **Authentication**: JWT Bearer tokens
- **Token Storage**: **HttpOnly cookies ONLY** (no localStorage)
- **Cookies**: HttpOnly cookies with automatic management
- **CORS**: `withCredentials: true` required for cookie handling

## Dashboard API Endpoints

### Core Dashboard Endpoints

#### GET /dashboard/overview
Get comprehensive dashboard overview with all key financial metrics and summary data.

**Query Parameters:**
- `period`: Time period (current-month, last-month, current-year, custom)
- `startDate`: Start date for custom period (YYYY-MM-DD)
- `endDate`: End date for custom period (YYYY-MM-DD)
- `includeComparisons`: Include period-over-period comparisons (default: true)
- `includeTrends`: Include trend analysis (default: true)

**Response:**
```json
{
  "period": "current-month",
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "keyMetrics": {
    "currentBalance": {
      "amount": 12750850.00,
      "currency": "TZS",
      "changeFromLastMonth": {
        "amount": 965420.00,
        "percentage": 8.2,
        "direction": "up"
      }
    },
    "monthlyIncome": {
      "amount": 5240000.00,
      "currency": "TZS",
      "changeFromLastMonth": {
        "amount": 157540.00,
        "percentage": 3.1,
        "direction": "up"
      }
    },
    "monthlyExpenses": {
      "amount": 2184320.00,
      "currency": "TZS",
      "changeFromLastMonth": {
        "amount": 243230.00,
        "percentage": 12.5,
        "direction": "up"
      }
    },
    "totalSavings": {
      "amount": 28350000.00,
      "currency": "TZS",
      "changeFromLastMonth": {
        "amount": 1168500.00,
        "percentage": 4.3,
        "direction": "up"
      }
    }
  },
  "financialHealth": {
    "savingsRate": 58.33,
    "expenseRatio": 41.67,
    "netCashFlow": 3055680.00,
    "budgetUtilization": 87.37,
    "debtToIncomeRatio": 0.0
  },
  "alerts": [
    {
      "type": "budget_exceeded",
      "severity": "warning",
      "message": "Entertainment budget exceeded by Tsh 120,000",
      "category": "Entertainment",
      "amount": 120000.00
    },
    {
      "type": "expense_increase",
      "severity": "info",
      "message": "Monthly expenses increased by 12.5%",
      "category": "Overall",
      "percentage": 12.5
    }
  ],
  "trends": {
    "incomeGrowth": "positive",
    "expenseGrowth": "concerning",
    "savingsGrowth": "positive",
    "balanceGrowth": "positive"
  }
}
```

#### GET /dashboard/expense-categories
Get expense breakdown by category for pie chart visualization.

**Query Parameters:**
- `period`: Time period (current-month, last-month, current-year, custom)
- `startDate`: Start date for custom period
- `endDate`: End date for custom period
- `includeSubcategories`: Include subcategory breakdown (default: false)
- `minPercentage`: Minimum percentage to show separately (default: 1.0)

**Response:**
```json
{
  "period": "current-month",
  "totalExpenses": 2184320.00,
  "categories": [
    {
      "category": "Housing",
      "amount": 830000.00,
      "percentage": 38.0,
      "color": "#FF6B35",
      "icon": "fas fa-home",
      "subcategories": [
        {
          "name": "Rent",
          "amount": 650000.00,
          "percentage": 78.31
        },
        {
          "name": "Utilities",
          "amount": 180000.00,
          "percentage": 21.69
        }
      ]
    },
    {
      "category": "Food & Dining",
      "amount": 524237.00,
      "percentage": 24.0,
      "color": "#4ECDC4",
      "icon": "fas fa-utensils",
      "subcategories": [
        {
          "name": "Groceries",
          "amount": 367366.00,
          "percentage": 70.08
        },
        {
          "name": "Restaurants",
          "amount": 156871.00,
          "percentage": 29.92
        }
      ]
    },
    {
      "category": "Transportation",
      "amount": 393178.00,
      "percentage": 18.0,
      "color": "#1A365D",
      "icon": "fas fa-car",
      "subcategories": [
        {
          "name": "Fuel",
          "amount": 235307.00,
          "percentage": 59.84
        },
        {
          "name": "Public Transport",
          "amount": 157871.00,
          "percentage": 40.16
        }
      ]
    },
    {
      "category": "Others",
      "amount": 436905.00,
      "percentage": 20.0,
      "color": "#68D391",
      "icon": "fas fa-ellipsis-h",
      "subcategories": [
        {
          "name": "Entertainment",
          "amount": 320000.00,
          "percentage": 73.23
        },
        {
          "name": "Shopping",
          "amount": 116905.00,
          "percentage": 26.77
        }
      ]
    }
  ],
  "insights": {
    "largestCategory": "Housing",
    "fastestGrowingCategory": "Transportation",
    "optimalAllocation": {
      "housing": 30.0,
      "food": 20.0,
      "transportation": 15.0,
      "others": 35.0
    },
    "recommendations": [
      "Housing expenses are slightly above optimal range (30%)",
      "Consider reducing restaurant spending to optimize food budget",
      "Transportation costs are well within recommended limits"
    ]
  }
}
```

#### GET /dashboard/cash-flow
Get monthly cash flow data for chart visualization (income vs expenses over time).

**Query Parameters:**
- `months`: Number of months to include (default: 6, max: 24)
- `endDate`: End date for the period (default: current date)
- `includeProjections`: Include future projections (default: false)

**Response:**
```json
{
  "period": "last-6-months",
  "dateRange": {
    "startDate": "2025-01-01",
    "endDate": "2025-06-30"
  },
  "monthlyData": [
    {
      "month": "2025-01",
      "monthName": "January",
      "income": 5000000.00,
      "expenses": 1800000.00,
      "netFlow": 3200000.00,
      "savingsRate": 64.0,
      "incomeBreakdown": [
        {
          "source": "Salary",
          "amount": 4500000.00,
          "percentage": 90.0
        },
        {
          "source": "Freelance",
          "amount": 500000.00,
          "percentage": 10.0
        }
      ]
    },
    {
      "month": "2025-02",
      "monthName": "February",
      "income": 5100000.00,
      "expenses": 2200000.00,
      "netFlow": 2900000.00,
      "savingsRate": 56.86,
      "incomeBreakdown": [
        {
          "source": "Salary",
          "amount": 4500000.00,
          "percentage": 88.24
        },
        {
          "source": "Bonus",
          "amount": 600000.00,
          "percentage": 11.76
        }
      ]
    },
    {
      "month": "2025-03",
      "monthName": "March",
      "income": 4900000.00,
      "expenses": 1950000.00,
      "netFlow": 2950000.00,
      "savingsRate": 60.20,
      "incomeBreakdown": [
        {
          "source": "Salary",
          "amount": 4500000.00,
          "percentage": 91.84
        },
        {
          "source": "Investment",
          "amount": 400000.00,
          "percentage": 8.16
        }
      ]
    },
    {
      "month": "2025-04",
      "monthName": "April",
      "income": 5300000.00,
      "expenses": 2100000.00,
      "netFlow": 3200000.00,
      "savingsRate": 60.38,
      "incomeBreakdown": [
        {
          "source": "Salary",
          "amount": 4500000.00,
          "percentage": 84.91
        },
        {
          "source": "Freelance",
          "amount": 800000.00,
          "percentage": 15.09
        }
      ]
    },
    {
      "month": "2025-05",
      "monthName": "May",
      "income": 4800000.00,
      "expenses": 1850000.00,
      "netFlow": 2950000.00,
      "savingsRate": 61.46,
      "incomeBreakdown": [
        {
          "source": "Salary",
          "amount": 4500000.00,
          "percentage": 93.75
        },
        {
          "source": "Other",
          "amount": 300000.00,
          "percentage": 6.25
        }
      ]
    },
    {
      "month": "2025-06",
      "monthName": "June",
      "income": 5240000.00,
      "expenses": 2184320.00,
      "netFlow": 3055680.00,
      "savingsRate": 58.33,
      "incomeBreakdown": [
        {
          "source": "Salary",
          "amount": 4500000.00,
          "percentage": 85.88
        },
        {
          "source": "Bonus",
          "amount": 740000.00,
          "percentage": 14.12
        }
      ]
    }
  ],
  "trends": {
    "averageMonthlyIncome": 5055000.00,
    "averageMonthlyExpenses": 2014220.00,
    "averageNetFlow": 3040780.00,
    "incomeVolatility": "low",
    "expenseVolatility": "medium",
    "trendDirection": {
      "income": "stable",
      "expenses": "increasing",
      "netFlow": "stable"
    }
  },
  "projections": {
    "nextMonth": {
      "projectedIncome": 5200000.00,
      "projectedExpenses": 2300000.00,
      "projectedNetFlow": 2900000.00,
      "confidence": 85
    }
  }
}
```

#### GET /dashboard/budget-progress
Get budget progress data for all active budgets with utilization metrics.

**Query Parameters:**
- `period`: Time period (current-month, current-year, custom)
- `includeOverBudget`: Include over-budget categories (default: true)
- `sortBy`: Sort budgets by (usage, remaining, name, amount)
- `sortOrder`: Sort direction (asc, desc)

**Response:**
```json
{
  "period": "current-month",
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "summary": {
    "totalBudgeted": 2500000.00,
    "totalSpent": 2184320.00,
    "totalRemaining": 315680.00,
    "overallUtilization": 87.37,
    "budgetsOnTrack": 4,
    "budgetsOverBudget": 1,
    "budgetsUnderutilized": 0
  },
  "budgets": [
    {
      "id": 1,
      "category": "Housing",
      "budgeted": 1000000.00,
      "spent": 850000.00,
      "remaining": 150000.00,
      "utilization": 85.0,
      "status": "on_track",
      "color": "#3B82F6",
      "icon": "fas fa-home",
      "daysRemaining": 19,
      "projectedTotal": 900000.00,
      "isOverBudget": false,
      "progressBarWidth": 85
    },
    {
      "id": 2,
      "category": "Food & Dining",
      "budgeted": 500000.00,
      "spent": 420000.00,
      "remaining": 80000.00,
      "utilization": 84.0,
      "status": "on_track",
      "color": "#4ECDC4",
      "icon": "fas fa-utensils",
      "daysRemaining": 19,
      "projectedTotal": 460000.00,
      "isOverBudget": false,
      "progressBarWidth": 84
    },
    {
      "id": 3,
      "category": "Transportation",
      "budgeted": 300000.00,
      "spent": 120000.00,
      "remaining": 180000.00,
      "utilization": 40.0,
      "status": "under_utilized",
      "color": "#1A365D",
      "icon": "fas fa-car",
      "daysRemaining": 19,
      "projectedTotal": 200000.00,
      "isOverBudget": false,
      "progressBarWidth": 40
    },
    {
      "id": 4,
      "category": "Entertainment",
      "budgeted": 200000.00,
      "spent": 320000.00,
      "remaining": -120000.00,
      "utilization": 160.0,
      "status": "over_budget",
      "color": "#FF6B35",
      "icon": "fas fa-film",
      "daysRemaining": 19,
      "projectedTotal": 350000.00,
      "isOverBudget": true,
      "progressBarWidth": 100,
      "overBudgetAmount": 120000.00,
      "overBudgetPercentage": 60.0
    },
    {
      "id": 5,
      "category": "Shopping",
      "budgeted": 300000.00,
      "spent": 180000.00,
      "remaining": 120000.00,
      "utilization": 60.0,
      "status": "on_track",
      "color": "#10B981",
      "icon": "fas fa-shopping-bag",
      "daysRemaining": 19,
      "projectedTotal": 240000.00,
      "isOverBudget": false,
      "progressBarWidth": 60
    }
  ],
  "alerts": [
    {
      "budgetId": 4,
      "category": "Entertainment",
      "type": "over_budget",
      "severity": "warning",
      "message": "You are over this budget by Tsh 120,000",
      "amount": 120000.00,
      "percentage": 60.0
    }
  ],
  "recommendations": [
    "Entertainment spending needs immediate attention - 60% over budget",
    "Transportation budget is underutilized - consider reallocating funds",
    "Housing and Food budgets are well-managed within target ranges"
  ]
}
```

#### GET /dashboard/recent-transactions
Get recent transactions for the dashboard transaction list.

**Query Parameters:**
- `limit`: Number of transactions to return (default: 5, max: 20)
- `includeCategories`: Comma-separated list of categories to include
- `excludeCategories`: Comma-separated list of categories to exclude
- `minAmount`: Minimum transaction amount
- `maxAmount`: Maximum transaction amount

**Response:**
```json
{
  "transactions": [
    {
      "id": 1001,
      "description": "Grocery Shopping",
      "amount": -84320.00,
      "type": "expense",
      "category": "Food & Dining",
      "subcategory": "Groceries",
      "date": "2025-06-11T14:34:00Z",
      "icon": "fas fa-shopping-cart",
      "iconColor": "#EF4444",
      "iconBgColor": "#FEE2E2",
      "merchantName": "SuperMart",
      "paymentMethod": "Debit Card"
    },
    {
      "id": 1002,
      "description": "Salary Deposit",
      "amount": 2850000.00,
      "type": "income",
      "category": "Income",
      "subcategory": "Salary",
      "date": "2025-06-10T09:00:00Z",
      "icon": "fas fa-building",
      "iconColor": "#10B981",
      "iconBgColor": "#D1FAE5",
      "merchantName": "TechCorp Ltd",
      "paymentMethod": "Bank Transfer"
    },
    {
      "id": 1003,
      "description": "Restaurant",
      "amount": -52750.00,
      "type": "expense",
      "category": "Food & Dining",
      "subcategory": "Restaurants",
      "date": "2025-06-09T19:45:00Z",
      "icon": "fas fa-utensils",
      "iconColor": "#FF6B35",
      "iconBgColor": "#FED7CC",
      "merchantName": "Bella Vista Restaurant",
      "paymentMethod": "Credit Card"
    },
    {
      "id": 1004,
      "description": "Clothing Store",
      "amount": -128500.00,
      "type": "expense",
      "category": "Shopping",
      "subcategory": "Clothing",
      "date": "2025-06-08T16:22:00Z",
      "icon": "fas fa-tshirt",
      "iconColor": "#4ECDC4",
      "iconBgColor": "#E0F7F7",
      "merchantName": "Fashion Hub",
      "paymentMethod": "Debit Card"
    },
    {
      "id": 1005,
      "description": "Rent Payment",
      "amount": -850000.00,
      "type": "expense",
      "category": "Housing",
      "subcategory": "Rent",
      "date": "2025-06-01T08:00:00Z",
      "icon": "fas fa-home",
      "iconColor": "#8B5CF6",
      "iconBgColor": "#EDE9FE",
      "merchantName": "Landlord",
      "paymentMethod": "Bank Transfer"
    }
  ],
  "summary": {
    "totalShown": 5,
    "totalIncome": 2850000.00,
    "totalExpenses": -1115570.00,
    "netAmount": 1734430.00,
    "dateRange": {
      "startDate": "2025-06-01T08:00:00Z",
      "endDate": "2025-06-11T14:34:00Z"
    }
  },
  "moreAvailable": true,
  "nextTransactionDate": "2025-05-31T20:15:00Z"
}
```

#### GET /dashboard/financial-summary
Get condensed financial summary for quick dashboard widgets.

**Query Parameters:**
- `period`: Time period (current-month, current-year)
- `currency`: Currency code (default: TZS)

**Response:**
```json
{
  "period": "current-month",
  "currency": "TZS",
  "summary": {
    "totalIncome": 5240000.00,
    "totalExpenses": 2184320.00,
    "netIncome": 3055680.00,
    "savingsRate": 58.33,
    "budgetUtilization": 87.37,
    "accountBalance": 12750850.00
  },
  "quickStats": {
    "largestExpenseCategory": {
      "category": "Housing",
      "amount": 850000.00,
      "percentage": 38.9
    },
    "largestTransaction": {
      "description": "Salary Deposit",
      "amount": 2850000.00,
      "type": "income",
      "date": "2025-06-10"
    },
    "budgetHealth": {
      "onTrack": 4,
      "overBudget": 1,
      "totalBudgets": 5
    },
    "savingsGoals": {
      "totalGoals": 3,
      "onTrack": 2,
      "totalTargetAmount": 45000000.00,
      "totalSavedAmount": 28350000.00,
      "overallProgress": 63.0
    }
  },
  "comparisons": {
    "incomeVsLastMonth": {
      "change": 157540.00,
      "percentage": 3.1,
      "direction": "up"
    },
    "expensesVsLastMonth": {
      "change": 243230.00,
      "percentage": 12.5,
      "direction": "up"
    },
    "savingsVsLastMonth": {
      "change": 1168500.00,
      "percentage": 4.3,
      "direction": "up"
    }
  }
}
```

#### POST /dashboard/export
Export dashboard data in various formats.

**Request Body:**
```json
{
  "exportType": "overview",
  "format": "pdf",
  "period": "current-month",
  "includeCharts": true,
  "sections": [
    "key_metrics",
    "expense_categories",
    "cash_flow",
    "budget_progress",
    "recent_transactions"
  ],
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  }
}
```

**Response:**
- **Content-Type**: `application/pdf` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="dashboard-overview-june-2025.pdf"`
- **Body**: Binary file content

### Dashboard Widget Endpoints

#### GET /dashboard/widgets/balance-card
Get current balance widget data with trend information.

**Response:**
```json
{
  "currentBalance": 12750850.00,
  "currency": "TZS",
  "trend": {
    "changeAmount": 965420.00,
    "changePercentage": 8.2,
    "direction": "up",
    "comparisonPeriod": "last_month"
  },
  "icon": "fas fa-wallet",
  "color": "#3B82F6",
  "lastUpdated": "2025-06-11T15:30:00Z"
}
```

#### GET /dashboard/widgets/income-card
Get monthly income widget data.

**Response:**
```json
{
  "monthlyIncome": 5240000.00,
  "currency": "TZS",
  "trend": {
    "changeAmount": 157540.00,
    "changePercentage": 3.1,
    "direction": "up",
    "comparisonPeriod": "last_month"
  },
  "icon": "fas fa-arrow-down",
  "color": "#10B981",
  "lastUpdated": "2025-06-11T15:30:00Z"
}
```

#### GET /dashboard/widgets/expenses-card
Get monthly expenses widget data.

**Response:**
```json
{
  "monthlyExpenses": 2184320.00,
  "currency": "TZS",
  "trend": {
    "changeAmount": 243230.00,
    "changePercentage": 12.5,
    "direction": "up",
    "comparisonPeriod": "last_month"
  },
  "icon": "fas fa-arrow-up",
  "color": "#FF6B35",
  "lastUpdated": "2025-06-11T15:30:00Z"
}
```

#### GET /dashboard/widgets/savings-card
Get total savings widget data.

**Response:**
```json
{
  "totalSavings": 28350000.00,
  "currency": "TZS",
  "trend": {
    "changeAmount": 1168500.00,
    "changePercentage": 4.3,
    "direction": "up",
    "comparisonPeriod": "last_month"
  },
  "icon": "fas fa-piggy-bank",
  "color": "#8B5CF6",
  "lastUpdated": "2025-06-11T15:30:00Z"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific field if applicable",
    "validationErrors": []
  }
}
```

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (token expired/invalid)
- `403`: Forbidden (insufficient permissions)
- `404`: Data not found
- `422`: Unprocessable Entity (validation errors)
- `500`: Internal Server Error

### Specific Error Codes
- `INVALID_DATE_RANGE`: Date range is invalid or too large
- `INSUFFICIENT_DATA`: Not enough data for the requested period
- `INVALID_PERIOD`: Invalid time period specified
- `DATA_NOT_AVAILABLE`: Requested data is not available for the user

## Frontend Integration Requirements

### Service Class Implementation
Add to your existing `services.js`:

```javascript
// Dashboard Service
export class DashboardService {
    // Core dashboard data
    async getOverview(params = {}) {
        const response = await api.get('/dashboard/overview', { params });
        return response.data;
    }

    async getExpenseCategories(params = {}) {
        const response = await api.get('/dashboard/expense-categories', { params });
        return response.data;
    }

    async getCashFlow(params = {}) {
        const response = await api.get('/dashboard/cash-flow', { params });
        return response.data;
    }

    async getBudgetProgress(params = {}) {
        const response = await api.get('/dashboard/budget-progress', { params });
        return response.data;
    }

    async getRecentTransactions(params = {}) {
        const response = await api.get('/dashboard/recent-transactions', { params });
        return response.data;
    }

    async getFinancialSummary(params = {}) {
        const response = await api.get('/dashboard/financial-summary', { params });
        return response.data;
    }

    // Widget endpoints
    async getBalanceCard() {
        const response = await api.get('/dashboard/widgets/balance-card');
        return response.data;
    }

    async getIncomeCard() {
        const response = await api.get('/dashboard/widgets/income-card');
        return response.data;
    }

    async getExpensesCard() {
        const response = await api.get('/dashboard/widgets/expenses-card');
        return response.data;
    }

    async getSavingsCard() {
        const response = await api.get('/dashboard/widgets/savings-card');
        return response.data;
    }

    // Export functionality
    async exportDashboard(exportData) {
        const response = await api.post('/dashboard/export', exportData, {
            responseType: 'blob'
        });
        return response.data;
    }

    // Helper methods for dashboard periods
    getCurrentMonthParams() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return {
            period: 'current-month',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    getLastMonthParams() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        
        return {
            period: 'last-month',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    getCurrentYearParams() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), 0, 1);
        const endDate = new Date(now.getFullYear(), 11, 31);
        
        return {
            period: 'current-year',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }
}
```

### Endpoint Constants
Add to your `endpoints.js`:

```javascript
export const DASHBOARD_ENDPOINTS = {
    // Core dashboard
    OVERVIEW: '/dashboard/overview',
    EXPENSE_CATEGORIES: '/dashboard/expense-categories',
    CASH_FLOW: '/dashboard/cash-flow',
    BUDGET_PROGRESS: '/dashboard/budget-progress',
    RECENT_TRANSACTIONS: '/dashboard/recent-transactions',
    FINANCIAL_SUMMARY: '/dashboard/financial-summary',
    
    // Widgets
    BALANCE_CARD: '/dashboard/widgets/balance-card',
    INCOME_CARD: '/dashboard/widgets/income-card',
       EXPENSES_CARD: '/dashboard/widgets/expenses-card',
    SAVINGS_CARD: '/dashboard/widgets/savings-card',
    
    // Export
    EXPORT: '/dashboard/export'
};
```

This comprehensive Dashboard API documentation provides all the endpoints needed for your Dashboard page, including:

- **Key Metrics Cards**: Current balance, income, expenses, savings with trend data
- **Expense Categories**: Pie chart data with percentages and colors
- **Cash Flow Chart**: Monthly income vs expenses with trend analysis
- **Budget Progress**: All budget utilization with progress bars
- **Recent Transactions**: Latest transaction list with icons and formatting
- **Widget APIs**: Individual endpoints for dashboard cards
- **Export Functionality**: PDF/Excel export of dashboard data