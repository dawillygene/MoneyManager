# Money Manager API Documentation

## Overview
This document outlines the API structure and requirements for the Money Manager frontend application. The API uses JWT tokens for authentication with automatic refresh functionality and **HttpOnly cookie storage for enhanced security**.

## Base Configuration
- **Base URL**: `http://localhost:8080/api`
- **Authentication**: JWT Bearer tokens
- **Token Storage**: **HttpOnly cookies ONLY** (no localStorage)
- **Cookies**: HttpOnly cookies with automatic management
- **CORS**: `withCredentials: true` required for cookie handling

## Authentication Flow

### Token Management
The frontend implements a cookie-only token management system for enhanced security:

1. **Access Token**: Short-lived (15 minutes), stored in HttpOnly cookies + memory cache
2. **Refresh Token**: Long-lived (7 days), stored in HttpOnly cookies + memory cache  
3. **Automatic Refresh**: When access token expires, refresh token is used automatically
4. **Memory Cache**: Tokens are cached in memory for immediate access
5. **Cookie Security**: All tokens stored exclusively in cookies (HttpOnly + SameSite=Lax)

### Authentication Endpoints

#### POST /auth/login
**Request Body:**
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

**Response Cookies:**
- `accessToken`: HttpOnly, SameSite=Lax, max-age=900 (15 minutes)
- `refreshToken`: HttpOnly, SameSite=Lax, max-age=604800 (7 days)

#### POST /auth/register
**Request Body:**
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

**Response Cookies:**
- `accessToken`: HttpOnly, SameSite=Lax, max-age=900 (15 minutes)
- `refreshToken`: HttpOnly, SameSite=Lax, max-age=604800 (7 days)

#### POST /auth/refresh
**Request:** Uses refresh token from HttpOnly cookie automatically
**Alternative Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Optional: new refresh token
}
```

**Response Cookies:**
- `accessToken`: Updated HttpOnly cookie
- `refreshToken`: Updated HttpOnly cookie (if rotated)

#### POST /auth/logout
**Headers:** `Authorization: Bearer <access_token>` OR uses HttpOnly cookie
**Response:** `200 OK`
**Action:** Clears all authentication cookies

#### GET /auth/verify
**Headers:** `Authorization: Bearer <access_token>` OR uses HttpOnly cookie
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

## Protected Endpoints

All endpoints below require authentication. The access token is automatically included from HttpOnly cookies when using `withCredentials: true`.

### User Endpoints

#### GET /user/profile
Get current user profile information.

#### PUT /user/update
Update user profile.
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### DELETE /user/delete
Delete user account.

### Budget Endpoints

#### GET /budgets
Get all budgets for the authenticated user with optional filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (name, amount, createdAt, startDate, endDate)
- `sortOrder`: Sort direction (asc, desc)
- `category`: Filter by category
- `status`: Filter by status (active, expired, upcoming)
- `recurring`: Filter by recurring type (none, daily, weekly, monthly, yearly)
- `search`: Search in budget names and descriptions

**Example Request:**
```
GET /budgets?page=1&limit=20&sortBy=startDate&sortOrder=desc&status=active
```

**Response:**
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
      "createdAt": "2025-05-15T10:30:00Z",
      "updatedAt": "2025-06-10T14:20:00Z",
      "transactions": [
        {
          "id": 101,
          "amount": 650000.00,
          "description": "Monthly rent",
          "date": "2025-06-01",
          "type": "expense"
        },
        {
          "id": 102,
          "amount": 200000.00,
          "description": "Utilities bill",
          "date": "2025-06-05",
          "type": "expense"
        }
      ]
    },
    {
      "id": 2,
      "name": "Food & Dining",
      "description": "Groceries, restaurants, takeout",
      "amount": 500000.00,
      "spent": 420000.00,
      "remaining": 80000.00,
      "category": "Food",
      "categoryIcon": "fas fa-utensils",
      "categoryColor": "#3B82F6",
      "startDate": "2025-06-01",
      "endDate": "2025-06-30",
      "recurring": "monthly",
      "alertLevel": 75,
      "alertTriggered": true,
      "status": "active",
      "progress": 84.0,
      "daysRemaining": 18,
      "averageDailySpend": 23333.33,
      "projectedTotal": 420000.00,
      "isOverBudget": false,
      "createdAt": "2025-05-15T10:30:00Z",
      "updatedAt": "2025-06-09T09:15:00Z",
      "transactions": []
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

#### POST /budgets
Create a new budget.

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

**Response:**
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

#### GET /budgets/{id}
Get a specific budget by ID with detailed information and recent transactions.

**Path Parameters:**
- `id`: Budget ID (integer)

**Query Parameters:**
- `includeTransactions`: Include recent transactions (default: true)
- `transactionLimit`: Limit number of transactions (default: 10)

**Response:**
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
    "weeklyAverage": 330769.23,
    "spendingTrend": "increasing",
    "daysToDepletion": 3.2,
    "recommendedDailyLimit": 8333.33
  }
}
```

#### PUT /budgets/{id}
Update a specific budget.

**Path Parameters:**
- `id`: Budget ID (integer)

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

**Response:**
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

#### DELETE /budgets/{id}
Delete a specific budget. This will also remove all associated transactions if they are budget-specific.

**Path Parameters:**
- `id`: Budget ID (integer)

**Query Parameters:**
- `cascade`: Whether to delete associated transactions (default: false)

**Response:**
```json
{
  "message": "Budget deleted successfully",
  "deletedBudgetId": 1,
  "deletedTransactions": 12,
  "reassignedTransactions": 0
}
```

#### GET /budgets/summary
Get budget summary and overview statistics for the authenticated user.

**Query Parameters:**
- `period`: Time period (current, monthly, yearly, custom)
- `startDate`: Start date for custom period
- `endDate`: End date for custom period

