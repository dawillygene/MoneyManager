# Money Manager - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [Project Structure](#project-structure)
5. [Components Documentation](#components-documentation)
6. [API Integration](#api-integration)
7. [Security Implementation](#security-implementation)
8. [Installation & Setup](#installation--setup)
9. [Usage Guide](#usage-guide)
10. [Development Guidelines](#development-guidelines)
11. [Testing](#testing)
12. [Deployment](#deployment)

## Project Overview

Money Manager is a modern, secure financial management application built with React and Java Spring Boot. It provides comprehensive tools for managing personal finances including budgets, transactions, goals, and financial reporting.

### Key Features
- 🔐 **Secure Authentication**: JWT-based authentication with refresh tokens stored in HttpOnly cookies
- 💰 **Budget Management**: Create, track, and manage budgets with spending alerts
- 📊 **Transaction Tracking**: Record and categorize income and expenses
- 🎯 **Goal Setting**: Set and track financial goals with progress monitoring
- 📈 **Financial Reports**: Monthly, yearly, and custom date range reports
- 📱 **Responsive Design**: Mobile-friendly interface with modern UI/UX
- 🍪 **Cookie-Based Security**: Enhanced security with HttpOnly cookies (no localStorage)
- 🔄 **Automatic Token Refresh**: Seamless session management without user interruption

### Technology Stack

**Frontend:**
- React 18.3.1
- React Router DOM 6.28.1
- Vite 6.0.7 (Build tool)
- Framer Motion 11.15.0 (Animations)
- Axios (HTTP client)
- Font Awesome (Icons)
- Tailwind CSS (Styling)

**Backend:**
- Java Spring Boot
- JWT Authentication
- MySQL/PostgreSQL Database
- RESTful API Architecture

**Security:**
- HttpOnly Cookies for token storage
- JWT Access & Refresh Tokens
- CORS configuration
- Password encryption (BCrypt)

## Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                        │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                           │
│  ├── Authentication (Login/Register)                       │
│  ├── Financial Management (Budgets/Transactions/Goals)     │
│  ├── Forms (Create/Edit operations)                        │
│  └── UI Components                                         │
├─────────────────────────────────────────────────────────────┤
│  Layout Layer                                              │
│  ├── AuthLayout (Login/Register pages)                     │
│  ├── MainLayout (Dashboard with Sidebar/Navigation)        │
│  └── ProtectedRoute (Route protection)                     │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                 │
│  ├── AuthService (Authentication operations)               │
│  ├── TokenStorage (Cookie-based token management)          │
│  ├── ApiConfig (Axios configuration & interceptors)        │
│  └── Service Classes (Business logic)                      │
├─────────────────────────────────────────────────────────────┤
│  Security Layer                                            │
│  ├── JWT Token Management                                  │
│  ├── Automatic Token Refresh                               │
│  ├── HttpOnly Cookie Storage                               │
│  └── Route Protection                                      │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Login/       │    │ Token        │    │ Protected    │
│ Register     │───▶│ Management   │───▶│ Routes       │
│ Pages        │    │ System       │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
       │                     │                   │
       ▼                     ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Check        │    │ Store in     │    │ Auto Refresh │
│ Existing     │    │ HttpOnly     │    │ on Expiry    │
│ Auth         │    │ Cookies      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Authentication System

### Cookie-Based Authentication
The application uses a sophisticated cookie-based authentication system for enhanced security:

**Features:**
- **HttpOnly Cookies**: Tokens stored in HttpOnly cookies to prevent XSS attacks
- **Automatic Refresh**: Seamless token refresh using refresh tokens
- **Memory Caching**: Tokens cached in memory for immediate access
- **Page Refresh Handling**: Maintains authentication state across page refreshes
- **Route Protection**: Automatic redirection for unauthenticated users

**Token Lifecycle:**
1. **Login**: User credentials → Server authentication → JWT tokens returned
2. **Storage**: Tokens stored in HttpOnly cookies + memory cache
3. **Usage**: Automatic inclusion in API requests via Axios interceptors
4. **Refresh**: Automatic refresh when access token expires
5. **Logout**: Complete token cleanup and redirection

**Security Benefits:**
- No localStorage usage (prevents XSS token theft)
- SameSite=Lax cookie protection (prevents CSRF attacks)
- Automatic token expiration handling
- Secure token transmission over HTTPS (production)

## Project Structure

```
src/
├── App.jsx                 # Main application component with routing
├── main.jsx               # Application entry point
├── index.css              # Global styles and CSS variables
│
├── api/                   # API layer
│   ├── apiConfig.js       # Axios configuration with interceptors
│   ├── authService.js     # Authentication service methods
│   ├── endpoints.js       # API endpoint constants
│   ├── index.js          # API exports
│   ├── services.js       # Business logic services
│   └── tokenStorage.js   # Cookie-based token management
│
├── components/           # Reusable components
│   ├── AddFundsForm.jsx     # Form for adding funds to goals
│   ├── AddGoalForm.jsx      # Form for creating new goals
│   ├── AddTransactionForm.jsx # Form for recording transactions
│   ├── CreateBudgetForm.jsx  # Form for creating budgets
│   ├── LoginForm.jsx        # User login form
│   ├── ProtectedRoute.jsx   # Route protection component
│   └── RegistrationForm.jsx # User registration form
│
├── layouts/              # Layout components
│   ├── AuthLayout.jsx    # Layout for login/register pages
│   ├── MainContent.jsx   # Main content wrapper
│   ├── Navigation.jsx    # Top navigation bar
│   └── Sidebar.jsx       # Side navigation menu
│
└── pages/                # Page components
    ├── Budgets.jsx       # Budget management page
    ├── createBudgetPage.jsx # Budget creation page
    ├── Dashbord.jsx      # Main dashboard
    ├── Goals.jsx         # Goal management page
    ├── LoginPage.jsx     # Login page with auth checking
    ├── RegistrationPage.jsx # Registration page with auth checking
    ├── Reports.jsx       # Financial reports page
    └── Transaction.jsx   # Transaction management page
```

## Components Documentation

### Authentication Components

#### LoginForm.jsx
**Purpose**: Handles user login with automatic authentication checking
**Features**:
- Form validation and error handling
- Cookie-based user data storage
- React Router navigation (no page reload)
- Loading states and success messages

**Key Methods**:
- `handleSubmit()`: Processes login form submission
- `checkExistingAuth()`: Checks for existing valid tokens

#### RegistrationForm.jsx
**Purpose**: Manages user registration with auto-login
**Features**:
- Client-side password validation
- Password confirmation checking
- Automatic login after successful registration
- Cookie-based data storage

#### ProtectedRoute.jsx
**Purpose**: Protects routes requiring authentication
**Features**:
- Token validation and refresh
- Automatic redirection to login
- Loading states during authentication check
- Graceful error handling

**Authentication Flow**:
1. Check for valid access tokens
2. If expired, attempt refresh using refresh token
3. Verify tokens with server (optional)
4. Allow access or redirect to login

### Layout Components

#### Sidebar.jsx
**Purpose**: Side navigation with user information
**Features**:
- Cookie-based user data display
- Active route highlighting
- Logout functionality
- Responsive design

#### Navigation.jsx
**Purpose**: Top navigation bar
**Features**:
- Brand display
- User actions
- Responsive layout

#### AuthLayout.jsx
**Purpose**: Layout wrapper for authentication pages
**Features**:
- Centered form layout
- Background styling
- No navigation elements

### Form Components

#### CreateBudgetForm.jsx
**Purpose**: Budget creation and editing
**Features**:
- Budget validation
- Category selection
- Date range picking
- Amount formatting

#### AddTransactionForm.jsx
**Purpose**: Transaction recording
**Features**:
- Income/expense categorization
- Date selection
- Amount validation
- Notes and descriptions

#### AddGoalForm.jsx
**Purpose**: Financial goal creation
**Features**:
- Target amount setting
- Progress tracking
- Icon selection
- Due date management

### Page Components

#### Dashboard.jsx (Dashbord.jsx)
**Purpose**: Main application dashboard
**Features**:
- Financial overview
- Quick actions
- Recent transactions
- Budget summaries

#### Budgets.jsx
**Purpose**: Budget management interface
**Features**:
- Budget listing
- Creation and editing
- Progress tracking
- Spending alerts

#### Transaction.jsx
**Purpose**: Transaction management
**Features**:
- Transaction history
- Filtering and search
- Categorization
- Edit/delete operations

#### Goals.jsx
**Purpose**: Financial goal tracking
**Features**:
- Goal progress visualization
- Add funds functionality
- Goal completion tracking
- Target date monitoring

#### Reports.jsx
**Purpose**: Financial reporting and analytics
**Features**:
- Monthly/yearly reports
- Custom date ranges
- Data visualization
- Export functionality

## API Integration

### Token Management System

#### tokenStorage.js
**Core Features**:
- Cookie-based token storage with HttpOnly support
- Memory caching for immediate access
- Automatic token expiration checking
- JWT token decoding for validation
- Token refresh queue management

**Key Methods**:
```javascript
// Get tokens from cookies/memory
getAccessToken()
getRefreshToken()

// Store tokens securely
setTokens(accessToken, refreshToken)

// Check authentication status
isAuthenticated()
isTokenExpired()

// Token refresh
refreshToken()

// Cleanup
clearTokens()
```

#### authService.js
**Authentication Operations**:
- User login and registration
- Token verification
- User profile management
- Logout handling

**Key Methods**:
```javascript
// Authentication
login(credentials)
register(userData)
logout()

// Token management
verifyToken()
isAuthenticated()

// User operations
getCurrentUser()
```

#### apiConfig.js
**Axios Configuration**:
- Base URL configuration
- Request/response interceptors
- Automatic token injection
- Token refresh handling
- Error handling

**Features**:
- `withCredentials: true` for cookie support
- Automatic Authorization header injection
- 401 error handling with token refresh
- Request queuing during token refresh

### Service Classes

#### services.js
**Business Logic Services**:
- Budget operations (CRUD)
- Transaction management
- Goal tracking
- Report generation

**Pattern**:
```javascript
class BudgetService {
  async getAll() { /* ... */ }
  async create(budgetData) { /* ... */ }
  async update(id, budgetData) { /* ... */ }
  async delete(id) { /* ... */ }
}
```

## Security Implementation

### Cookie Security
**Settings**:
- `HttpOnly: true` - Prevents JavaScript access
- `SameSite: Lax` - CSRF protection
- `Secure: true` - HTTPS only (production)
- `Path: /` - Available site-wide

**Token Expiration**:
- Access Token: 15 minutes
- Refresh Token: 7 days
- User Data Cookie: 7 days

### CORS Configuration
**Frontend Requirements**:
```javascript
{
  withCredentials: true,  // REQUIRED for cookies
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
}
```

**Backend Requirements**:
- Allow origin: `http://localhost:3000` (development)
- Allow credentials: `true`
- Allow methods: `GET, POST, PUT, DELETE, OPTIONS`

### XSS Protection
- No token storage in localStorage
- HttpOnly cookies prevent script access
- Input sanitization on forms
- Content Security Policy headers

### CSRF Protection
- SameSite cookie attribute
- CORS origin restrictions
- Token validation on server

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Java 17+ (for backend)
- MySQL/PostgreSQL database

### Frontend Setup
```bash
# Clone repository
git clone <repository-url>
cd MoneyManager

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Configuration
Create `.env` file:
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Money Manager
```

### Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.1",
    "framer-motion": "^11.15.0",
    "axios": "^1.7.8"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "eslint": "^9.17.0"
  }
}
```

## Usage Guide

### Authentication Flow
1. **Registration**: Create new account → Auto-login → Dashboard
2. **Login**: Enter credentials → Token storage → Dashboard
3. **Page Refresh**: Automatic token retrieval from cookies
4. **Session Expiry**: Automatic token refresh using refresh token
5. **Logout**: Complete token cleanup → Login page

### Navigation
- **Dashboard**: Overview of financial status
- **Transactions**: Record and manage transactions
- **Budgets**: Create and track budgets
- **Goals**: Set and monitor financial goals
- **Reports**: Generate financial reports

### Form Handling
- All forms include validation and error handling
- Loading states during API operations
- Success messages and navigation
- Field validation with visual feedback

## Development Guidelines

### Code Structure
- **Components**: Reusable UI components
- **Pages**: Route-specific page components
- **Layouts**: Layout wrapper components
- **API**: Service layer for backend communication

### State Management
- React hooks for local state
- Cookie storage for authentication
- Memory caching for tokens
- Context API for global state (if needed)

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages
- Console logging for debugging
- Graceful fallbacks for failed operations

### Performance
- Lazy loading for routes
- Memo optimization for expensive components
- Efficient re-rendering patterns
- Optimized bundle sizes

### Security Best Practices
- Never store sensitive data in localStorage
- Use HttpOnly cookies for tokens
- Validate all user inputs
- Implement proper error boundaries

## Testing

### Manual Testing Scenarios
1. **Authentication Flow**:
   - Register new user
   - Login with valid credentials
   - Login with invalid credentials
   - Page refresh while logged in
   - Token expiration handling
   - Logout functionality

2. **Route Protection**:
   - Access protected routes without authentication
   - Navigation after login
   - Browser back/forward navigation

3. **Form Validation**:
   - Submit forms with valid data
   - Submit forms with invalid data
   - Field validation feedback

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### Cookie Testing
- Verify HttpOnly attribute
- Check SameSite attribute
- Test cookie expiration
- Cross-tab authentication

## Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to web server
# Configure HTTPS for production
# Update API URL for production environment
```

### Production Configuration
- Enable HTTPS
- Update CORS origins
- Set secure cookie flags
- Configure CSP headers
- Enable compression

### Environment Variables
```env
# Production
VITE_API_URL=https://api.moneymanager.com/api
VITE_ENVIRONMENT=production
```

## Troubleshooting

### Common Issues
1. **Login Redirect Loop**: Check token expiration and refresh logic
2. **CORS Errors**: Verify withCredentials and backend CORS settings
3. **Token Not Found**: Check cookie settings and browser storage
4. **Page Refresh Logout**: Verify token retrieval from cookies

### Debug Tools
- Browser Developer Tools (F12)
- Network tab for API requests
- Application tab for cookies
- Console for error logging

### Debug Logging
The application includes comprehensive console logging:
- Authentication flows
- Token storage operations
- API request/response cycles
- Route protection checks

## API Endpoints Reference

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/verify` - Token verification

### Protected Endpoints
- `GET /budgets` - Get user budgets
- `POST /budgets` - Create budget
- `GET /transactions` - Get user transactions
- `POST /transactions` - Create transaction
- `GET /goals` - Get user goals
- `POST /goals` - Create goal
- `GET /reports/*` - Generate reports

All protected endpoints require valid JWT tokens via Authorization header or HttpOnly cookies.

---

## Conclusion

This Money Manager application represents a modern, secure approach to financial management with a focus on user experience and security. The cookie-based authentication system provides enhanced security while maintaining seamless user experience across browser sessions and page refreshes.

The modular architecture allows for easy maintenance and feature expansion, while the comprehensive error handling and debugging features ensure a smooth development and deployment process.

For questions or support, refer to the troubleshooting section or check the console logs for detailed debugging information.
