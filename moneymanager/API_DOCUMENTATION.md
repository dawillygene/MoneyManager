# Money Manager API - Complete Implementation Documentation

## Overview
This document provides comprehensive documentation for the Money Manager API backend implementation with JWT token authentication, refresh token functionality, and complete CRUD operations for budgets, transactions, goals, and reporting.

## Features Implemented

### ✅ Authentication System
- JWT Access Token (15 minutes expiration)
- Refresh Token (7 days expiration)
- HttpOnly Cookie Support
- Automatic Token Refresh
- Secure Token Storage
- User Registration & Login
- Token Verification & Logout

### ✅ Core Functionality
- Budget Management (CRUD)
- Transaction Management (CRUD)
- Goal Tracking (CRUD)
- User Profile Management
- Financial Reporting (Monthly, Yearly, Custom)
- Data Export Functionality

### ✅ Security Features
- Password Encryption
- CORS Configuration
- User Authorization
- Protected Endpoints
- Refresh Token Validation

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "userpassword",
  "confirmPassword": "userpassword"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/login
Authenticate user and get tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/logout
Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:** None required

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Headers Set:**
```
Set-Cookie: accessToken=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax
Set-Cookie: refreshToken=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax
```

**Error Responses:**

*401 Unauthorized - Missing or Invalid Token:*
```json
{
  "error": true,
  "message": "Logout failed",
  "code": "LOGOUT_FAILED"
}
```

