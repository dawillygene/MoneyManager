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
      "description": "Courses, degrees, certifications"
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

#### GET /goals/alerts
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
      "description": "Courses, degrees, certifications"
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

#### GET /goals/alerts
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

# Reports API Documentation

## Overview
This document outlines the Reports API endpoints required for the Money Manager application's financial reporting functionality. The Reports API provides comprehensive financial analytics, expense breakdowns, income vs expense comparisons, savings analysis, and report generation capabilities.

## Base Configuration
- **Base URL**: `http://localhost:8080/api/reports`
- **Authentication**: JWT Bearer tokens
- **Token Storage**: **HttpOnly cookies ONLY** (no localStorage)
- **Cookies**: HttpOnly cookies with automatic management
- **CORS**: `withCredentials: true` required for cookie handling

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
      "subcategories": [
        {
          "name": "Rent",
          "amount": 650000.00,
          "percentage": 76.47
        },
        {
          "name": "Utilities",
          "amount": 200000.00,
          "percentage": 23.53
        }
      ]
    },
    {
      "category": "Food & Dining",
      "amount": 420000.00,
      "percentage": 22.22,
      "transactionCount": 12,
      "subcategories": [
        {
          "name": "Groceries",
          "amount": 280000.00,
          "percentage": 66.67
        },
        {
          "name": "Restaurants",
          "amount": 140000.00,
          "percentage": 33.33
        }
      ]
    },
    {
      "category": "Transportation",
      "amount": 320000.00,
      "percentage": 16.93,
      "transactionCount": 8,
      "subcategories": [
        {
          "name": "Fuel",
          "amount": 180000.00,
          "percentage": 56.25
        },
        {
          "name": "Public Transport",
          "amount": 140000.00,
          "percentage": 43.75
        }
      ]
    },
    {
      "category": "Entertainment",
      "amount": 300000.00,
      "percentage": 15.87,
      "transactionCount": 6,
      "subcategories": [
        {
          "name": "Movies",
          "amount": 120000.00,
          "percentage": 40.0
        },
        {
          "name": "Subscriptions",
          "amount": 180000.00,
          "percentage": 60.0
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
    "lowestCategory": "Entertainment",
    "mostFrequentCategory": "Food & Dining",
    "recommendations": [
      "Consider reducing restaurant expenses to optimize food budget",
      "Housing expenses are within normal range for your income",
      "Transportation costs have increased by 15% this month"
    ]
  }
}
```

#### GET /reports/income-vs-expenses
Compare income and expenses over time with detailed analysis.

**Query Parameters:**
- `period`: Time period (this-month, last-month, last-3-months, last-6-months, this-year, custom)
- `startDate`: Start date for custom period
- `endDate`: End date for custom period
- `includeProjections`: Include future projections (default: true)

**Response:**
```json
{
  "period": "last-3-months",
  "dateRange": {
    "startDate": "2025-04-01",
    "endDate": "2025-06-30"
  },
  "summary": {
    "totalIncome": 4500000.00,
    "totalExpenses": 4320000.00,
    "netIncome": 180000.00,
    "savingsRate": 4.0,
    "expenseRatio": 96.0
  },
  "monthlyBreakdown": [
    {
      "month": "2025-04",
      "income": 1500000.00,
      "expenses": 1650000.00,
      "netIncome": -150000.00,
      "savingsRate": -10.0,
      "incomeCategories": [
        {
          "category": "Salary",
          "amount": 1200000.00,
          "percentage": 80.0
        },
        {
          "category": "Freelance",
          "amount": 300000.00,
          "percentage": 20.0
        }
      ]
    },
    {
      "month": "2025-05",
      "income": 1500000.00,
      "expenses": 1780000.00,
      "netIncome": -280000.00,
      "savingsRate": -18.67,
      "incomeCategories": [
        {
          "category": "Salary",
          "amount": 1200000.00,
          "percentage": 80.0
        },
        {
          "category": "Bonus",
          "amount": 300000.00,
          "percentage": 20.0
        }
      ]
    },
    {
      "month": "2025-06",
      "income": 1500000.00,
      "expenses": 1890000.00,
      "netIncome": -390000.00,
      "savingsRate": -26.0,
      "incomeCategories": [
        {
          "category": "Salary",
          "amount": 1200000.00,
          "percentage": 80.0
        },
        {
          "category": "Investment Returns",
          "amount": 300000.00,
          "percentage": 20.0
        }
      ]
    }
  ],
  "trends": {
    "incomeGrowthRate": 0.0,
    "expenseGrowthRate": 14.55,
    "savingsGrowthRate": -160.0,
    "averageMonthlyIncome": 1500000.00,
    "averageMonthlyExpense": 1440000.00,
    "predictedNextMonthIncome": 1500000.00,
    "predictedNextMonthExpense": 1950000.00
  },
  "analysis": {
    "incomeStability": "stable",
    "expenseVolatility": "high",
    "budgetHealth": "poor",
    "recommendations": [
      "Urgent: Reduce monthly expenses by at least 25%",
      "Focus on cutting non-essential spending",
      "Consider additional income sources",
      "Review and optimize all subscription services"
    ],
    "alerts": [
      "Expenses exceed income for 3 consecutive months",
      "Savings rate is negative - immediate action required"
    ]
  }
}
```

#### GET /reports/savings-report
Track saving habits, goals progress, and savings optimization insights.

**Query Parameters:**
- `period`: Time period (this-month, last-month, last-3-months, last-6-months, this-year, custom)
- `startDate`: Start date for custom period
- `endDate`: End date for custom period
- `includeGoals`: Include savings goals progress (default: true)
- `includeRecommendations`: Include optimization recommendations (default: true)

**Response:**
```json
{
  "period": "this-year",
  "dateRange": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "savingsSummary": {
    "totalSaved": 2150000.00,
    "targetSavings": 3600000.00,
    "savingsProgress": 59.72,
    "monthlySavingsAverage": 358333.33,
    "savingsRate": 14.33,
    "emergencyFundMonths": 3.2
  },
  "monthlySavings": [
    {
      "month": "2025-01",
      "saved": 450000.00,
      "savingsRate": 18.0,
      "sources": [
        {
          "type": "Budget Surplus",
          "amount": 300000.00
        },
        {
          "type": "Goal Contributions",
          "amount": 150000.00
        }
      ]
    },
    {
      "month": "2025-02",
      "saved": 380000.00,
      "savingsRate": 15.2,
      "sources": [
        {
          "type": "Budget Surplus",
          "amount": 200000.00
        },
        {
          "type": "Goal Contributions",
          "amount": 180000.00
        }
      ]
    },
    {
      "month": "2025-03",
      "saved": 420000.00,
      "savingsRate": 16.8,
      "sources": [
        {
          "type": "Budget Surplus",
          "amount": 250000.00
        },
        {
          "type": "Goal Contributions",
          "amount": 170000.00
        }
      ]
    },
    {
      "month": "2025-04",
      "saved": -150000.00,
      "savingsRate": -6.0,
      "sources": [
        {
          "type": "Budget Deficit",
          "amount": -150000.00
        }
      ]
    },
    {
      "month": "2025-05",
      "saved": -280000.00,
      "savingsRate": -11.2,
      "sources": [
        {
          "type": "Budget Deficit",
          "amount": -280000.00
        }
      ]
    },
    {
      "month": "2025-06",
      "saved": -390000.00,
      "savingsRate": -15.6,
      "sources": [
        {
          "type": "Budget Deficit",
          "amount": -390000.00
        }
      ]
    }
  ],
  "goalsProgress": [
    {
      "goalId": 1,
      "goalName": "Vacation Fund",
      "targetAmount": 2500000.00,
      "currentAmount": 1800000.00,
      "progress": 72.0,
      "monthlyContribution": 200000.00,
      "estimatedCompletion": "2025-07-15",
      "onTrack": true
    },
    {
      "goalId": 2,
      "goalName": "Emergency Fund",
      "targetAmount": 12000000.00,
      "currentAmount": 8500000.00,
      "progress": 70.83,
      "monthlyContribution": 300000.00,
      "estimatedCompletion": "2025-11-15",
      "onTrack": true
    },
    {
      "goalId": 3,
      "goalName": "New Car",
      "targetAmount": 15000000.00,
      "currentAmount": 5200000.00,
      "progress": 34.67,
      "monthlyContribution": 400000.00,
      "estimatedCompletion": "2026-08-20",
      "onTrack": false
    }
  ],
  "savingsAnalysis": {
    "savingsConsistency": "declining",
    "averageSavingsRate": 2.7,
    "bestSavingsMonth": "2025-01",
    "worstSavingsMonth": "2025-06",
    "savingsVolatility": "very_high",
    "emergencyFundStatus": "adequate",
    "goalCompletionRisk": "medium"
  },
  "recommendations": {
    "immediate": [
      "Stop the declining savings trend by reducing expenses",
      "Prioritize emergency fund completion",
      "Review and adjust savings goals based on current income"
    ],
    "shortTerm": [
      "Automate savings transfers to improve consistency",
      "Create separate accounts for different savings goals",
      "Increase income sources to improve savings capacity"
    ],
    "longTerm": [
      "Consider investment options for long-term savings goals",
      "Review insurance coverage to protect savings",
      "Plan for tax-efficient savings strategies"
    ]
  }
}
```

#### GET /reports/budget-performance
Analyze budget performance across categories with variance analysis.

**Query Parameters:**
- `period`: Time period (this-month, last-month, last-3-months, last-6-months, this-year, custom)
- `startDate`: Start date for custom period
- `endDate`: End date for custom period
- `includeForecasts`: Include spending forecasts (default: true)

**Response:**
```json
{
  "period": "this-month",
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "overallPerformance": {
    "totalBudgeted": 2500000.00,
    "totalSpent": 2184320.00,
    "totalRemaining": 315680.00,
    "overallUtilization": 87.37,
    "budgetsOnTrack": 4,
    "budgetsOverBudget": 1,
    "budgetsUnderutilized": 2
  },
  "categoryPerformance": [
    {
      "category": "Housing",
      "budgeted": 1000000.00,
      "spent": 850000.00,
      "remaining": 150000.00,
      "utilization": 85.0,
      "variance": -150000.00,
      "variancePercentage": -15.0,
      "status": "on_track",
      "daysRemaining": 18,
      "projectedTotal": 900000.00,
      "recommendedDailySpend": 8333.33
    },
    {
      "category": "Food & Dining",
      "budgeted": 500000.00,
      "spent": 420000.00,
      "remaining": 80000.00,
      "utilization": 84.0,
      "variance": -80000.00,
      "variancePercentage": -16.0,
      "status": "on_track",
      "daysRemaining": 18,
      "projectedTotal": 460000.00,
      "recommendedDailySpend": 4444.44
    },
    {
      "category": "Transportation",
      "budgeted": 300000.00,
      "spent": 320000.00,
      "remaining": -20000.00,
      "utilization": 106.67,
      "variance": 20000.00,
      "variancePercentage": 6.67,
      "status": "over_budget",
      "daysRemaining": 18,
      "projectedTotal": 350000.00,
      "recommendedDailySpend": 0.00
    },
    {
      "category": "Entertainment",
      "budgeted": 400000.00,
      "spent": 300000.00,
      "remaining": 100000.00,
      "utilization": 75.0,
      "variance": -100000.00,
      "variancePercentage": -25.0,
      "status": "under_utilized",
      "daysRemaining": 18,
      "projectedTotal": 320000.00,
      "recommendedDailySpend": 5555.56
    },
    {
      "category": "Healthcare",
      "budgeted": 300000.00,
      "spent": 0.00,
      "remaining": 300000.00,
      "utilization": 0.0,
      "variance": -300000.00,
      "variancePercentage": -100.0,
      "status": "unused",
      "daysRemaining": 18,
      "projectedTotal": 50000.00,
      "recommendedDailySpend": 16666.67
    }
  ],
  "insights": {
    "bestPerformingCategory": "Food & Dining",
    "worstPerformingCategory": "Transportation",
    "mostUnderutilizedCategory": "Healthcare",
    "budgetOptimizationOpportunity": 380000.00,
    "recommendations": [
      "Transportation budget needs immediate attention - 6.67% over budget",
      "Consider reallocating unused Healthcare budget to Transportation",
      "Entertainment budget has 25% remaining - good control",
      "Housing expenses are well managed within budget"
    ]
  }
}
```

#### GET /reports/list
Get list of all generated reports with metadata and status.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `sortBy`: Sort field (createdAt, reportType, dateRange, status)
- `sortOrder`: Sort direction (asc, desc)
- `reportType`: Filter by report type (expense-analysis, income-vs-expenses, savings-report, budget-performance, custom)
- `status`: Filter by status (generated, processing, failed, expired)
- `startDate`: Filter reports from this date
- `endDate`: Filter reports to this date

**Response:**
```json
{
  "reports": [
    {
      "id": "rpt_001",
      "reportName": "Monthly Expense Summary",
      "reportType": "expense-analysis",
      "dateRange": {
        "startDate": "2025-06-01",
        "endDate": "2025-06-30"
      },
      "status": "generated",
      "fileSize": "2.4 MB",
      "format": "PDF",
      "generatedAt": "2025-07-03T14:20:00Z",
      "expiresAt": "2025-08-03T14:20:00Z",
      "downloadCount": 3,
      "downloadUrl": "/reports/download/rpt_001",
      "previewUrl": "/reports/preview/rpt_001"
    },
    {
      "id": "rpt_002",
      "reportName": "Income vs Expense Report",
      "reportType": "income-vs-expenses",
      "dateRange": {
        "startDate": "2025-04-01",
        "endDate": "2025-06-30"
      },
      "status": "generated",
      "fileSize": "3.1 MB",
      "format": "PDF",
      "generatedAt": "2025-07-02T16:15:00Z",
      "expiresAt": "2025-08-02T16:15:00Z",
      "downloadCount": 1,
      "downloadUrl": "/reports/download/rpt_002",
      "previewUrl": "/reports/preview/rpt_002"
    },
    {
      "id": "rpt_003",
      "reportName": "Yearly Budget Analysis",
      "reportType": "budget-performance",
      "dateRange": {
        "startDate": "2025-01-01",
        "endDate": "2025-06-30"
      },
      "status": "generated",
      "fileSize": "4.7 MB",
      "format": "PDF",
      "generatedAt": "2025-07-01T10:30:00Z",
      "expiresAt": "2025-08-01T10:30:00Z",
      "downloadCount": 5,
      "downloadUrl": "/reports/download/rpt_003",
      "previewUrl": "/reports/preview/rpt_003"
    },
    {
      "id": "rpt_004",
      "reportName": "Category Spending Report",
      "reportType": "expense-analysis",
      "dateRange": {
        "startDate": "2025-05-01",
        "endDate": "2025-05-31"
      },
      "status": "generated",
      "fileSize": "1.8 MB",
      "format": "Excel",
      "generatedAt": "2025-06-03T09:45:00Z",
      "expiresAt": "2025-07-03T09:45:00Z",
      "downloadCount": 2,
      "downloadUrl": "/reports/download/rpt_004",
      "previewUrl": "/reports/preview/rpt_004"
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
    "totalReports": 15,
    "reportsThisMonth": 4,
    "totalDownloads": 28,
    "storageUsed": "45.2 MB",
    "reportsExpiringSoon": 2
  }
}
```

#### POST /reports/generate
Generate a new financial report with specified parameters.

**Request Body:**
```json
{
  "reportType": "expense-analysis",
  "reportName": "Custom Expense Analysis Q2 2025",
  "dateRange": {
    "startDate": "2025-04-01",
    "endDate": "2025-06-30"
  },
  "parameters": {
    "includeSubcategories": true,
    "includeTrends": true,
    "includeRecommendations": true,
    "currency": "TZS",
    "groupBy": "month"
  },
  "format": "PDF",
  "emailDelivery": true,
  "emailAddress": "user@example.com",
  "includeCharts": true,
  "chartTypes": ["pie", "bar", "line"]
}
```

**Response:**
```json
{
  "reportId": "rpt_new_001",
  "status": "processing",
  "message": "Report generation started successfully",
  "estimatedCompletionTime": "2025-06-11T18:35:00Z",
  "reportName": "Custom Expense Analysis Q2 2025",
  "reportType": "expense-analysis",
  "queuePosition": 2,
  "statusCheckUrl": "/reports/status/rpt_new_001",
  "webhookUrl": "/reports/webhook/rpt_new_001"
}
```

#### GET /reports/status/{reportId}
Check the generation status of a specific report.

**Path Parameters:**
- `reportId`: Report ID (string)

**Response:**
```json
{
  "reportId": "rpt_new_001",
  "status": "completed",
  "progress": 100,
  "message": "Report generated successfully",
  "reportName": "Custom Expense Analysis Q2 2025",
  "reportType": "expense-analysis",
  "generatedAt": "2025-06-11T18:33:00Z",
  "fileSize": "3.2 MB",
  "format": "PDF",
  "downloadUrl": "/reports/download/rpt_new_001",
  "previewUrl": "/reports/preview/rpt_new_001",
  "expiresAt": "2025-07-11T18:33:00Z"
}
```

#### GET /reports/download/{reportId}
Download a generated report file.

**Path Parameters:**
- `reportId`: Report ID (string)

**Query Parameters:**
- `format`: Override format (pdf, excel, csv) - optional

**Response:**
- **Content-Type**: `application/pdf` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="expense-analysis-q2-2025.pdf"`
- **Body**: Binary file content

#### GET /reports/preview/{reportId}
Get a preview/summary of a generated report without downloading.

**Path Parameters:**
- `reportId`: Report ID (string)

**Response:**
```json
{
  "reportId": "rpt_001",
  "reportName": "Monthly Expense Summary",
  "reportType": "expense-analysis",
  "generatedAt": "2025-07-03T14:20:00Z",
  "summary": {
    "totalPages": 12,
    "keyMetrics": {
      "totalExpenses": 1890000.00,
      "topCategory": "Housing (44.97%)",
      "savingsRate": -15.6,
      "budgetVariance": "+6.18%"
    },
    "sections": [
      {
        "title": "Executive Summary",
        "pageNumber": 1,
        "description": "Overview of financial performance"
      },
      {
        "title": "Category Breakdown",
        "pageNumber": 3,
        "description": "Detailed expense analysis by category"
      },
      {
        "title": "Trends Analysis",
        "pageNumber": 7,
        "description": "Monthly trends and comparisons"
      },
      {
        "title": "Recommendations",
        "pageNumber": 10,
        "description": "Actionable insights and suggestions"
      }
    ]
  },
  "thumbnailUrl": "/reports/thumbnail/rpt_001.jpg"
}
```

#### DELETE /reports/{reportId}
Delete a generated report.

**Path Parameters:**
- `reportId`: Report ID (string)

**Response:**
```json
{
  "message": "Report deleted successfully",
  "reportId": "rpt_001",
  "deletedAt": "2025-06-11T18:45:00Z"
}
```

#### POST /reports/export
Export report data in various formats for external use.

**Request Body:**
```json
{
  "reportType": "expense-analysis",
  "dateRange": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "format": "csv",
  "dataLevel": "detailed",
  "includeMetadata": true,
  "compressionType": "zip"
}
```

**Response:**
- **Content-Type**: `application/zip` or `text/csv` or `application/json`
- **Body**: Exported data in requested format

### Advanced Analytics Endpoints

#### GET /reports/financial-health
Get comprehensive financial health score and analysis.

**Query Parameters:**
- `period`: Analysis period (last-3-months, last-6-months, this-year, custom)
- `includeRecommendations`: Include actionable recommendations (default: true)

**Response:**
```json
{
  "period": "last-6-months",
  "dateRange": {
    "startDate": "2024-12-11",
    "endDate": "2025-06-11"
  },
  "financialHealthScore": 68,
  "scoreBreakdown": {
    "savingsRate": {
      "score": 45,
      "weight": 25,
      "value": -2.7,
      "benchmark": 20.0,
      "status": "poor"
    },
    "budgetAdherence": {
      "score": 75,
      "weight": 20,
      "value": 85.3,
      "benchmark": 90.0,
      "status": "good"
    },
    "debtToIncomeRatio": {
      "score": 85,
      "weight": 20,
      "value": 15.2,
      "benchmark": 30.0,
      "status": "excellent"
    },
    "emergencyFund": {
      "score": 70,
      "weight": 15,
      "value": 3.2,
      "benchmark": 6.0,
      "status": "fair"
    },
    "expenseVolatility": {
      "score": 60,
      "weight": 10,
      "value": 18.5,
      "benchmark": 10.0,
      "status": "fair"
    },
    "incomeStability": {
      "score": 90,
      "weight": 10,
      "value": 95.8,
      "benchmark": 85.0,
      "status": "excellent"
    }
  },
  "recommendations": [
    {
      "priority": "high",
      "category": "savings",
      "title": "Improve Savings Rate",
      "description": "Your savings rate is negative. Focus on reducing expenses and increasing income.",
      "actionItems": [
        "Cut non-essential expenses by 20%",
        "Consider side income opportunities",
        "Automate savings transfers"
      ]
    },
    {
      "priority": "medium",
      "category": "emergency_fund",
      "title": "Build Emergency Fund",
      "description": "Increase emergency fund to cover 6 months of expenses.",
      "actionItems": [
        "Set up automatic transfers to emergency fund",
        "Allocate windfalls to emergency savings",
        "Open high-yield savings account"
      ]
    }
  ]
}
```

#### GET /reports/cash-flow
Analyze cash flow patterns and predict future cash positions.

**Query Parameters:**
- `period`: Analysis period (last-3-months, last-6-months, this-year, custom)
- `includeProjections`: Include future projections (default: true)
- `projectionMonths`: Number of months to project (default: 3, max: 12)

**Response:**
```json
{
  "period": "last-6-months",
  "dateRange": {
    "startDate": "2024-12-11",
    "endDate": "2025-06-11"
  },
  "cashFlowSummary": {
    "totalInflow": 9000000.00,
    "totalOutflow": 9820000.00,
    "netCashFlow": -820000.00,
    "averageMonthlyInflow": 1500000.00,
    "averageMonthlyOutflow": 1636666.67,
    "cashFlowVolatility": "high"
  },
  "monthlyCashFlow": [
    {
      "month": "2024-12",
      "inflow": 1500000.00,
      "outflow": 1420000.00,
      "netFlow": 80000.00,
      "endingBalance": 2080000.00
    },
    {
      "month": "2025-01",
      "inflow": 1500000.00,
      "outflow": 1350000.00,
      "netFlow": 150000.00,
      "endingBalance": 2230000.00
    },
    {
      "month": "2025-02",
      "inflow": 1500000.00,
      "outflow": 1380000.00,
      "netFlow": 120000.00,
      "endingBalance": 2350000.00
    },
    {
      "month": "2025-03",
      "inflow": 1500000.00,
      "outflow": 1420000.00,
      "netFlow": 80000.00,
      "endingBalance": 2430000.00
    },
    {
      "month": "2025-04",
      "inflow": 1500000.00,
      "outflow": 1650000.00,
      "netFlow": -150000.00,
      "endingBalance": 2280000.00
    },
    {
      "month": "2025-05",
      "inflow": 1500000.00,
      "outflow": 1780000.00,
      "netFlow": -280000.00,
      "endingBalance": 2000000.00
    },
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
      "projectedEndingBalance": 1160000.00,
      "confidence": 85
    },
    {
      "month": "2025-08",
      "projectedInflow": 1500000.00,
      "projectedOutflow": 2000000.00,
      "projectedNetFlow": -500000.00,
      "projectedEndingBalance": 660000.00,
      "confidence": 78
    },
    {
      "month": "2025-09",
      "projectedInflow": 1500000.00,
      "projectedOutflow": 2100000.00,
      "projectedNetFlow": -600000.00,
      "projectedEndingBalance": 60000.00,
      "confidence": 70
    }
  ],
  "analysis": {
    "cashFlowTrend": "deteriorating",
    "liquidityRisk": "high",
    "burnRate": 390000.00,
    "monthsToDepletion": 4.1,
    "seasonalPatterns": [
      {
        "quarter": "Q1",
        "avgNetFlow": 116666.67,
        "pattern": "positive"
      },
      {
        "quarter": "Q2",
        "avgNetFlow": -273333.33,
        "pattern": "declining"
      }
    ]
  },
  "alerts": [
    {
      "type": "liquidity_warning",
      "severity": "high",
      "message": "Cash reserves may be depleted within 4 months at current burn rate"
    },
    {
      "type": "negative_trend",
      "severity": "medium",
      "message": "Cash flow has been negative for 3 consecutive months"
    }
  ]
}
```

### Report Templates and Customization

#### GET /reports/templates
Get available report templates and their configurations.

**Response:**
```json
{
  "templates": [
    {
      "id": "tpl_monthly_summary",
      "name": "Monthly Financial Summary",
      "description": "Comprehensive monthly overview with all key metrics",
      "reportTypes": ["expense-analysis", "income-vs-expenses", "budget-performance"],
      "defaultPeriod": "this-month",
      "sections": [
        "executive_summary",
        "income_analysis",
        "expense_breakdown",
        "budget_performance",
        "savings_analysis",
        "recommendations"
      ],
      "chartTypes": ["pie", "bar", "line"],
      "formats": ["PDF", "Excel"],
      "estimatedGenerationTime": "2-3 minutes"
    },
    {
      "id": "tpl_quarterly_review",
      "name": "Quarterly Financial Review",
      "description": "Detailed quarterly analysis with trends and forecasts",
      "reportTypes": ["expense-analysis", "income-vs-expenses", "savings-report", "financial-health"],
      "defaultPeriod": "last-3-months",
      "sections": [
        "quarterly_summary",
        "trend_analysis",
        "goal_progress",
        "financial_health",
        "cash_flow_analysis",
        "strategic_recommendations"
      ],
      "chartTypes": ["bar", "line", "area"],
      "formats": ["PDF"],
      "estimatedGenerationTime": "5-7 minutes"
    },
    {
      "id": "tpl_annual_report",
      "name": "Annual Financial Report",
      "description": "Comprehensive yearly analysis with detailed insights",
      "reportTypes": ["expense-analysis", "income-vs-expenses", "savings-report", "budget-performance", "financial-health", "cash-flow"],
      "defaultPeriod": "this-year",
      "sections": [
        "annual_overview",
        "monthly_trends",
        "category_analysis",
        "goal_achievements",
        "financial_health_score",
        "year_over_year_comparison",
        "next_year_planning"
      ],
      "chartTypes": ["pie", "bar", "line", "area", "scatter"],
      "formats": ["PDF", "Excel"],
      "estimatedGenerationTime": "10-15 minutes"
    }
  ]
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
- `201`: Report generation started
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (token expired/invalid)
- `403`: Forbidden (insufficient permissions)
- `404`: Report not found
- `409`: Conflict (report already exists)
- `422`: Unprocessable Entity (validation errors)
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error

### Specific Error Codes
- `INVALID_DATE_RANGE`: Date range is invalid or too large
- `REPORT_GENERATION_FAILED`: Report generation process failed
- `REPORT_NOT_FOUND`: Requested report does not exist
- `REPORT_EXPIRED`: Report has expired and is no longer available
- `INSUFFICIENT_DATA`: Not enough data for the requested period
- `RATE_LIMIT_EXCEEDED`: Too many report generation requests
- `STORAGE_QUOTA_EXCEEDED`: User has exceeded report storage limit

## Frontend Integration Requirements

### Cookie-Based Authentication
The Reports API requires the same cookie-based authentication as other endpoints:
- `withCredentials: true` in Axios configuration
- HttpOnly cookies for token management
- Automatic token refresh handling

### Service Class Implementation
Add to your existing `services.js`:

```javascript
// Report Service
export class ReportService {
    // Core report endpoints
    async getExpenseAnalysis(params = {}) {
        const response = await api.get('/reports/expense-analysis', { params });
        return response.data;
    }

    async getIncomeVsExpenses(params = {}) {
        const response = await api.get('/reports/income-vs-expenses', { params });
        return response.data;
    }

    async getBudgetPerformance(params = {}) {
        const response = await api.get('/reports/budget-performance', { params });
        return response.data;
    }

    async getSavingsReport(params = {}) {
        const response = await api.get('/reports/savings-report', { params });
        return response.data;
    }

    // Report management
    async generateReport(reportData) {
        const response = await api.post('/reports/generate', reportData);
        return response.data;
    }

    async getReportStatus(reportId) {
        const response = await api.get(`/reports/status/${reportId}`);
        return response.data;
    }

    async downloadReport(reportId, format = null) {
        const params = format ? { format } : {};
        const response = await api.get(`/reports/download/${reportId}`, {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    async getReportsList(params = {}) {
        const response = await api.get('/reports/list', { params });
        return response.data;
    }

    async deleteReport(reportId) {
        const response = await api.delete(`/reports/${reportId}`);
        return response.data;
    }

    async exportCSV(params = {}) {
        const response = await api.get('/reports/export/csv', {
            params,
            responseType: 'blob'
        });
        
        this.handleFileDownload(response.data, 'financial-data.csv');
        return response.data;
    }

    async exportPDF(params = {}) {
        const response = await api.get('/reports/export/pdf', {
            params,
            responseType: 'blob'
        });
        
        this.handleFileDownload(response.data, 'financial-report.pdf');
        return response.data;
    }

    async getFinancialHealth(params = {}) {
        const response = await api.get('/reports/financial-health', { params });
        return response.data;
    }

    async getCashFlow(params = {}) {
        const response = await api.get('/reports/cash-flow', { params });
        return response.data;
    }

    async previewReport(reportId) {
        const response = await api.get(`/reports/preview/${reportId}`);
        return response.data;
    }

    async getTemplates() {
        const response = await api.get('/reports/templates');
        return response.data;
    }

    async getAnalytics(params = {}) {
        const response = await api.get('/reports/analytics', { params });
        return response.data;
    }

    async exportReport(exportData) {
        const response = await api.post('/reports/export', exportData, {
            responseType: 'blob'
        });
        return response.data;
    }

    // Legacy support methods
    async getMonthlyReport(year, month) {
        const response = await api.get('/reports/monthly', {
            params: { year, month }
        });
        return response.data;
    }

    async getYearlyReport(year) {
        const response = await api.get('/reports/yearly', {
            params: { year }
        });
        return response.data;
    }

    async getCustomReport(startDate, endDate) {
        const response = await api.get('/reports/custom', {
            params: { startDate, endDate }
        });
        return response.data;
    }

    async legacyExport(params) {
        const response = await api.get('/reports/export', {
            params,
            responseType: 'blob'
        });
        
        const filename = this.getLegacyExportFilename(params);
        this.handleFileDownload(response.data, filename);
        return response.data;
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

    getLegacyExportFilename(params) {
        const { type, year, month, startDate, endDate } = params;
        
        switch (type) {
          case 'monthly':
            return `monthly-report-${year}-${month.toString().padStart(2, '0')}.pdf`;
          case 'yearly':
            return `yearly-report-${year}.pdf`;
          case 'custom':
            return `custom-report-${startDate}-to-${endDate}.pdf`;
          default:
            return 'financial-report.pdf';
        }
    }
}

// Export service instances
export const dashboardService = new DashboardService();
export const reportsService = new ReportsService();
```

### React Hook Examples

```javascript
import { useState, useEffect } from 'react';
import { dashboardService, reportsService } from '../api/services';

// Custom hook for dashboard data
export const useDashboard = (period = 'this-month') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardService.getOverview({
          period,
          includeCharts: true,
          includeProjections: true,
          includeComparisons: true,
          includeTrends: true
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

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await dashboardService.getOverview({
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

  return { data, loading, error, refreshDashboard };
};

// Custom hook for dashboard widgets
export const useDashboardWidgets = (widgets, period = 'this-month') => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        setLoading(true);
        const widgetData = await dashboardService.getWidgets(widgets, period);
        setData(widgetData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (widgets && widgets.length > 0) {
      fetchWidgets();
    }
  }, [widgets, period]);

  return { data, loading, error };
};

// Custom hook for reports
export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.generateReport(reportData);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getReportsList = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getReportsList(params);
      setReports(result.reports);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.deleteReport(reportId);
      // Refresh reports list
      await getReportsList();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId, format = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.downloadReport(reportId, format);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    reports,
    loading,
    error,
    generateReport,
    getReportsList,
    deleteReport,
    downloadReport
  };
};

// Custom hook for expense analysis
export const useExpenseAnalysis = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenseAnalysis = async () => {
      try {
        setLoading(true);
        const analysisData = await reportsService.getExpenseAnalysis(params);
        setData(analysisData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseAnalysis();
  }, [JSON.stringify(params)]);

  return { data, loading, error };
};

// Custom hook for financial health
export const useFinancialHealth = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialHealth = async () => {
      try {
        setLoading(true);
        const healthData = await reportsService.getFinancialHealth(params);
        setData(healthData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialHealth();
  }, [JSON.stringify(params)]);

  return { data, loading, error };
};
```

### Usage Examples

```javascript
// Dashboard component example
import React from 'react';
import { useDashboard, useDashboardWidgets } from '../hooks/useDashboard';

const Dashboard = () => {
  const { data: overview, loading: overviewLoading, error: overviewError } = useDashboard('this-month');
  const { data: widgets, loading: widgetsLoading } = useDashboardWidgets(
    ['balance', 'income-expenses', 'expense-pie'], 
    'this-month'
  );

  if (overviewLoading || widgetsLoading) return <div>Loading...</div>;
  if (overviewError) return <div>Error: {overviewError}</div>;

  return (
    <div className="dashboard">
      <h1>Financial Dashboard</h1>
      
      {/* Key metrics from overview */}
      <div className="metrics-cards">
        <div className="metric-card">
          <h3>Current Balance</h3>
          <p>{overview.keyMetrics.currentBalance.amount.toLocaleString()} {overview.keyMetrics.currentBalance.currency}</p>
        </div>
        {/* More metric cards... */}
      </div>

      {/* Charts and widgets */}
      <div className="charts-section">
        {widgets.expensePie && (
          <div className="expense-pie-chart">
            {/* Render pie chart with widgets.expensePie data */}
          </div>
        )}
      </div>
    </div>
  );
};

// Reports component example
import React, { useState } from 'react';
import { useReports, useExpenseAnalysis } from '../hooks/useReports';

const Reports = () => {
  const [reportParams, setReportParams] = useState({ period: 'this-month' });
  const { reports, loading, generateReport, getReportsList, downloadReport } = useReports();
  const { data: expenseData } = useExpenseAnalysis(reportParams);

  const handleGenerateReport = async () => {
    try {
      const reportData = {
        reportType: 'comprehensive',
        reportName: `Monthly Report ${new Date().toISOString().slice(0, 7)}`,
        dateRange: {
          startDate: '2025-06-01',
          endDate: '2025-06-30'
        },
        format: 'PDF',
        sections: [
          'executive_summary',
          'expense_breakdown',
          'budget_performance'
        ],
        includeCharts: true
      };

      const result = await generateReport(reportData);
      console.log('Report generation started:', result.reportId);
      
      // Refresh reports list
      await getReportsList();
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <div className="reports">
      <h1>Financial Reports</h1>
      
      <button onClick={handleGenerateReport} disabled={loading}>
        {loading ? 'Generating...' : 'Generate New Report'}
      </button>

      {/* Expense analysis section */}
      {expenseData && (
        <div className="expense-analysis">
          <h2>Expense Analysis</h2>
          <p>Total Expenses: {expenseData.totalExpenses.toLocaleString()}</p>
          {/* Render expense categories */}
        </div>
      )}

      {/* Reports list */}
      <div className="reports-list">
        <h2>Generated Reports</h2>
        {reports.map(report => (
          <div key={report.id} className="report-item">
            <span>{report.reportName}</span>
            <button onClick={() => downloadReport(report.id)}>
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Dashboard, Reports };
```

## Error Handling

All endpoints return standardized error responses:

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

**Common Error Codes:**
- `DASHBOARD_OVERVIEW_FAILED`: Dashboard overview request failed
- `WIDGET_DATA_FAILED`: Widget data request failed
- `EXPENSE_ANALYSIS_FAILED`: Expense analysis request failed
- `INCOME_EXPENSES_FAILED`: Income vs expenses analysis failed
- `BUDGET_PERFORMANCE_FAILED`: Budget performance analysis failed
- `SAVINGS_ANALYSIS_FAILED`: Savings analysis request failed
- `REPORT_GENERATION_FAILED`: Report generation process failed
- `REPORT_NOT_FOUND`: Requested report does not exist
- `CSV_EXPORT_FAILED`: CSV export process failed
- `PDF_EXPORT_FAILED`: PDF export process failed
- `FINANCIAL_HEALTH_FAILED`: Financial health analysis failed
- `CASH_FLOW_FAILED`: Cash flow analysis failed
- `INVALID_DATE_RANGE`: Date range is invalid or too large
- `INSUFFICIENT_DATA`: Not enough data for the requested period
- `INVALID_PERIOD`: Invalid time period specified
- `DATA_NOT_AVAILABLE`: Requested data is not available for the user

## Endpoint Constants

```javascript
// Add to your endpoints.js file
export const DASHBOARD_ENDPOINTS = {
  // Core dashboard
  OVERVIEW: '/dashboard/overview',
  WIDGETS: '/dashboard/widgets',
  EXPENSE_CATEGORIES: '/dashboard/expense-categories',
  CASH_FLOW: '/dashboard/cash-flow',
  BUDGET_PROGRESS: '/dashboard/budget-progress',
  RECENT_TRANSACTIONS: '/dashboard/recent-transactions',
  FINANCIAL_SUMMARY: '/dashboard/financial-summary',
  
  // Individual widgets
  BALANCE_CARD: '/dashboard/widgets/balance-card',
  INCOME_CARD: '/dashboard/widgets/income-card',
  EXPENSES_CARD: '/dashboard/widgets/expenses-card',
  SAVINGS_CARD: '/dashboard/widgets/savings-card',
  
  // Export
  EXPORT: '/dashboard/export'
};

export const REPORT_ENDPOINTS = {
  // Core reports
  EXPENSE_ANALYSIS: '/reports/expense-analysis',
  INCOME_VS_EXPENSES: '/reports/income-vs-expenses',
  BUDGET_PERFORMANCE: '/reports/budget-performance',
  SAVINGS_REPORT: '/reports/savings-report',
  
  // Report management
  GENERATE: '/reports/generate',
  STATUS: (id) => `/reports/status/${id}`,
  DOWNLOAD: (id) => `/reports/download/${id}`,
  LIST: '/reports/list',
  DELETE: (id) => `/reports/${id}`,
  PREVIEW: (id) => `/reports/preview/${id}`,
  
  // Export endpoints
  EXPORT_CSV: '/reports/export/csv',
  EXPORT_PDF: '/reports/export/pdf',
  EXPORT: '/reports/export',
  
  // Advanced analytics
  FINANCIAL_HEALTH: '/reports/financial-health',
  CASH_FLOW: '/reports/cash-flow',
  ANALYTICS: '/reports/analytics',
  
  // Templates and configuration
  TEMPLATES: '/reports/templates',
  
  // Legacy support
  MONTHLY: '/reports/monthly',
  YEARLY: '/reports/yearly',
  CUSTOM: '/reports/custom',
  LEGACY_EXPORT: '/reports/export'
};
```

## Notes

1. **Cookie-Based Authentication**: All endpoints use HttpOnly cookies for secure token management
2. **Automatic Token Refresh**: Handled automatically by the browser cookie system
3. **CORS Configuration**: `withCredentials: true` is required for all API calls
4. **Monetary Values**: All amounts are returned as numbers (BigDecimal converted to double)
5. **Date Formats**: Dates are in YYYY-MM-DD format for input, ISO 8601 for responses
6. **File Downloads**: Return binary data with appropriate headers for direct download
7. **Pagination**: Standard format with `page`, `limit`, `totalPages`, `hasNextPage`, etc.
8. **Error Consistency**: All endpoints follow the same error response format
9. **Rate Limiting**: Some endpoints may have rate limits for security
10. **Data Privacy**: All responses filtered by authenticated user's data only