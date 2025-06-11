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
Get all budgets for authenticated user.

**Headers:** `Authorization: Bearer <access_token>`

#### POST /api/budgets
Create a new budget.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
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

#### GET /api/budgets/{id}
Get specific budget by ID.

#### PUT /api/budgets/{id}
Update specific budget.

#### DELETE /api/budgets/{id}
Delete specific budget.

### Transaction Endpoints

#### GET /api/transactions
Get all transactions for authenticated user with optional filtering.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters (all optional):**
- `type` - Filter by transaction type ("income" or "expense")
- `category` - Filter by category name
- `startDate` - Filter from this date (YYYY-MM-DD format)
- `endDate` - Filter to this date (YYYY-MM-DD format)
- `year` - Filter by specific year
- `month` - Filter by specific month (1-12, requires year parameter)
- `limit` - Limit number of results returned

**Examples:**
```
GET /api/transactions - Get all transactions
GET /api/transactions?type=expense - Get only expense transactions
GET /api/transactions?category=Food - Get transactions in Food category
GET /api/transactions?startDate=2025-01-01&endDate=2025-01-31 - Get January transactions
GET /api/transactions?type=income&category=Salary&startDate=2025-01-01 - Combined filters
GET /api/transactions?year=2025&month=6 - Get June 2025 transactions
GET /api/transactions?limit=10 - Get latest 10 transactions
```

**Response:**
```json
[
  {
    "id": 1,
    "amount": 50.00,
    "description": "Grocery shopping",
    "category": "Food & Dining",
    "type": "expense",
    "date": "2025-06-11",
    "notes": "Weekly grocery shopping",
    "userId": 1
  }
]
```

#### POST /api/transactions
Create a new transaction.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "amount": 50.00,
  "description": "Grocery shopping",
  "category": "Food & Dining",
  "type": "expense",
  "date": "2025-06-11",
  "notes": "Weekly grocery shopping"
}
```

**Required Fields:**
- `amount` (number) - Transaction amount
- `description` (string) - Transaction description
- `category` (string) - Transaction category
- `type` (string) - Must be "income" or "expense"
- `date` (string) - Date in YYYY-MM-DD format

**Optional Fields:**
- `notes` (string) - Additional notes

**Response (201 Created):**
```json
{
  "id": 1,
  "amount": 50.00,
  "description": "Grocery shopping",
  "category": "Food & Dining",
  "type": "expense",
  "date": "2025-06-11",
  "notes": "Weekly grocery shopping",
  "userId": 1
}
```

#### GET /api/transactions/{id}
Get specific transaction by ID.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "id": 1,
  "amount": 50.00,
  "description": "Grocery shopping",
  "category": "Food & Dining",
  "type": "expense",
  "date": "2025-06-11",
  "notes": "Weekly grocery shopping",
  "userId": 1
}
```

#### PUT /api/transactions/{id}
Update specific transaction.

**Headers:** `Authorization: Bearer <access_token>`

**Request:** Same format as POST request

**Response:** Updated transaction object

#### DELETE /api/transactions/{id}
Delete specific transaction.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "message": "Transaction deleted successfully"
}
```

#### GET /api/transactions/budget/{budgetId}
Get transactions for specific budget.

**Headers:** `Authorization: Bearer <access_token>`

#### GET /api/transactions/filter/type/{type}
Get transactions filtered by type.

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameters:**
- `type` - Must be "income" or "expense"

**Examples:**
```
GET /api/transactions/filter/type/income
GET /api/transactions/filter/type/expense
```

#### GET /api/transactions/filter/category/{category}
Get transactions filtered by category.

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameters:**
- `category` - Category name (URL encoded if contains spaces)

**Examples:**
```
GET /api/transactions/filter/category/Food
GET /api/transactions/filter/category/Food%20%26%20Dining
```

#### GET /api/transactions/filter/date-range
Get transactions within a date range.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `startDate` (required) - Start date in YYYY-MM-DD format
- `endDate` (required) - End date in YYYY-MM-DD format

**Example:**
```
GET /api/transactions/filter/date-range?startDate=2025-01-01&endDate=2025-01-31
```

#### GET /api/transactions/statistics
Get transaction statistics for the authenticated user.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "totalTransactions": 25,
  "incomeTransactions": 5,
  "expenseTransactions": 20,
  "recentTransactions": [
    {
      "id": 1,
      "amount": 50.00,
      "description": "Grocery shopping",
      "category": "Food & Dining",
      "type": "expense",
      "date": "2025-06-11",
      "notes": "Weekly grocery shopping",
      "userId": 1
    }
  ]
}
```