**Response:**
```json
{
  "period": "current",
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "totals": {
    "budgetAmount": 2500000.00,
    "spent": 1490000.00,
    "remaining": 1010000.00,
    "progress": 59.6
  },
  "counts": {
    "totalBudgets": 6,
    "activeBudgets": 6,
    "overBudgetCount": 1,
    "alertTriggeredCount": 3
  },
  "projections": {
    "projectedMonthEnd": 2480000.00,
    "likelyOverBudget": false,
    "daysUntilDepletion": 18,
    "recommendedDailySpend": 56111.11
  },
  "categoryBreakdown": [
    {
      "category": "Housing",
      "budgeted": 1000000.00,
      "spent": 850000.00,
      "progress": 85.0,
      "status": "warning"
    },
    {
      "category": "Food",
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
    },
    {
      "category": "Shopping",
      "budgeted": 300000.00,
      "spent": 180000.00,
      "progress": 60.0,
      "status": "good"
    },
    {
      "category": "Healthcare",
      "budgeted": 200000.00,
      "spent": 50000.00,
      "progress": 25.0,
      "status": "good"
    }
  ]
}
```

#### GET /budgets/categories
Get available budget categories with their default icons and colors.

**Response:**
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

#### POST /budgets/duplicate/{id}
Duplicate an existing budget with optional modifications.

**Path Parameters:**
- `id`: Source budget ID to duplicate

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

