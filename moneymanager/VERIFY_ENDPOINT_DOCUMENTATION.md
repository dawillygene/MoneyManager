# `/api/auth/verify` Endpoint Documentation

## Overview
The `/api/auth/verify` endpoint is designed to validate refresh tokens stored in HTTP-only cookies and return new access tokens. This endpoint enables seamless token refresh without requiring manual token management from the frontend.

## Endpoint Details

### **HTTP Method**: `GET`
### **URL**: `/api/auth/verify`
### **Authentication**: Cookie-based (refreshToken)

## Request Specification

### Headers
No special headers required. The endpoint automatically reads the refresh token from HTTP-only cookies.

### Cookies (Required)
- **refreshToken**: The refresh token stored in an HTTP-only cookie
  - **Type**: String (JWT)
  - **Source**: Automatically set by previous login/register calls
  - **Security**: HttpOnly, SameSite=Lax

### Request Body
**None** - This endpoint does not require any request body.

### Frontend Request Example
```javascript
// Simple GET request with credentials to include cookies
const response = await fetch('http://localhost:8080/api/auth/verify', {
  method: 'GET',
  credentials: 'include' // Essential: includes HTTP-only cookies
});

const data = await response.json();
```

## Response Specification

### Success Response (200 OK)
```json
{
  "valid": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwidXNlcklkIjoiMSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTcxNzIwMDAwMCwiZXhwIjoxNzE3MjAwOTAwfQ.signature",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzE3MjAwMDAwLCJleHAiOjE3MTc4MDQ4MDB9.signature",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Response Fields
- **valid** (boolean): Always `true` for successful responses
- **accessToken** (string): New JWT access token (15 minutes expiration)
- **refreshToken** (string): New JWT refresh token (7 days expiration)
- **user** (object): User information
  - **id** (number): User's unique identifier
  - **email** (string): User's email address
  - **name** (string): User's full name

### Error Responses

#### 401 Unauthorized - Missing Refresh Token
```json
{
  "error": true,
  "message": "No refresh token found in cookies",
  "code": "MISSING_REFRESH_TOKEN"
}
```

#### 401 Unauthorized - Invalid Refresh Token
```json
{
  "error": true,
  "message": "Invalid refresh token",
  "code": "INVALID_REFRESH_TOKEN"
}
```

#### 401 Unauthorized - Token Verification Failed
```json
{
  "error": true,
  "message": "Token verification failed: [specific error message]",
  "code": "VERIFICATION_FAILED"
}
```

## Behavior & Security

### What the Endpoint Does
1. **Extracts Refresh Token**: Reads `refreshToken` from HTTP-only cookies
2. **Validates Token**: Verifies the JWT signature and expiration
3. **Database Verification**: Compares against stored refresh token in database
4. **Generates New Tokens**: Creates fresh access and refresh tokens
5. **Updates Storage**: Stores new refresh token in database
6. **Sets Cookies**: Updates HTTP-only cookies with new tokens
7. **Returns Response**: Provides new access token and user info

### Security Features
- **HttpOnly Cookies**: Tokens stored in HttpOnly cookies prevent XSS attacks
- **Database Validation**: Refresh tokens are verified against server-side storage
- **Token Rotation**: New refresh token generated on each verification
- **Automatic Cleanup**: Invalid/expired tokens are handled gracefully

### Cookie Management
The endpoint automatically sets new cookies with these properties:
```
Set-Cookie: accessToken=<new_token>; HttpOnly; Max-Age=900; Path=/; SameSite=Lax
Set-Cookie: refreshToken=<new_token>; HttpOnly; Max-Age=604800; Path=/; SameSite=Lax
```

## Frontend Integration

### Basic Usage
```javascript
async function verifyAndRefreshToken() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/verify', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // New access token available
      console.log('New access token:', data.accessToken);
      
      // User information
      console.log('User:', data.user);
      
      // Tokens are automatically stored in cookies
      return data.accessToken;
    } else {
      const error = await response.json();
      console.error('Verification failed:', error.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}
```

### Automatic Token Refresh Pattern
```javascript
// Create an interceptor for automatic token refresh
async function fetchWithTokenRefresh(url, options = {}) {
  // First attempt
  let response = await fetch(url, {
    ...options,
    credentials: 'include'
  });
  
  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const newToken = await verifyAndRefreshToken();
    
    if (newToken) {
      // Retry original request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        },
        credentials: 'include'
      });
    }
  }
  
  return response;
}
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setAccessToken(data.accessToken);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  return { user, accessToken, loading, verifyToken };
}
```

## Use Cases

### 1. Application Startup
Call this endpoint when your application loads to check if the user is still authenticated:
```javascript
// On app startup
const token = await verifyAndRefreshToken();
if (token) {
  // User is authenticated, proceed to dashboard
  redirectTo('/dashboard');
} else {
  // User needs to login
  redirectTo('/login');
}
```

### 2. Protected Route Guard
```javascript
// Route guard component
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyAndRefreshToken()
      .then(token => {
        setIsAuthenticated(!!token);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}
```

### 3. API Request Interceptor
```javascript
// Axios interceptor example
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const newToken = await verifyAndRefreshToken();
      if (newToken) {
        // Retry the failed request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

## Flow Diagram

```
┌─────────────────┐    GET /api/auth/verify     ┌──────────────────┐
│   Frontend      │ ─────────────────────────► │   Backend        │
│                 │   (cookies included)        │                  │
└─────────────────┘                             └──────────────────┘
                                                          │
                                                          ▼
                                                ┌──────────────────┐
                                                │ Extract refresh  │
                                                │ token from       │
                                                │ cookies          │
                                                └──────────────────┘
                                                          │
                                                          ▼
                                                ┌──────────────────┐
                                                │ Validate JWT &   │
                                                │ check database   │
                                                └──────────────────┘
                                                          │
                                                          ▼
                                                ┌──────────────────┐
                                                │ Generate new     │
                                                │ access & refresh │
                                                │ tokens           │
                                                └──────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐  New tokens + user info    ┌──────────────────┐
│   Frontend      │ ◄───────────────────────── │ Set cookies &    │
│   (tokens in    │                             │ return response  │
│   cookies)      │                             │                  │
└─────────────────┘                             └──────────────────┘
```

## Testing

### Manual Testing with cURL
```bash
# First login to get cookies
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Then verify using the stored cookies
curl -X GET http://localhost:8080/api/auth/verify \
  -b cookies.txt \
  -v
```

### Browser Testing
1. Login through your frontend application
2. Open browser developer tools
3. Check Application/Storage tab for HTTP-only cookies
4. Call the verify endpoint and observe the response
5. Verify that new cookies are set with updated expiration times

## Common Issues & Troubleshooting

### Issue: "No refresh token found in cookies"
**Cause**: Cookies not being sent with request
**Solution**: Ensure `credentials: 'include'` is set in fetch options

### Issue: "Invalid refresh token"
**Cause**: Token expired or tampered with
**Solution**: Redirect user to login page

### Issue: CORS errors
**Cause**: Frontend origin not allowed
**Solution**: Verify CORS configuration includes your frontend URL

### Issue: Cookies not being set
**Cause**: Secure/SameSite cookie settings in production
**Solution**: Adjust cookie settings for your deployment environment

## Related Endpoints

- **POST /api/auth/login**: Initial authentication and token generation
- **POST /api/auth/register**: User registration with automatic token generation
- **POST /api/auth/refresh**: Alternative refresh method using request body
- **POST /api/auth/logout**: Token invalidation and cookie cleanup

This endpoint is crucial for maintaining seamless user authentication in your Money Manager application, providing automatic token refresh without user intervention.