### Goal Endpoints

#### GET /api/goals
Get all goals for authenticated user.

**Headers:** `Authorization: Bearer <access_token>`

#### POST /api/goals
Create a new goal.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
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

#### GET /api/goals/{id}
Get specific goal by ID.

#### PUT /api/goals/{id}
Update specific goal.

#### DELETE /api/goals/{id}
Delete specific goal.

### User Profile Endpoints

#### GET /api/user/profile
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

#### PUT /api/user/update
Update user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### DELETE /api/user/delete
Delete user account.

**Headers:** `Authorization: Bearer <access_token>`

### Report Endpoints

#### GET /api/reports/monthly
Get monthly financial report.

**Headers:** `Authorization: Bearer <access_token>`
**Query Parameters:** `year`, `month`

#### GET /api/reports/yearly
Get yearly financial report.

**Headers:** `Authorization: Bearer <access_token>`
**Query Parameters:** `year`

#### GET /api/reports/custom
Get custom date range report.

**Headers:** `Authorization: Bearer <access_token>`
**Query Parameters:** `startDate`, `endDate`

#### GET /api/reports/export
Export reports to file.

**Headers:** `Authorization: Bearer <access_token>`
**Query Parameters:** `type`, `year`, `month`, `startDate`, `endDate`

## Database Models

### User Model
- `id` (Long, Primary Key)
- `fullName` (String, Required)
- `email` (String, Required, Unique)
- `password` (String, Required, Encrypted)
- `confirmPassword` (String, Required)
- `agreeToTerms` (Boolean, Required)
- `refreshToken` (String, Nullable)

### Budget Model
- `id` (Long, Primary Key)
- `name` (String, Required)
- `amount` (BigDecimal, Required)
- `category` (String, Required)
- `startDate` (LocalDate, Required)
- `endDate` (LocalDate, Required)
- `description` (String)
- `recurring` (String)
- `alertLevel` (Integer)
- `userId` (Long, Required, Foreign Key)

### Transaction Model
- `id` (Long, Primary Key)
- `date` (LocalDate, Required)
- `description` (String, Required)
- `category` (String, Required)
- `amount` (BigDecimal, Required)
- `type` (String, Required) // "expense" or "income"
- `notes` (String)
- `userId` (Long, Required, Foreign Key)

### Goal Model
- `id` (Long, Primary Key)
- `name` (String, Required)
- `targetAmount` (BigDecimal, Required)
- `currentAmount` (BigDecimal, Required)
- `targetDate` (LocalDate, Required)
- `description` (String)
- `icon` (String)
- `userId` (Long, Required, Foreign Key)

## Configuration

### CORS Settings
- Allowed Origins: `http://localhost:3000`, `http://localhost:5173`
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Allow Credentials: `true`
- Max Age: `3600` seconds

### JWT Configuration
- Access Token Expiration: 15 minutes (900,000 ms)
- Refresh Token Expiration: 7 days (604,800,000 ms)
- Algorithm: HS256
- Claims: `userId`, `name`, `email`

### Cookie Settings
- HttpOnly: `true`
- SameSite: `Lax`
- Path: `/`
- Access Token Max-Age: 900 seconds
- Refresh Token Max-Age: 604,800 seconds

## Error Handling