**Response:**
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
  "sourcebudgetId": 1,
  "createdAt": "2025-06-11T17:00:00Z",
  "updatedAt": "2025-06-11T17:00:00Z"
}
```

#### GET /budgets/alerts
Get budget alerts for budgets that have exceeded their alert threshold.

**Query Parameters:**
- `severity`: Filter by severity (warning, critical, over)
- `category`: Filter by category

**Response:**
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

#### POST /budgets/batch
Create multiple budgets at once (useful for monthly budget setup).

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

**Response:**
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

#### GET /budgets/recurring/generate
Generate upcoming recurring budgets based on existing recurring budget templates.

**Query Parameters:**
- `months`: Number of months to generate ahead (default: 1, max: 12)
- `dryRun`: Preview without creating (default: false)

**Response:**
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

#### PUT /budgets/{id}/archive
Archive a budget (soft delete - keeps for historical data but removes from active lists).

**Path Parameters:**
- `id`: Budget ID (integer)

**Response:**
```json
{
  "message": "Budget archived successfully",
  "budgetId": 1,
  "archivedAt": "2025-06-11T18:00:00Z"
}
```

#### PUT /budgets/{id}/restore
Restore an archived budget.

**Path Parameters:**
- `id`: Budget ID (integer)

**Response:**
```json
{
  "message": "Budget restored successfully",
  "budgetId": 1,
  "restoredAt": "2025-06-11T18:05:00Z"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {} // Optional additional details
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (token expired/invalid)
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Security Requirements

### CORS Configuration
The backend must allow:
- Origin: `http://localhost:3000` (development)
- Credentials: `true` (REQUIRED for cookies)
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`

### Token Requirements
1. **Access Token Expiration**: 15 minutes
2. **Refresh Token Expiration**: 7 days (recommended)
3. **Token Format**: JWT
4. **Algorithm**: HS256 or RS256

### Cookie Security Settings
**REQUIRED for enhanced security:**
- `HttpOnly`: `true` (prevents JavaScript access)
- `SameSite`: `Lax` (CSRF protection)
- `Secure`: `true` (HTTPS only in production)
- `Path`: `/`
- Max-Age: 900 seconds (access), 604800 seconds (refresh)

## Frontend Implementation Details

### Cookie-Only Authentication
The frontend now uses **cookies exclusively** for token storage:

1. **No localStorage**: All token storage removed from localStorage
2. **HttpOnly Cookies**: Server sets HttpOnly cookies automatically
3. **Memory Cache**: Tokens cached in memory for immediate access
4. **Automatic Management**: Cookies handled automatically by browser
5. **Enhanced Security**: No XSS token theft possible

### Automatic Token Refresh
The frontend automatically handles token refresh when:
1. Access token expires (401 response)
2. Token expiration time is reached
3. Multiple concurrent requests (queuing system implemented)

### Route Protection
- All routes except `/login` and `/register` require authentication
- Automatic redirect to login page for unauthenticated users
- Loading state during authentication verification
- ProtectedRoute component wraps all authenticated pages

### Component Integration
The following components have been updated for cookie-only authentication:

#### LoginForm
- Uses `authService.login()` for authentication
- Stores user info in cookies (not localStorage)
- Automatic redirect to dashboard on success
- Loading states and error handling

#### RegistrationForm
- Uses `authService.register()` for account creation
- Auto-login after successful registration
- Client-side password validation
- User info stored in cookies

#### Sidebar
- Uses `authService.logout()` for secure logout
- Reads user information from cookies
- Automatic token cleanup on logout

#### Token Storage System
- **Cookie utilities**: getCookie, setCookie, deleteCookie
- **Memory caching**: Fast token access
- **Automatic cleanup**: Secure token removal
- **Refresh handling**: Seamless token renewal

### API Service Usage Examples

```javascript
// Authentication with automatic cookie handling
import { authService } from '../api';

// Login - cookies set automatically
const result = await authService.login({
  email: 'user@example.com',
  password: 'password'
});

// All API calls use cookies automatically
import { budgetService } from '../api';

// Create budget - authentication via cookies
const budget = await budgetService.create({
  name: 'Monthly Budget',
  amount: 2000.00,
  category: 'General',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});
```

### Frontend Configuration Requirements

```javascript
// Axios configuration for cookie support
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true, // REQUIRED for cookies
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
```

## Testing Endpoints
Use these endpoints to test the cookie-based authentication flow:
1. Register a new user via `/auth/register` (cookies set automatically)
2. Login with credentials via `/auth/login` (cookies set automatically)
3. Access protected endpoints (cookies sent automatically)
4. Test token refresh (handled automatically)
5. Test logout functionality via `/auth/logout` (cookies cleared)

## File Structure
The API integration is organized with cookie-only authentication:

```
src/
├── api/
│   ├── index.js          # Main exports
│   ├── apiConfig.js      # Axios configuration with withCredentials
│   ├── tokenStorage.js   # Cookie-based token management
│   ├── authService.js    # Authentication methods (cookie-aware)
│   ├── endpoints.js      # API endpoint constants
│   └── services.js       # Service classes for different domains
├── components/
│   ├── ProtectedRoute.jsx    # Route protection component
│   ├── LoginForm.jsx         # Cookie-based user storage
│   ├── RegistrationForm.jsx  # Cookie-based user storage
│   ├── CreateBudgetForm.jsx  # Integrated with budgetService
│   ├── AddTransactionForm.jsx # Integrated with transactionService
│   └── AddGoalForm.jsx       # Integrated with goalService
└── layouts/
    └── Sidebar.jsx       # Cookie-based user info display
```

## Security Benefits

### Cookie-Only Storage Advantages
1. **XSS Protection**: HttpOnly cookies prevent JavaScript access
2. **CSRF Protection**: SameSite=Lax prevents cross-site requests
3. **Automatic Management**: Browser handles cookie security
4. **Secure Transmission**: Cookies sent over HTTPS only (production)
5. **No Local Storage**: Eliminates localStorage security vulnerabilities

### Authentication Flow Security
1. **Server-side validation**: All tokens validated on server
2. **Automatic expiration**: Cookies expire automatically
3. **Secure refresh**: Refresh tokens protected in HttpOnly cookies
4. **Memory caching**: Fast access without compromising security
5. **Automatic cleanup**: Logout clears all authentication data

All components now use cookies exclusively for authentication and user data storage, providing enhanced security compared to localStorage-based approaches.

# Goals API Documentation

## Overview
This document outlines the API structure and requirements for the Goals feature in the Money Manager application. The Goals API allows users to set and track financial goals, providing insights and analytics on their savings progress.

## Base Configuration
- **Base URL**: `http://localhost:8080/api/goals`
- **Authentication**: JWT Bearer tokens
- **Token Storage**: **HttpOnly cookies ONLY** (no localStorage)
- **Cookies**: HttpOnly cookies with automatic management
- **CORS**: `withCredentials: true` required for cookie handling

## Goals API Endpoints

### Goal Endpoints

Goals represent financial savings targets that users want to achieve. Users can create goals, track progress, and add funds to reach their targets.

#### GET /goals
Get all goals for the authenticated user with optional filtering and sorting.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (name, targetAmount, targetDate, progress, createdAt)
- `sortOrder`: Sort direction (asc, desc)
- `status`: Filter by status (active, completed, overdue, upcoming)
- `search`: Search in goal names and descriptions
- `category`: Filter by goal category/type

**Example Request:**
```
GET /goals?page=1&limit=20&sortBy=targetDate&sortOrder=asc&status=active
```

**Response:**
```json
{
  "goals": [
    {
      "id": 1,
      "name": "Summer Vacation",
      "description": "Trip to Europe with family",
      "targetAmount": 2500.00,
      "currentAmount": 1800.00,
      "targetDate": "2025-07-15",
      "icon": "fa-plane-departure",
      "status": "active",
      "progress": 72.0,
      "remainingAmount": 700.00,
      "daysRemaining": 34,
      "dailyTargetAmount": 20.59,
      "weeklyTargetAmount": 144.12,
      "monthlyTargetAmount": 617.65,
      "isOverdue": false,
      "isCompleted": false,
      "projectedCompletionDate": "2025-07-05",
      "onTrack": true,
      "priority": "high",
      "category": "travel",
      "tags": ["vacation", "family", "europe"],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-06-10T14:20:00Z",
      "contributions": [
        {
          "id": 101,
          "amount": 500.00,
          "source": "salary",
          "notes": "Monthly savings",
          "date": "2025-06-01T00:00:00Z",
          "createdAt": "2025-06-01T08:30:00Z"
        },
        {
          "id": 102,
          "amount": 200.00,
          "source": "bonus",
          "notes": "Work bonus",
          "date": "2025-06-05T00:00:00Z",
          "createdAt": "2025-06-05T10:15:00Z"
        }
      ],
      "milestones": [
        {
          "percentage": 25,
          "amount": 625.00,
          "reachedAt": "2025-02-15T00:00:00Z",
          "description": "First quarter milestone"
        },
        {
          "percentage": 50,
          "amount": 1250.00,
          "reachedAt": "2025-04-10T00:00:00Z",
          "description": "Halfway point"
        },
        {
          "percentage": 75,
          "amount": 1875.00,
          "reachedAt": null,
          "description": "Three quarters milestone"
        }
      ]
    },
    {
      "id": 2,
      "name": "Emergency Fund",
      "description": "6 months of expenses for security",
      "targetAmount": 12000.00,
      "currentAmount": 8500.00,
      "targetDate": "2025-12-31",
      "icon": "fa-shield-alt",
      "status": "active",
      "progress": 70.83,
      "remainingAmount": 3500.00,
      "daysRemaining": 203,
      "dailyTargetAmount": 17.24,
      "weeklyTargetAmount": 120.69,
      "monthlyTargetAmount": 517.24,
      "isOverdue": false,
      "isCompleted": false,
      "projectedCompletionDate": "2025-11-15",
      "onTrack": true,
      "priority": "high",
      "category": "emergency",
      "tags": ["emergency", "security", "savings"],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-06-08T09:45:00Z",
      "contributions": [],
      "milestones": [
        {
          "percentage": 25,
          "amount": 3000.00,
          "reachedAt": "2025-02-28T00:00:00Z",
          "description": "First quarter saved"
        },
        {
          "percentage": 50,
          "amount": 6000.00,
          "reachedAt": "2025-04-30T00:00:00Z",
          "description": "Halfway to security"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 8,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "summary": {
    "totalGoals": 8,
    "activeGoals": 6,
    "completedGoals": 1,
    "overdueGoals": 1,
    "totalTargetAmount": 45000.00,
    "totalCurrentAmount": 28500.00,
    "totalRemainingAmount": 16500.00,
    "overallProgress": 63.33,
    "averageProgress": 58.75,
    "goalsOnTrack": 5,
    "goalsOffTrack": 1,
    "upcomingMilestones": 3
  }
}
```

#### POST /goals
Create a new financial goal.

**Request Body:**
```json
{
  "name": "New Car",
  "description": "Save for a reliable family car",
  "targetAmount": 15000.00,
  "currentAmount": 2000.00,
  "targetDate": "2026-03-15",
  "icon": "fa-car",
  "priority": "medium",
  "category": "transportation",
  "tags": ["car", "family", "transportation"],
  "milestones": [
    {
      "percentage": 25,
      "description": "Down payment ready"
    },
    {
      "percentage": 50,
      "description": "Halfway there"
    },
    {
      "percentage": 75,
      "description": "Almost ready to buy"
    }
  ]
}
```

**Validation Rules:**
- `name`: Required, 3-100 characters, unique per user
- `targetAmount`: Required, positive number, min 1.00, max 999,999,999.99
- `currentAmount`: Optional, positive number, max targetAmount (default: 0)
- `targetDate`: Required, must be future date
- `icon`: Optional, valid FontAwesome icon class (default: "fa-bullseye")
- `priority`: Optional, one of: low, medium, high (default: "medium")
- `category`: Optional, predefined category from available list

**Response:**
```json
{
  "id": 9,
  "name": "New Car",
  "description": "Save for a reliable family car",
  "targetAmount": 15000.00,
  "currentAmount": 2000.00,
  "targetDate": "2026-03-15",
  "icon": "fa-car",
  "status": "active",
  "progress": 13.33,
  "remainingAmount": 13000.00,
  "daysRemaining": 277,
  "dailyTargetAmount": 46.93,
  "weeklyTargetAmount": 328.51,
  "monthlyTargetAmount": 1408.05,
  "isOverdue": false,
  "isCompleted": false,
  "projectedCompletionDate": "2026-03-10",
  "onTrack": true,
  "priority": "medium",
  "category": "transportation",
  "tags": ["car", "family", "transportation"],
  "createdAt": "2025-06-11T18:30:00Z",
  "updatedAt": "2025-06-11T18:30:00Z",
  "contributions": [],
  "milestones": [
    {
      "percentage": 25,
      "amount": 3750.00,
      "reachedAt": null,
      "description": "Down payment ready"
    },
    {
      "percentage": 50,
      "amount": 7500.00,
      "reachedAt": null,
      "description": "Halfway there"
    },
    {
      "percentage": 75,
      "amount": 11250.00,
      "reachedAt": null,
      "description": "Almost ready to buy"
    }
  ]
}
```

#### GET /goals/{id}
Get a specific goal by ID with detailed information, contribution history, and analytics.

**Path Parameters:**
- `id`: Goal ID (integer)

**Query Parameters:**
- `includeContributions`: Include contribution history (default: true)
- `contributionLimit`: Limit number of contributions returned (default: 20)
- `includeAnalytics`: Include progress analytics (default: true)

**Response:**
```json
{
  "id": 1,
  "name": "Summer Vacation",
  "description": "Trip to Europe with family",
  "targetAmount": 2500.00,
  "currentAmount": 1800.00,
  "targetDate": "2025-07-15",
  "icon": "fa-plane-departure",
  "status": "active",
  "progress": 72.0,
  "remainingAmount": 700.00,
  "daysRemaining": 34,
  "dailyTargetAmount": 20.59,
  "weeklyTargetAmount": 144.12,
  "monthlyTargetAmount": 617.65,
  "isOverdue": false,
  "isCompleted": false,
  "projectedCompletionDate": "2025-07-05",
  "onTrack": true,
  "priority": "high",
  "category": "travel",
  "tags": ["vacation", "family", "europe"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-06-10T14:20:00Z",
  "contributions": [
    {
      "id": 101,
      "amount": 500.00,
      "source": "salary",
      "notes": "Monthly savings",
      "date": "2025-06-01T00:00:00Z",
      "createdAt": "2025-06-01T08:30:00Z"
    },
    {
      "id": 102,
      "amount": 200.00,
      "source": "bonus",
      "notes": "Work bonus",
      "date": "2025-06-05T00:00:00Z",
      "createdAt": "2025-06-05T10:15:00Z"
    },
    {
      "id": 103,
      "amount": 150.00,
      "source": "savings",
      "notes": "Extra from budget savings",
      "date": "2025-05-15T00:00:00Z",
      "createdAt": "2025-05-15T14:22:00Z"
    }
  ],
  "milestones": [
    {
      "percentage": 25,
      "amount": 625.00,
      "reachedAt": "2025-02-15T00:00:00Z",
      "description": "First quarter milestone"
    },
    {
      "percentage": 50,
      "amount": 1250.00,
      "reachedAt": "2025-04-10T00:00:00Z",
      "description": "Halfway point"
    },
    {
      "percentage": 75,
      "amount": 1875.00,
      "reachedAt": null,
      "description": "Three quarters milestone"
    }
  ],
  "analytics": {
    "monthlyContributions": [
      { "month": "2025-01", "amount": 300.00, "contributions": 2 },
      { "month": "2025-02", "amount": 400.00, "contributions": 3 },
      { "month": "2025-03", "amount": 350.00, "contributions": 2 },
      { "month": "2025-04", "amount": 450.00, "contributions": 4 },
      { "month": "2025-05", "amount": 300.00, "contributions": 2 }
    ],
    "averageMonthlyContribution": 360.00,
    "largestContribution": 500.00,
    "smallestContribution": 50.00,
    "totalContributions": 15,
    "contributionFrequency": "weekly",
    "velocityTrend": "increasing",
    "estimatedCompletionDate": "2025-07-05",
    "recommendedMonthlyAmount": 617.65,
    "savingsRate": 14.4,
    "timeToCompletion": {
      "current_pace": "34 days",
      "target_pace": "34 days",
      "behind_by": "0 days",
      "status": "on_track"
    }
  }
}
```

#### PUT /goals/{id}
Update a specific goal's information.

**Path Parameters:**
- `id`: Goal ID (integer)

**Request Body:**
```json
{
  "name": "European Summer Adventure",
  "description": "Extended trip to Europe with family - updated plan",
  "targetAmount": 3000.00,
  "targetDate": "2025-08-01",
  "icon": "fa-plane-departure",
  "priority": "high",
  "category": "travel",
  "tags": ["vacation", "family", "europe", "extended"],
  "milestones": [
    {
      "percentage": 25,
      "description": "Flight tickets booked"
    },
    {
      "percentage": 50,
      "description": "Accommodation secured"
    },
    {
      "percentage": 75,
      "description": "Activities and tours booked"
    },
    {
      "percentage": 90,
      "description": "Almost ready for trip"
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "European Summer Adventure",
  "description": "Extended trip to Europe with family - updated plan",
  "targetAmount": 3000.00,
  "currentAmount": 1800.00,
  "targetDate": "2025-08-01",
  "icon": "fa-plane-departure",
  "status": "active",
  "progress": 60.0,
  "remainingAmount": 1200.00,
  "daysRemaining": 51,
  "dailyTargetAmount": 23.53,
  "weeklyTargetAmount": 164.71,
  "monthlyTargetAmount": 705.88,
  "isOverdue": false,
  "isCompleted": false,
  "projectedCompletionDate": "2025-07-22",
  "onTrack": true,
  "priority": "high",
  "category": "travel",
  "tags": ["vacation", "family", "europe", "extended"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-06-11T19:15:00Z",
  "milestones": [
    {
      "percentage": 25,
      "amount": 750.00,
      "reachedAt": "2025-02-15T00:00:00Z",
      "description": "Flight tickets booked"
    },
    {
      "percentage": 50,
      "amount": 1500.00,
      "reachedAt": "2025-04-10T00:00:00Z",
      "description": "Accommodation secured"
    },
    {
      "percentage": 60,
      "amount": 1800.00,
      "reachedAt": "2025-06-10T00:00:00Z",
      "description": "Current progress"
    },
    {
      "percentage": 75,
      "amount": 2250.00,
      "reachedAt": null,
      "description": "Activities and tours booked"
    },
    {
      "percentage": 90,
      "amount": 2700.00,
      "reachedAt": null,
      "description": "Almost ready for trip"
    }
  ]
}
```

#### DELETE /goals/{id}
Delete a specific goal. This will also remove all associated contributions.

**Path Parameters:**
- `id`: Goal ID (integer)

**Query Parameters:**
- `keepContributions`: Whether to keep contribution records for reporting (default: false)

**Response:**
```json
{
  "message": "Goal deleted successfully",
  "deletedGoalId": 1,
  "deletedContributions": 15,
  "totalAmountReleased": 1800.00,
  "deletedAt": "2025-06-11T19:30:00Z"
}
```

#### POST /goals/{id}/contribute
Add funds to a specific goal.

**Path Parameters:**
- `id`: Goal ID (integer)

**Request Body:**
```json
{
  "amount": 250.00,
  "source": "salary",
  "notes": "Bi-weekly contribution",
  "date": "2025-06-11"
}
```

**Validation Rules:**
- `amount`: Required, positive number, min 0.01, max 999,999.99
- `source`: Required, one of: salary, savings, bonus, gift, other
- `notes`: Optional, max 500 characters
- `date`: Optional, defaults to current date, cannot be future date

**Response:**
```json
{
  "contribution": {
    "id": 104,
    "goalId": 1,
    "amount": 250.00,
    "source": "salary",
    "notes": "Bi-weekly contribution",
    "date": "2025-06-11T00:00:00Z",
    "createdAt": "2025-06-11T19:45:00Z"
  },
  "goal": {
    "id": 1,
    "name": "European Summer Adventure",
    "currentAmount": 2050.00,
    "targetAmount": 3000.00,
    "progress": 68.33,
    "remainingAmount": 950.00,
    "status": "active",
    "milestonesReached": [
      {
        "percentage": 25,
        "amount": 750.00,
        "reachedAt": "2025-02-15T00:00:00Z"
      },
      {
        "percentage": 50,
        "amount": 1500.00,
        "reachedAt": "2025-04-10T00:00:00Z"
      }
    ],
    "newMilestonesReached": [],
    "projectedCompletionDate": "2025-07-15",
    "daysRemaining": 34
  }
}
```

#### GET /goals/{id}/contributions
Get contribution history for a specific goal with filtering and pagination.

**Path Parameters:**
- `id`: Goal ID (integer)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field (amount, date, createdAt)
- `sortOrder`: Sort direction (asc, desc)
- `source`: Filter by contribution source
- `startDate`: Filter contributions from this date
- `endDate`: Filter contributions to this date
- `minAmount`: Filter contributions with minimum amount
- `maxAmount`: Filter contributions with maximum amount

**Example Request:**
```
GET /goals/1/contributions?page=1&limit=10&sortBy=date&sortOrder=desc&source=salary
```

**Response:**
```json
{
  "contributions": [
    {
      "id": 104,
      "amount": 250.00,
      "source": "salary",
      "notes": "Bi-weekly contribution",
      "date": "2025-06-11T00:00:00Z",
      "createdAt": "2025-06-11T19:45:00Z"
    },
    {
      "id": 102,
      "amount": 200.00,
      "source": "bonus",
      "notes": "Work bonus",
      "date": "2025-06-05T00:00:00Z",
      "createdAt": "2025-06-05T10:15:00Z"
    },
    {
      "id": 101,
      "amount": 500.00,
      "source": "salary",
      "notes": "Monthly savings",
      "date": "2025-06-01T00:00:00Z",
      "createdAt": "2025-06-01T08:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "summary": {
    "totalContributions": 15,
    "totalAmount": 1800.00,
    "averageContribution": 120.00,
    "largestContribution": 500.00,
    "smallestContribution": 50.00,
    "contributionsBySource": {
      "salary": { "count": 8, "amount": 1200.00 },
      "bonus": { "count": 3, "amount": 400.00 },
      "savings": { "count": 2, "amount": 150.00 },
      "gift": { "count": 1, "amount": 50.00 },
      "other": { "count": 1, "amount": 0.00 }
    },
    "monthlyBreakdown": [
      { "month": "2025-06", "amount": 950.00, "contributions": 3 },
      { "month": "2025-05", "amount": 300.00, "contributions": 2 },
      { "month": "2025-04", "amount": 450.00, "contributions": 4 }
    ]
  }
}
```

#### PUT /goals/{id}/contributions/{contributionId}
Update a specific contribution (only notes and source can be modified).

**Path Parameters:**
- `id`: Goal ID (integer)
- `contributionId`: Contribution ID (integer)

**Request Body:**
```json
{
  "source": "bonus",
  "notes": "Updated: Work performance bonus"
}
```

**Response:**
```json
{
  "id": 102,
  "goalId": 1,
  "amount": 200.00,
  "source": "bonus",
  "notes": "Updated: Work performance bonus",
  "date": "2025-06-05T00:00:00Z",
  "createdAt": "2025-06-05T10:15:00Z",
  "updatedAt": "2025-06-11T20:00:00Z"
}
```

#### DELETE /goals/{id}/contributions/{contributionId}
Remove a contribution from a goal (reduces the goal's current amount).

**Path Parameters:**
- `id`: Goal ID (integer)
- `contributionId`: Contribution ID (integer)

**Response:**
```json
{
  "message": "Contribution removed successfully",
  "removedContribution": {
    "id": 102,
    "amount": 200.00,
    "source": "bonus",
    "date": "2025-06-05T00:00:00Z"
  },
  "goal": {
    "id": 1,
    "name": "European Summer Adventure",
    "currentAmount": 1850.00,
    "targetAmount": 3000.00,
    "progress": 61.67,
    "remainingAmount": 1150.00,
    "updatedAt": "2025-06-11T20:05:00Z"
  }
}
```

#### GET /goals/summary
Get comprehensive goal statistics and overview for the authenticated user.

**Query Parameters:**
- `period`: Time period (all, current_year, current_month, custom)
- `startDate`: Start date for custom period
- `endDate`: End date for custom period
- `includeCompleted`: Include completed goals in statistics (default: true)

**Response:**
```json
{
  "period": "current_year",
  "dateRange": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "overview": {
    "totalGoals": 8,
    "activeGoals": 6,
    "completedGoals": 1,
    "overdueGoals": 1,
    "upcomingGoals": 0
  },
  "financial": {
    "totalTargetAmount": 45000.00,
    "totalCurrentAmount": 28500.00,
    "totalRemainingAmount": 16500.00,
    "totalCompletedAmount": 5000.00,
    "overallProgress": 63.33,
    "averageProgress": 58.75,
    "totalContributionsThisYear": 15500.00,
    "averageMonthlyContribution": 1291.67
  },
  "progress": {
    "goalsOnTrack": 5,
    "goalsOffTrack": 1,
    "goalsBehindSchedule": 2,
    "goalsAheadOfSchedule": 1,
    "completionRate": 12.5,
    "averageTimeToCompletion": "8.5 months"
  },
  "milestones": {
    "totalMilestones": 24,
    "milestonesReached": 12,
    "upcomingMilestones": 8,
    "milestoneCompletionRate": 50.0
  },
  "categories": [
    {
      "category": "travel",
      "goalsCount": 2,
      "totalTarget": 8500.00,
      "totalCurrent": 4300.00,
      "progress": 50.59
    },
    {
      "category": "emergency",
      "goalsCount": 1,
      "totalTarget": 12000.00,
      "totalCurrent": 8500.00,
      "progress": 70.83
    },
    {
      "category": "transportation",
      "goalsCount": 2,
      "totalTarget": 18000.00,
      "totalCurrent": 8200.00,
      "progress": 45.56
    },
    {
      "category": "education",
      "goalsCount": 1,
      "totalTarget": 5000.00,
      "totalCurrent": 5000.00,
      "progress": 100.0
    },
    {
      "category": "home",
      "goalsCount": 2,
      "totalTarget": 1500.00,
      "totalCurrent": 2500.00,
      "progress": 100.0
    }
  ],
  "contributions": {
    "thisMonth": {
      "amount": 1450.00,
      "count": 8,
      "averageAmount": 181.25
    },
    "lastMonth": {
      "amount": 1200.00,
      "count": 6,
      "averageAmount": 200.00
    },
    "monthlyTrend": "increasing",
    "topSources": [
      { "source": "salary", "amount": 8500.00, "percentage": 54.84 },
      { "source": "bonus", "amount": 3200.00, "percentage": 20.65 },
      { "source": "savings", "amount": 2800.00, "percentage": 18.06 },
      { "source": "gift", "amount": 1000.00, "percentage": 6.45 }
    ]
  },
  "projections": {
    "estimatedYearEndAmount": 42000.00,
    "projectedGoalsCompleted": 3,
    "recommendedMonthlyContribution": 1375.00,
    "timeToCompleteAllGoals": "14 months",
    "mostLikelyNextCompletion": {
      "goalId": 1,
      "goalName": "European Summer Adventure",
      "estimatedDate": "2025-07-15"
    }
  }
}
```

#### GET /goals/categories
Get available goal categories with their default icons, colors, and descriptions.

**Response:**
```json
{
  "categories": [
    {
      "name": "travel",
      "displayName": "Travel & Vacation",
      "icon": "fa-plane-departure",
      "color": "#3B82F6",
      "description": "Trips, vacations, and travel experiences"
    },
    {
      "name": "emergency",
      "displayName": "Emergency Fund",
      "icon": "fa-shield-alt",
      "color": "#EF4444",
      "description": "Emergency savings and financial security"
    },
    {
      "name": "transportation",
      "displayName": "Transportation",
      "icon": "fa-car",
      "color": "#F59E0B",
      "description": "Vehicle purchases, maintenance, and transport"
    },
    {
      "name": "home",
      "displayName": "Home & Property",
      "icon": "fa-home",
      "color": "#8B5CF6",
      "description": "House down payment, furniture, home improvements"
    },
    {
      "name": "education",
      "displayName": "Education",
      "icon": "fa-graduation-cap",
      "color": "#6366F1",
      "description": "Courses, degrees, certifications, and learning"
    },
    {
      "name": "technology",
      "displayName": "Technology",
      "icon": "fa-laptop",
      "color": "#10B981",
      "description": "Gadgets, computers, and tech equipment"
    },
    {
      "name": "health",
      "displayName": "Health & Wellness",
      "icon": "fa-heartbeat",
      "color": "#EC4899",
      "description": "Medical expenses, fitness, and wellness"
    },
    {
      "name": "business",
      "displayName": "Business & Investment",
      "icon": "fa-briefcase",
      "color": "#6B7280",
      "description": "Business ventures, investments, and entrepreneurship"
    },
    {
      "name": "entertainment",
      "displayName": "Entertainment",
      "icon": "fa-film",
      "color": "#F59E0B",
      "description": "Hobbies, entertainment, and leisure activities"
    },
    {
      "name": "gifts",
      "displayName": "Gifts & Special Events",
      "icon": "fa-gift",
      "color": "#EC4899",
      "description": "Presents, celebrations, and special occasions"
    },
    {
      "name": "other",
      "displayName": "Other Goals",
      "icon": "fa-bullseye",
      "color": "#9CA3AF",
      "description": "Custom goals and miscellaneous savings"
    }
  ]
}
```

#### POST /goals/bulk-contribute
Add contributions to multiple goals at once (useful for distributing income across goals).

**Request Body:**
```json
{
  "totalAmount": 1000.00,
  "source": "salary",
  "date": "2025-06-11",
  "notes": "Monthly salary distribution",
  "distributions": [
    {
      "goalId": 1,
      "amount": 400.00,
      "notes": "Priority goal - vacation"
    },
    {
      "goalId": 2,
      "amount": 300.00,
      "notes": "Emergency fund building"
    },
    {
      "goalId": 3,
      "amount": 300.00,
      "notes": "Car savings"
    }
  ]
}
```

**Response:**
```json
{
  "summary": {
    "totalAmount": 1000.00,
    "distributedAmount": 1000.00,
    "successfulContributions": 3,
    "failedContributions": 0,
    "contributionsCreated": [
      {
        "goalId": 1,
        "goalName": "European Summer Adventure",
        "contributionId": 105,
        "amount": 400.00
      },
      {
        "goalId": 2,
        "goalName": "Emergency Fund",
        "contributionId": 106,
        "amount": 300.00
      },
      {
        "goalId": 3,
        "goalName": "New Car",
        "contributionId": 107,
        "amount": 300.00
      }
    ]
  },
  "goalsUpdated": [
    {
      "id": 1,
      "name": "European Summer Adventure",
      "newCurrentAmount": 2450.00,
      "newProgress": 81.67,
      "milestonesReached": [
        {
          "percentage": 75,
          "amount": 2250.00,
          "justReached": true
        }
      ]
    },
    {
      "id": 2,
      "name": "Emergency Fund",
      "newCurrentAmount": 8800.00,
      "newProgress": 73.33,
      "milestonesReached": []
    },
    {
      "id": 3,
      "name": "New Car",
      "newCurrentAmount": 2300.00,
      "newProgress": 15.33,
      "milestonesReached": []
    }
  ]
}
```

#### GET /goals/analytics
Get advanced analytics and insights about goal progress and savings patterns.

**Query Parameters:**
- `period`: Analysis period (3months, 6months, 1year, all)
- `goalIds`: Specific goals to analyze (comma-separated)
- `includeProjections`: Include future projections (default: true)

**Response:**
```json
{
  "period": "6months",
  "dateRange": {
    "startDate": "2024-12-11",
    "endDate": "2025-06-11"
  },
  "savingsVelocity": {
    "averageMonthlyContribution": 1291.67,
    "trend": "increasing",
    "velocityChange": "+15.5%",
    "peakMonth": "2025-05",
    "peakAmount": 1800.00,
    "consistencyScore": 78.5
  },
  "goalCompletionPatterns": {
    "averageTimeToCompletion": "8.5 months",
    "fastestCompletion": "3.2 months",
    "slowestCompletion": "14.8 months",
    "completionRate": 12.5,
    "abandonmentRate": 5.0,
    "successFactors": [
      "Regular monthly contributions",
      "Realistic target dates",
      "Clear milestone tracking"
    ]
  },
  "contributionPatterns": {
    "mostProductiveDay": "friday",
    "averageContributionSize": 156.78,
    "contributionFrequency": "bi-weekly",
    "seasonalTrends": [
      { "quarter": "Q1", "averageContribution": 1200.00 },
      { "quarter": "Q2", "averageContribution": 1450.00 }
    ],
    "sourceReliability": {
      "salary": { "consistency": 95.2, "reliability": "high" },
      "bonus": { "consistency": 34.6, "reliability": "low" },
      "savings": { "consistency": 67.8, "reliability": "medium" }
    }
  },
  "milestoneAnalysis": {
    "averageTimeBetweenMilestones": "2.3 months",
    "milestoneMotivationImpact": "+23% contribution increase",
    "mostMotivatingMilestone": "50% completion",
    "leastMotivatingMilestone": "25% completion"
  },
  "projections": {
    "nextMonthProjection": {
      "estimatedContributions": 1400.00,
      "likelyGoalsCompleted": 1,
      "newMilestonesReached": 3
    },
    "yearEndProjection": {
      "estimatedTotalSaved": 42000.00,
      "goalsLikelyCompleted": 3,
      "progressPercentage": 87.5,
      "recommendedAdjustments": [
        "Increase car fund contributions by $50/month",
        "Consider extending vacation goal deadline by 2 weeks"
      ]
    }
  },
  "recommendations": {
    "optimizationSuggestions": [
      "Consider automating contributions to improve consistency",
      "Set up milestone rewards to maintain motivation",
      "Review and adjust target dates based on current velocity"
    ],
    "riskAlerts": [
      "Goal #3 (New Car) is falling behind schedule",
      "Emergency fund progress has slowed in recent months"
    ],
    "opportunityHighlights": [
      "Vacation goal ahead of schedule - consider increasing target",
      "Salary contributions are very consistent - good foundation"
    ]
  }
}
```

### Goal Status Values
- `active`: Goal is current and being worked on
- `completed`: Goal has reached 100% of target amount
- `paused`: Goal is temporarily inactive (not accepting contributions)
- `overdue`: Goal has passed target date without completion
- `cancelled`: Goal has been cancelled (soft-deleted)
- `upcoming`: Goal with future start date

### Goal Priority Values
- `low`: Nice-to-have goals with flexible timelines
- `medium`: Important goals with moderate urgency (default)
- `high`: Critical goals requiring focused attention and regular contributions

### Contribution Source Values
- `salary`: Regular employment income
- `bonus`: Work bonuses, commissions, overtime pay
- `savings`: Transfer from existing savings accounts
- `gift`: Money received as gifts
- `other`: Miscellaneous income sources

### Goal Categories
Goals can be categorized to help with organization and reporting:
- `travel`: Vacations, trips, travel experiences
- `emergency`: Emergency funds, financial security
- `transportation`: Cars, bikes, transportation needs
- `home`: House down payments, furniture, home improvements
- `education`: Courses, degrees, certifications
- `technology`: Gadgets, computers, tech equipment
- `health`: Medical expenses, fitness, wellness
- `business`: Business ventures, investments
- `entertainment`: Hobbies, entertainment, leisure
- `gifts`: Presents, special events, celebrations
- `other`: Custom or miscellaneous goals

### Goal Icons (FontAwesome Classes)
Available icons for goals:
- `fa-plane-departure`: Travel/vacation goals
- `fa-shield-alt`: Emergency fund/security
- `fa-car`: Transportation/vehicle goals
- `fa-home`: Home/property goals
- `fa-graduation-cap`: Education/learning goals
- `fa-laptop`: Technology/gadget goals
- `fa-heartbeat`: Health/wellness goals
- `fa-briefcase`: Business/career goals
- `fa-film`: Entertainment/hobby goals
- `fa-gift`: Gift/special event goals
- `fa-bullseye`: General/other goals

### Error Handling for Goals

#### Goal-Specific Error Codes
- `GOAL_NOT_FOUND`: Goal with specified ID doesn't exist
- `GOAL_ALREADY_COMPLETED`: Cannot modify completed goal
- `GOAL_CONTRIBUTION_EXCEEDS_TARGET`: Contribution would exceed target amount
- `GOAL_INVALID_TARGET_DATE`: Target date must be in the future
- `GOAL_INVALID_AMOUNT`: Amount must be positive and within limits
- `GOAL_DUPLICATE_NAME`: Goal name already exists for user
- `CONTRIBUTION_NOT_FOUND`: Contribution with specified ID doesn't exist
- `CONTRIBUTION_CANNOT_MODIFY`: Contribution cannot be modified (too old)
- `BULK_CONTRIBUTION_MISMATCH`: Total amount doesn't match distribution sum

#### Example Error Responses
```json
{
  "error": true,
  "message": "Goal not found",
  "code": "GOAL_NOT_FOUND",
  "details": {
    "goalId": 999,
    "userId": 123
  }
}
```

```json
{
  "error": true,
  "message": "Contribution exceeds target amount",
  "code": "GOAL_CONTRIBUTION_EXCEEDS_TARGET",
  "details": {
    "goalId": 1,
    "contributionAmount": 500.00,
    "currentAmount": 2800.00,
    "targetAmount": 3000.00,
    "maxAllowedContribution": 200.00
  }
}
```