**Frontend Usage Example:**
```javascript
// Logout user
const logout = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Important for cookie clearing
    });

    if (response.ok) {
      // Clear local storage/state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login page
      window.location.href = '/login';
    } else {
      console.error('Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

**What the endpoint does:**
1. Validates the provided access token
2. Extracts user email from JWT claims
3. Invalidates refresh token in database (sets to null)
4. Clears HTTP-only cookies by setting Max-Age=0
5. Returns success response

**Security Features:**
- Requires valid access token for logout
- Completely removes refresh token from database
- Clears both access and refresh token cookies
- Prevents token reuse after logout

#### GET /api/auth/verify
Verify token validity.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Budget Endpoints

#### GET /api/budgets
Get all budgets for the authenticated user with optional filtering and pagination.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Items per page
- `sortBy` (string, default: "createdAt") - Sort field (name, amount, createdAt, startDate, endDate)
- `sortOrder` (string, default: "asc") - Sort direction (asc, desc)
- `category` (string, optional) - Filter by category
- `status` (string, optional) - Filter by status (active, expired, upcoming)
- `recurring` (string, optional) - Filter by recurring type (none, daily, weekly, monthly, yearly)
- `search` (string, optional) - Search in budget names and descriptions

**Example Request:**
```
GET /api/budgets?page=1&limit=20&sortBy=startDate&sortOrder=desc&status=active
```

**Response (200 OK):**
```json
{
  "budgets": [
    {
      "id": 1,
      "name": "Housing Budget",
      "description": "Rent, utilities, maintenance",
      "amount": 1000000.00,
      "spent": 850000.00,
      "remaining": 150000.00,
      "category": "Housing",
      "categoryIcon": "fas fa-home",
      "categoryColor": "#8B5CF6",
      "startDate": "2025-06-01",
      "endDate": "2025-06-30",
      "recurring": "monthly",
      "alertLevel": 80,
      "alertTriggered": true,
      "status": "active",
      "progress": 85.0,
      "daysRemaining": 18,
      "averageDailySpend": 47222.22,
      "projectedTotal": 850000.00,
      "isOverBudget": false,
      "tags": ["housing", "essential", "monthly"],
      "createdAt": "2025-05-15T10:30:00Z",
      "updatedAt": "2025-06-10T14:20:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "summary": {
    "totalBudgets": 25,
    "activeBudgets": 18,
    "totalBudgetAmount": 2500000.00,
    "totalSpent": 1490000.00,
    "totalRemaining": 1010000.00,
    "overBudgetCount": 2,
    "alertTriggeredCount": 8
  }
}
```

#### POST /api/budgets
Create a new budget.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "name": "Entertainment Budget",
  "description": "Movies, events, subscriptions",
  "amount": 200000.00,
  "category": "Entertainment",
  "categoryIcon": "fas fa-film",
  "categoryColor": "#3B82F6",
  "startDate": "2025-06-01",
  "endDate": "2025-06-30",
  "recurring": "monthly",
  "alertLevel": 80,
  "tags": ["leisure", "fun", "monthly"]
}
```

**Validation Rules:**
- `name`: Required, 3-100 characters, unique per user
- `amount`: Required, positive number, max 999,999,999.99
- `category`: Required, valid category from predefined list
- `startDate`: Required, valid date format (YYYY-MM-DD)
- `endDate`: Required, must be after startDate
- `alertLevel`: Optional, 1-100 (default: 80)
- `recurring`: Optional, one of: none, daily, weekly, monthly, yearly

**Response (201 Created):**
```json
{
  "id": 26,
  "name": "Entertainment Budget",
  "description": "Movies, events, subscriptions",
  "amount": 200000.00,
  "spent": 0.00,
  "remaining": 200000.00,
  "category": "Entertainment",
  "categoryIcon": "fas fa-film",
  "categoryColor": "#3B82F6",
  "startDate": "2025-06-01",
  "endDate": "2025-06-30",
  "recurring": "monthly",
  "alertLevel": 80,
  "alertTriggered": false,
  "status": "active",
  "progress": 0.0,
  "daysRemaining": 18,
  "averageDailySpend": 0.00,
  "projectedTotal": 0.00,
  "isOverBudget": false,
  "tags": ["leisure", "fun", "monthly"],
  "createdAt": "2025-06-11T15:30:00Z",
  "updatedAt": "2025-06-11T15:30:00Z"
}
```

#### GET /api/budgets/{id}
Get a specific budget by ID with detailed information and recent transactions.

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameters:**
- `id` (integer) - Budget ID

**Query Parameters:**
- `includeTransactions` (boolean, default: true) - Include recent transactions
- `transactionLimit` (integer, default: 10) - Limit number of transactions

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Housing Budget",
  "description": "Rent, utilities, maintenance",
  "amount": 1000000.00,
  "spent": 850000.00,
  "remaining": 150000.00,
  "category": "Housing",
  "categoryIcon": "fas fa-home",
  "categoryColor": "#8B5CF6",
  "startDate": "2025-06-01",
  "endDate": "2025-06-30",
  "recurring": "monthly",
  "alertLevel": 80,
  "alertTriggered": true,
  "status": "active",
  "progress": 85.0,
  "daysRemaining": 18,
  "averageDailySpend": 47222.22,
  "projectedTotal": 850000.00,
  "isOverBudget": false,
  "tags": ["housing", "essential", "monthly"],
  "createdAt": "2025-05-15T10:30:00Z",
  "updatedAt": "2025-06-10T14:20:00Z",
  "transactions": [
    {
      "id": 101,
      "amount": 650000.00,
      "description": "Monthly rent",
      "date": "2025-06-01",
      "type": "expense",
      "category": "Housing"
    },
    {
      "id": 102,
      "amount": 200000.00,
      "description": "Utilities bill",
      "date": "2025-06-05",
      "type": "expense",
      "category": "Housing"
    }
  ],
  "analytics": {
    "weeklySpending": [
      { "week": "2025-W23", "amount": 650000.00 },
      { "week": "2025-W24", "amount": 200000.00 }
    ],
    "dailyAverage": 47222.22,
    "spendingTrend": "increasing",
    "daysToDepletion": 3.2,
    "recommendedDailyLimit": 8333.33
  }
}
```

#### PUT /api/budgets/{id}
Update a specific budget.

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameters:**
- `id` (integer) - Budget ID

**Request Body:**
```json
{
  "name": "Updated Housing Budget",
  "description": "Rent, utilities, maintenance, insurance",
  "amount": 1200000.00,
  "category": "Housing",
  "categoryIcon": "fas fa-home",
  "categoryColor": "#8B5CF6",
  "startDate": "2025-06-01",
  "endDate": "2025-06-30",
  "recurring": "monthly",
  "alertLevel": 75,
  "tags": ["housing", "essential", "monthly", "updated"]
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Updated Housing Budget",
  "description": "Rent, utilities, maintenance, insurance",
  "amount": 1200000.00,
  "spent": 850000.00,
  "remaining": 350000.00,
  "category": "Housing",
  "categoryIcon": "fas fa-home",
  "categoryColor": "#8B5CF6",
  "startDate": "2025-06-01",
  "endDate": "2025-06-30",
  "recurring": "monthly",
  "alertLevel": 75,
  "alertTriggered": false,
  "status": "active",
  "progress": 70.83,
  "daysRemaining": 18,
  "averageDailySpend": 47222.22,
  "projectedTotal": 850000.00,
  "isOverBudget": false,
  "tags": ["housing", "essential", "monthly", "updated"],
  "createdAt": "2025-05-15T10:30:00Z",
  "updatedAt": "2025-06-11T16:45:00Z"
}
```

#### DELETE /api/budgets/{id}
Delete a specific budget. This will also remove all associated transactions if they are budget-specific.

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameters:**
- `id` (integer) - Budget ID

**Query Parameters:**
- `cascade` (boolean, default: false) - Whether to delete associated transactions

**Response (200 OK):**
```json
{
  "message": "Budget deleted successfully",
  "deletedBudgetId": 1,
  "deletedTransactions": 12,
  "reassignedTransactions": 0
}
```

#### GET /api/budgets/summary
Get budget summary and overview statistics for the authenticated user.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `period` (string, default: "current") - Time period (current, monthly, yearly, custom)
- `startDate` (string, optional) - Start date for custom period (YYYY-MM-DD)
- `endDate` (string, optional) - End date for custom period (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "period": "current",
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "totalBudgets": 6,
  "activeBudgets": 6,
  "totalBudgetAmount": 2500000.00,
  "totalSpent": 1490000.00,
  "totalRemaining": 1010000.00,
  "overBudgetCount": 1,
  "alertTriggeredCount": 3,
  "categoryBreakdown": [
    {
      "category": "Housing",
      "budgeted": 1000000.00,
      "spent": 850000.00,
      "progress": 85.0,
      "status": "warning"
    },
    {
      "category": "Food & Dining",
      "budgeted": 500000.00,
      "spent": 420000.00,
      "progress": 84.0,
      "status": "warning"
    },
    {
      "category": "Transportation",
      "budgeted": 300000.00,
      "spent": 120000.00,
      "progress": 40.0,
      "status": "good"
    },
    {
      "category": "Entertainment",
      "budgeted": 200000.00,
      "spent": 320000.00,
      "progress": 160.0,
      "status": "over"
    }
  ]
}
```

