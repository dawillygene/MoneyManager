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
Get all budgets for the authenticated user.

#### POST /budgets
Create a new budget.
**Request Body:**
```json
{
  "name": "Monthly Budget",
  "amount": 2000.00,
  "category": "General",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "description": "Monthly expense budget",
  "recurring": "Monthly",
  "alertLevel": 80
}
```

#### GET /budgets/{id}
Get a specific budget by ID.

#### PUT /budgets/{id}
Update a specific budget.

#### DELETE /budgets/{id}
Delete a specific budget.

### Transaction Endpoints

#### GET /transactions
Get all transactions for the authenticated user.

#### POST /transactions
Create a new transaction.
**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Grocery shopping",
  "category": "Food & Dining",
  "type": "expense", // or "income"
  "date": "2025-06-11",
  "notes": "Weekly grocery shopping"
}
```

#### GET /transactions/{id}
Get a specific transaction by ID.

#### PUT /transactions/{id}
Update a specific transaction.

#### DELETE /transactions/{id}
Delete a specific transaction.

#### GET /transactions/budget/{budgetId}
Get all transactions for a specific budget.

### Goal Endpoints

#### GET /goals
Get all goals for the authenticated user.

#### POST /goals
Create a new goal.
**Request Body:**
```json
{
  "name": "Emergency Fund",
  "targetAmount": 5000.00,
  "currentAmount": 1500.00,
  "targetDate": "2025-12-31",
  "description": "Build emergency fund",
  "icon": "fa-shield-alt"
}
```

#### GET /goals/{id}
Get a specific goal by ID.

#### PUT /goals/{id}
Update a specific goal.

#### DELETE /goals/{id}
Delete a specific goal.

### Report Endpoints

#### GET /reports/monthly
Get monthly financial reports.
**Query Parameters:**
- `year`: Year (e.g., 2025)
- `month`: Month (1-12)

#### GET /reports/yearly
Get yearly financial reports.
**Query Parameters:**
- `year`: Year (e.g., 2025)

#### GET /reports/custom
Get custom date range reports.
**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

#### GET /reports/export
Export reports to file.
**Query Parameters:**
- `type`: Report type (monthly, yearly, custom)
- Additional parameters based on type

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