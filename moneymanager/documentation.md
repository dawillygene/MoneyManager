# Money Manager Application Documentation

## Project Overview

The Money Manager Application is a comprehensive personal finance management system built with Spring Boot (Java) backend. This application provides users with tools to manage their finances including transactions, budgets, goals, and detailed reporting capabilities.

## Architecture

### Technology Stack
- **Backend**: Spring Boot 3.5.0
- **Database**: MySQL
- **Security**: Spring Security with JWT authentication
- **Build Tool**: Maven
- **Java Version**: 21

### Core Components

#### Models
- **User**: User management with profile, preferences, sessions, and security features
- **Transaction**: Financial transactions with categorization
- **Budget**: Budget management and tracking
- **Goal**: Financial goals with contributions tracking
- **UserSession**: Active user sessions management
- **UserActivity**: User activity logging
- **LoginHistory**: Login attempt tracking

#### Controllers
- **AuthController**: Authentication (register, login, refresh, logout, verify)
- **UserController**: User profile, preferences, sessions, 2FA, privacy settings
- **TransactionController**: Transaction CRUD operations
- **BudgetController**: Budget management
- **GoalController**: Goal management
- **DashboardController**: Dashboard analytics
- **ReportController**: Financial reports and analytics

#### Services
- **UserService**: User management operations
- **TransactionService**: Transaction business logic
- **BudgetService**: Budget operations
- **GoalService**: Goal management
- **DashboardService**: Dashboard data aggregation
- **ReportService**: Report generation and analytics
- **JwtService**: JWT token management

#### Security
- **SecurityConfig**: Spring Security configuration
- **JwtAuthFilter**: JWT authentication filter
- **CustomUserDetailsService**: User details for authentication

## Key Features

### Authentication & Security
- JWT-based authentication with access and refresh tokens
- HTTP-only cookies for token storage
- Two-factor authentication (2FA) support
- Session management
- Password management with validation
- Email verification
- Activity logging and audit trails

### User Management
- User registration and profile management
- Preferences (currency, timezone, theme, language)
- Privacy settings
- Avatar upload functionality
- Data export capabilities

### Financial Management
- Transaction tracking (income/expense)
- Budget creation and monitoring
- Financial goal setting and tracking
- Category-based organization

### Reporting & Analytics
- Expense analysis by category
- Income vs expenses tracking
- Budget progress monitoring
- Savings analysis
- Financial insights and trends
- Report generation and download (PDF/CSV)

### Cross-Origin Support
- CORS configuration for frontend integration
- Support for localhost:3000 and localhost:5173

## API Structure

### Authentication Endpoints (`/api/auth`)
- POST `/register` - User registration
- POST `/login` - User login
- POST `/refresh` - Token refresh
- POST `/logout` - User logout
- GET `/verify` - Token verification

### User Endpoints (`/api/user`)
- GET `/profile` - Get user profile
- PUT `/update` - Update user profile
- DELETE `/delete` - Delete user account
- GET/PUT `/preferences` - User preferences
- GET/PUT `/privacy` - Privacy settings
- GET `/sessions` - Active sessions
- POST `/2fa/enable|disable|verify` - Two-factor authentication
- GET `/activity` - Activity log
- GET `/login-history` - Login history

### Transaction Endpoints (`/api/transactions`)
- CRUD operations for transactions
- Filtering and pagination support

### Budget Endpoints (`/api/budgets`)
- CRUD operations for budgets
- Budget summary and analytics
- Category breakdown

### Goal Endpoints (`/api/goals`)
- CRUD operations for financial goals
- Goal contribution tracking

### Report Endpoints (`/api/reports`)
- GET `/expense-analysis` - Expense analysis
- GET `/income-vs-expenses` - Income vs expense comparison
- GET `/budget-progress` - Budget progress tracking
- GET `/savings-report` - Savings analysis
- POST `/download` - Report download

### Dashboard Endpoints (`/api/dashboard`)
- Financial overview and analytics
- Expense categories analysis
- Cash flow tracking
- Budget progress summary

## Database Configuration

The application uses MySQL database with JPA/Hibernate for ORM. Connection details are configured in `application.properties`.

## Security Features

- BCrypt password encoding
- JWT token validation
- CORS protection
- Content Security Policy headers
- HSTS headers
- Session management with stateless approach

## Error Handling

Consistent error response format across all endpoints:
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Date Handling

The application supports various date period formats:
- "today", "yesterday"
- "this-week", "last-week"
- "this-month", "last-month"
- "this-year", "last-year"
- Custom date ranges with startDate/endDate

## File Structure

```
src/
├── main/
│   ├── java/com/example/moneymanager/
│   │   ├── config/          # Configuration classes
│   │   ├── controllers/     # REST controllers
│   │   ├── models/          # Entity models
│   │   ├── repositories/    # Data repositories
│   │   ├── security/        # Security components
│   │   └── services/        # Business logic services
│   └── resources/
│       └── application.properties
└── test/
    └── java/                # Test classes
```

## Development Notes

- The application follows RESTful API design principles
- Comprehensive input validation and error handling
- Extensive logging and activity tracking
- Modular and maintainable code structure
- Support for pagination in list endpoints
- Flexible filtering and sorting capabilities