#### GET /api/budgets/categories
Get available budget categories with their default icons and colors.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "categories": [
    {
      "name": "Housing",
      "icon": "fas fa-home",
      "color": "#8B5CF6",
      "description": "Rent, utilities, maintenance"
    },
    {
      "name": "Food & Dining",
      "icon": "fas fa-utensils",
      "color": "#3B82F6",
      "description": "Groceries, restaurants, takeout"
    },
    {
      "name": "Transportation",
      "icon": "fas fa-car",
      "color": "#F59E0B",
      "description": "Fuel, public transit, maintenance"
    },
    {
      "name": "Entertainment",
      "icon": "fas fa-film",
      "color": "#3B82F6",
      "description": "Movies, events, subscriptions"
    },
    {
      "name": "Shopping",
      "icon": "fas fa-shopping-bag",
      "color": "#10B981",
      "description": "Clothes, accessories, gifts"
    },
    {
      "name": "Healthcare",
      "icon": "fas fa-heartbeat",
      "color": "#EF4444",
      "description": "Medicine, doctor visits, insurance"
    },
    {
      "name": "Education",
      "icon": "fas fa-graduation-cap",
      "color": "#6366F1",
      "description": "Courses, books, training"
    },
    {
      "name": "Travel",
      "icon": "fas fa-plane",
      "color": "#8B5CF6",
      "description": "Trips, accommodation, flights"
    },
    {
      "name": "Insurance",
      "icon": "fas fa-shield-alt",
      "color": "#6B7280",
      "description": "Life, health, property insurance"
    },
    {
      "name": "Savings",
      "icon": "fas fa-piggy-bank",
      "color": "#10B981",
      "description": "Emergency fund, investments"
    },
    {
      "name": "Debt Payment",
      "icon": "fas fa-credit-card",
      "color": "#EF4444",
      "description": "Loan payments, credit cards"
    },
    {
      "name": "Personal Care",
      "icon": "fas fa-user",
      "color": "#F59E0B",
      "description": "Haircuts, gym, personal items"
    },
    {
      "name": "Gifts & Donations",
      "icon": "fas fa-gift",
      "color": "#EC4899",
      "description": "Presents, charity, donations"
    },
    {
      "name": "Business",
      "icon": "fas fa-briefcase",
      "color": "#6B7280",
      "description": "Office supplies, networking"
    },
    {
      "name": "Other",
      "icon": "fas fa-ellipsis-h",
      "color": "#9CA3AF",
      "description": "Miscellaneous expenses"
    }
  ]
}
```

#### POST /api/budgets/duplicate/{id}
Duplicate an existing budget with optional modifications.

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameters:**
- `id` (integer) - Source budget ID to duplicate

**Request Body:**
```json
{
  "name": "July Housing Budget",
  "startDate": "2025-07-01",
  "endDate": "2025-07-31",
  "amount": 1100000.00,
  "copyTransactions": false
}
```

**Response (201 Created):**
```json
{
  "id": 27,
  "name": "July Housing Budget",
  "description": "Rent, utilities, maintenance",
  "amount": 1100000.00,
  "spent": 0.00,
  "remaining": 1100000.00,
  "category": "Housing",
  "categoryIcon": "fas fa-home",
  "categoryColor": "#8B5CF6",
  "startDate": "2025-07-01",
  "endDate": "2025-07-31",
  "recurring": "monthly",
  "alertLevel": 80,
  "alertTriggered": false,
  "status": "upcoming",
  "progress": 0.0,
  "daysRemaining": 49,
  "averageDailySpend": 0.00,
  "projectedTotal": 0.00,
  "isOverBudget": false,
  "tags": ["housing", "essential", "monthly"],
  "sourceBudgetId": 1,
  "createdAt": "2025-06-11T17:00:00Z",
  "updatedAt": "2025-06-11T17:00:00Z"
}
```

#### GET /api/budgets/alerts
Get budget alerts for budgets that have exceeded their alert threshold.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `severity` (string, optional) - Filter by severity (warning, critical, over)
- `category` (string, optional) - Filter by category

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "budgetId": 1,
      "budgetName": "Housing Budget",
      "category": "Housing",
      "severity": "warning",
      "message": "You've spent 85% of your housing budget",
      "currentSpent": 850000.00,
      "budgetAmount": 1000000.00,
      "alertLevel": 80,
      "daysRemaining": 18,
      "projectedOverage": 0.00,
      "createdAt": "2025-06-10T14:20:00Z"
    },
    {
      "budgetId": 4,
      "budgetName": "Entertainment Budget",
      "category": "Entertainment",
      "severity": "critical",
      "message": "You've exceeded your entertainment budget by Tsh 120,000",
      "currentSpent": 320000.00,
      "budgetAmount": 200000.00,
      "alertLevel": 80,
      "daysRemaining": 18,
      "projectedOverage": 120000.00,
      "createdAt": "2025-06-08T09:30:00Z"
    }
  ],
  "summary": {
    "totalAlerts": 2,
    "warningCount": 1,
    "criticalCount": 1,
    "overBudgetCount": 1
  }
}
```

