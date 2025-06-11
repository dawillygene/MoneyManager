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