### Standard Error Response
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Error Codes
- `PASSWORD_MISMATCH`: Passwords don't match
- `REGISTRATION_FAILED`: User registration failed
- `INVALID_CREDENTIALS`: Invalid login credentials
- `MISSING_REFRESH_TOKEN`: Refresh token missing
- `INVALID_REFRESH_TOKEN`: Invalid refresh token
- `INVALID_TOKEN`: Invalid or expired access token
- `BUDGET_NOT_FOUND`: Budget not found
- `TRANSACTION_NOT_FOUND`: Transaction not found
- `GOAL_NOT_FOUND`: Goal not found

## Security Implementation

### Password Security
- BCrypt encryption with salt
- Minimum password requirements enforced on frontend
- Password confirmation validation

### Token Security
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Secure token storage in database
- Token invalidation on logout
- HttpOnly cookies for enhanced security

### Authorization
- User-specific data access
- Token-based authentication for all protected endpoints
- User ID extraction from JWT claims
- Resource ownership verification

## Testing the API

### Prerequisites
1. Java 17 or higher
2. Maven 3.6 or higher
3. MySQL/PostgreSQL database
4. Application properties configured

### Running the Application
```bash
mvn spring-boot:run
```

### Testing Authentication Flow
1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Access protected endpoints with Bearer token
4. Refresh token when expired: `POST /api/auth/refresh`
5. Logout: `POST /api/auth/logout`

### Sample Frontend Integration
```javascript
// Login example
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const data = await response.json();
// Store tokens in localStorage/memory
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

## File Structure
```
src/main/java/com/example/moneymanager/
├── controllers/
│   ├── AuthController.java         # Authentication endpoints
│   ├── BudgetController.java       # Budget CRUD operations
│   ├── GoalController.java         # Goal CRUD operations
│   ├── TransactionController.java  # Transaction CRUD operations
│   ├── UserController.java         # User profile management
│   └── ReportController.java       # Financial reporting
├── models/
│   ├── User.java                   # User entity
│   ├── Budget.java                 # Budget entity
│   ├── Goal.java                   # Goal entity
│   └── Transaction.java            # Transaction entity
├── repositories/
│   ├── UserRepository.java         # User data access
│   ├── BudgetRepository.java       # Budget data access
│   ├── GoalRepository.java         # Goal data access
│   └── TransactionRepository.java  # Transaction data access
├── services/
│   ├── UserService.java            # User business logic
│   ├── JwtService.java             # JWT token management
│   ├── BudgetService.java          # Budget business logic
│   ├── GoalService.java            # Goal business logic
│   ├── TransactionService.java     # Transaction business logic
│   └── ReportService.java          # Report generation logic
└── config/
    └── WebConfig.java              # CORS configuration
```

## Next Steps

### For Frontend Integration
1. Implement automatic token refresh interceptor
2. Add token storage management (memory + localStorage)
3. Create protected route components
4. Handle authentication state globally
5. Implement logout functionality

### For Production Deployment
1. Configure production database
2. Set up SSL/TLS certificates
3. Configure production CORS origins
4. Set up monitoring and logging
5. Implement rate limiting
6. Add API documentation (Swagger)

### Potential Enhancements
1. Email verification for registration
2. Password reset functionality
3. Two-factor authentication
4. File upload for receipts
5. Data visualization charts
6. Budget alerts and notifications
7. Export to PDF/CSV formats
8. Multi-currency support

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure frontend origin is in CORS configuration
2. **Token Expiration**: Implement proper refresh token handling
3. **Database Connection**: Check application.properties configuration
4. **Authentication Failures**: Verify JWT secret key configuration

### Debug Tips
1. Enable debug logging for Spring Security
2. Check network tab for API responses
3. Verify token format and expiration
4. Test endpoints with Postman/Insomnia
5. Check database for user and token data

This implementation provides a complete, production-ready Money Manager API with JWT authentication, refresh tokens, and comprehensive financial management features.