#### POST /api/budgets/batch
Create multiple budgets at once (useful for monthly budget setup).

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "budgets": [
    {
      "name": "July Housing",
      "description": "Rent and utilities",
      "amount": 1000000.00,
      "category": "Housing",
      "startDate": "2025-07-01",
      "endDate": "2025-07-31",
      "recurring": "monthly"
    },
    {
      "name": "July Food",
      "description": "Groceries and dining",
      "amount": 500000.00,
      "category": "Food & Dining",
      "startDate": "2025-07-01",
      "endDate": "2025-07-31",
      "recurring": "monthly"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "created": [
    {
      "id": 28,
      "name": "July Housing",
      "amount": 1000000.00,
      "category": "Housing",
      "status": "created"
    },
    {
      "id": 29,
      "name": "July Food",
      "amount": 500000.00,
      "category": "Food & Dining",
      "status": "created"
    }
  ],
  "failed": [],
  "summary": {
    "totalRequested": 2,
    "successfullyCreated": 2,
    "failed": 0
  }
}
```

#### GET /api/budgets/recurring/generate
Generate upcoming recurring budgets based on existing recurring budget templates.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `months` (integer, default: 1, max: 12) - Number of months to generate ahead
- `dryRun` (boolean, default: false) - Preview without creating

**Response (200 OK):**
```json
{
  "preview": [
    {
      "templateId": 1,
      "templateName": "Housing Budget",
      "suggestedBudgets": [
        {
          "name": "Housing Budget - July 2025",
          "amount": 1000000.00,
          "startDate": "2025-07-01",
          "endDate": "2025-07-31",
          "category": "Housing"
        },
        {
          "name": "Housing Budget - August 2025",
          "amount": 1000000.00,
          "startDate": "2025-08-01",
          "endDate": "2025-08-31",
          "category": "Housing"
        }
      ]
    }
  ],
  "created": [],
  "summary": {
    "templatesFound": 5,
    "budgetsToCreate": 10,
    "estimatedTotalAmount": 12500000.00
  }
}
```

#### PUT /api/budgets/{id}/archive
Archive a budget (soft delete - keeps for historical data but removes from active lists).

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameters:**
- `id` (integer) - Budget ID

**Response (200 OK):**
```json
{
  "message": "Budget archived successfully",
  "budgetId": 1,
  "archivedAt": "2025-06-11T18:00:00Z"
}
```

#### PUT /api/budgets/{id}/restore
Restore an archived budget.

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameters:**
- `id` (integer) - Budget ID

**Response (200 OK):**
```json
{
  "message": "Budget restored successfully",
  "budgetId": 1,
  "restoredAt": "2025-06-11T18:05:00Z"
}
```

### Budget Error Handling

#### Standard Budget Error Response Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {} // Optional additional details
}
```

#### Budget-Specific Error Codes
- `BUDGET_NOT_FOUND`: Budget not found or access denied
- `BUDGET_CREATION_FAILED`: Failed to create budget
- `BUDGET_UPDATE_FAILED`: Failed to update budget
- `BUDGET_DELETION_FAILED`: Failed to delete budget
- `BUDGET_DUPLICATION_FAILED`: Failed to duplicate budget
- `BUDGET_ARCHIVE_FAILED`: Failed to archive budget
- `BUDGET_RESTORE_FAILED`: Failed to restore budget
- `BUDGETS_RETRIEVAL_FAILED`: Failed to retrieve budgets
- `SUMMARY_RETRIEVAL_FAILED`: Failed to retrieve budget summary
- `ALERTS_RETRIEVAL_FAILED`: Failed to retrieve budget alerts
- `CATEGORIES_RETRIEVAL_FAILED`: Failed to retrieve categories
- `BATCH_CREATION_FAILED`: Failed to create budgets in batch
- `RECURRING_GENERATION_FAILED`: Failed to generate recurring budgets
- `VALIDATION_ERROR`: Request validation failed

### Budget Features

#### Automatic Spending Tracking
- **Real-time Updates**: Budget spending is automatically updated when expense transactions are created, updated, or deleted
- **Category Matching**: Transactions are matched to budgets based on category
- **Date Range Filtering**: Only transactions within the budget's date range are included in spending calculations

#### Smart Alerts System
- **Threshold Alerts**: Automatically triggered when spending exceeds the specified alert level (default 80%)
- **Over-Budget Alerts**: Critical alerts when spending exceeds the total budget amount
- **Alert Management**: Alerts are automatically cleared when spending falls below thresholds

#### Advanced Analytics
- **Progress Tracking**: Real-time calculation of spending progress as a percentage
- **Projections**: Estimated total spending based on current daily average
- **Trends**: Analysis of spending patterns (increasing, decreasing, stable)
- **Recommendations**: Daily spending limits to stay within budget

#### Budget Status Management
- **Active**: Budget is currently in effect (current date within start/end range)
- **Upcoming**: Budget starts in the future
- **Expired**: Budget has ended
- **Archived**: Budget has been soft-deleted but kept for historical records

#### Recurring Budget Templates
- **Template System**: Mark budgets as recurring (daily, weekly, monthly, yearly)
- **Auto-Generation**: Create future budgets based on existing templates
- **Bulk Operations**: Generate multiple months of budgets at once

### Frontend Integration Examples

#### Creating a Budget
```javascript
const createBudget = async (budgetData) => {
  try {
    const response = await fetch('http://localhost:8080/api/budgets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(budgetData)
    });

    if (response.ok) {
      const budget = await response.json();
      console.log('Budget created:', budget);
      return budget;
    } else {
      const error = await response.json();
      console.error('Budget creation failed:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
};
```

#### Getting Budget Alerts
```javascript
const getBudgetAlerts = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/budgets/alerts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      const alertsData = await response.json();
      return alertsData;
    } else {
      throw new Error('Failed to fetch budget alerts');
    }
  } catch (error) {
    console.error('Error fetching budget alerts:', error);
    throw error;
  }
};
```

#### Filtering Budgets
```javascript
const getFilteredBudgets = async (filters) => {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== undefined) {
      params.append(key, filters[key]);
    }
  });

  try {
    const response = await fetch(`http://localhost:8080/api/budgets?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      const budgetsData = await response.json();
      return budgetsData;
    } else {
      throw new Error('Failed to fetch budgets');
    }
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};
```

### Database Schema Updates

The budget system requires these additional database columns:

```sql
-- Additional columns for Budget table
ALTER TABLE budgets ADD COLUMN category_icon VARCHAR(100);
ALTER TABLE budgets ADD COLUMN category_color VARCHAR(20);
ALTER TABLE budgets ADD COLUMN spent DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE budgets ADD COLUMN alert_triggered BOOLEAN DEFAULT FALSE;
ALTER TABLE budgets ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE budgets ADD COLUMN archived_at TIMESTAMP NULL;
ALTER TABLE budgets ADD COLUMN restored_at TIMESTAMP NULL;
ALTER TABLE budgets ADD COLUMN source_budget_id BIGINT NULL;
ALTER TABLE budgets ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE budgets ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE budgets ADD COLUMN tags TEXT;
ALTER TABLE budgets MODIFY COLUMN amount DECIMAL(12,2);

-- Add foreign key constraint for source budget
ALTER TABLE budgets ADD CONSTRAINT fk_budget_source 
FOREIGN KEY (source_budget_id) REFERENCES budgets(id) ON DELETE SET NULL;
```

This comprehensive budget management system provides all the functionality needed for effective personal finance management with real-time spending tracking, intelligent alerts, and powerful analytics.