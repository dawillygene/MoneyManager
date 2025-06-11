# User Profile Management API Documentation

## Overview
This document outlines the comprehensive User Profile Management API for the Money Manager application. The API provides secure endpoints for user profile management, security settings, preferences, and privacy controls.

## Base Configuration
- **Base URL**: `http://localhost:8080/api`
- **Authentication**: JWT Bearer tokens via HttpOnly cookies
- **Content-Type**: `application/json`
- **CORS**: `withCredentials: true` required for cookie handling

## Authentication
All endpoints require authentication via JWT tokens stored in HttpOnly cookies. The authentication is handled automatically by the frontend's cookie-based system.

---

## Core Profile Management

### GET /user/profile
**Description**: Retrieve the current user's profile information.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "avatar": "https://example.com/avatars/user1.jpg",
  "emailVerified": true,
  "twoFactorEnabled": false,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-06-11T10:30:00Z"
}
```

---

### PUT /user/update
**Description**: Update user profile information.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

**Request Body**:
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "+1987654321",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "USA"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "phone": "+1987654321",
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90210",
      "country": "USA"
    },
    "updatedAt": "2025-06-11T10:35:00Z"
  }
}
```

---

### DELETE /user/delete
**Description**: Delete the current user's account permanently.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

**Request Body** (optional):
```json
{
  "password": "currentpassword",
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Password Management

### PUT /user/change-password
**Description**: Change the user's password.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newstrongpassword123!",
  "confirmPassword": "newstrongpassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## User Preferences

### GET /user/preferences
**Description**: Get user preferences and settings.

**Response**:
```json
{
  "currency": "USD",
  "timezone": "America/New_York",
  "theme": "light",
  "language": "en",
  "dateFormat": "MM/DD/YYYY",
  "notifications": {
    "email": true,
    "push": false,
    "budgetAlerts": true,
    "goalReminders": true
  },
  "privacy": {
    "shareData": false,
    "publicProfile": false
  }
}
```

---

### PUT /user/preferences
**Description**: Update user preferences and settings.

**Request Body**:
```json
{
  "currency": "EUR",
  "timezone": "Europe/London",
  "theme": "dark",
  "language": "en",
  "dateFormat": "DD/MM/YYYY",
  "notifications": {
    "email": true,
    "push": true,
    "budgetAlerts": true,
    "goalReminders": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": {
    "currency": "EUR",
    "timezone": "Europe/London",
    "theme": "dark",
    "language": "en",
    "dateFormat": "DD/MM/YYYY",
    "notifications": {
      "email": true,
      "push": true,
      "budgetAlerts": true,
      "goalReminders": false
    }
  }
}
```

---

## Security & Session Management

### GET /user/sessions
**Description**: Get all active user sessions.

**Response**:
```json
{
  "sessions": [
    {
      "id": "session_123",
      "deviceInfo": "Chrome on Windows 10",
      "ipAddress": "192.168.1.100",
      "location": "New York, NY",
      "lastActivity": "2025-06-11T10:30:00Z",
      "current": true
    }
  ]
}
```

---

### DELETE /user/sessions/{sessionId}/revoke
**Description**: Revoke a specific session.

**Response**:
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

---

### DELETE /user/sessions/revoke-all
**Description**: Revoke all sessions except the current one.

**Response**:
```json
{
  "success": true,
  "message": "All other sessions revoked successfully",
  "revokedCount": 3
}
```

---

## Two-Factor Authentication

### POST /user/2fa/enable
**Description**: Enable two-factor authentication for the user.

**Request Body**:
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "token": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Two-factor authentication enabled successfully",
  "backupCodes": [
    "12345678",
    "87654321",
    "11223344",
    "44332211"
  ]
}
```

---

### POST /user/2fa/disable
**Description**: Disable two-factor authentication.

**Request Body**:
```json
{
  "password": "currentpassword",
  "token": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Two-factor authentication disabled successfully"
}
```

---

### POST /user/2fa/verify
**Description**: Verify a 2FA token.

**Request Body**:
```json
{
  "token": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "valid": true,
  "message": "Token verified successfully"
}
```

---

## Avatar Management

### POST /user/avatar
**Description**: Upload a new profile picture.

**Headers**: 
- `Content-Type: multipart/form-data`

**Request Body** (Form Data):
- `avatar`: Image file (JPEG, PNG, GIF, max 5MB)

**Response**:
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "avatar": {
    "url": "https://example.com/avatars/user1_new.jpg",
    "filename": "avatar_123456.jpg",
    "size": 1024000
  }
}
```

---

### DELETE /user/avatar
**Description**: Remove the current profile picture.

**Response**:
```json
{
  "success": true,
  "message": "Avatar removed successfully"
}
```

---

## Email Verification

### POST /user/verify-email
**Description**: Verify user's email address with a token.

**Request Body**:
```json
{
  "token": "verification_token_123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### POST /user/resend-verification
**Description**: Resend email verification.

**Response**:
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

## Privacy & Data Management

### GET /user/privacy
**Description**: Get user privacy settings.

**Response**:
```json
{
  "dataProcessing": {
    "analytics": true,
    "marketing": false,
    "thirdParty": false
  },
  "visibility": {
    "publicProfile": false,
    "shareTransactions": false,
    "shareGoals": false
  },
  "communications": {
    "newsletters": true,
    "productUpdates": false,
    "surveyInvitations": false
  }
}
```

---

### PUT /user/privacy
**Description**: Update privacy settings.

**Request Body**:
```json
{
  "dataProcessing": {
    "analytics": false,
    "marketing": false,
    "thirdParty": false
  },
  "visibility": {
    "publicProfile": false,
    "shareTransactions": false,
    "shareGoals": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Privacy settings updated successfully"
}
```

---

### POST /user/export-data
**Description**: Export all user data (GDPR compliance).

**Request Body**:
```json
{
  "format": "json",
  "includeTransactions": true,
  "includeBudgets": true,
  "includeGoals": true,
  "includeReports": false
}
```

**Response**: File download (ZIP archive)

---

## Activity & Audit Logs

### GET /user/activity
**Description**: Get user activity log.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `action`: Filter by action type

**Response**:
```json
{
  "activities": [
    {
      "id": 1,
      "action": "profile_updated",
      "description": "Updated profile information",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-06-11T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET /user/login-history
**Description**: Get user login history.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)

**Response**:
```json
{
  "logins": [
    {
      "id": 1,
      "ipAddress": "192.168.1.100",
      "location": "New York, NY",
      "device": "Chrome on Windows 10",
      "success": true,
      "timestamp": "2025-06-11T08:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Invalid or expired token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Rate Limiting**: Implement rate limiting on sensitive endpoints
3. **Input Validation**: Server-side validation for all inputs
4. **File Upload**: Restrict file types and sizes for avatar uploads
5. **2FA**: Strongly recommended for sensitive operations
6. **Session Management**: Regular session cleanup and monitoring
7. **Privacy**: GDPR-compliant data handling and export
8. **Audit Logging**: Comprehensive activity tracking

---

## Database Schema Updates

The implementation includes several new database tables:

### Extended User Table
```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN street VARCHAR(255);
ALTER TABLE users ADD COLUMN city VARCHAR(100);
ALTER TABLE users ADD COLUMN state VARCHAR(100);
ALTER TABLE users ADD COLUMN zip_code VARCHAR(20);
ALTER TABLE users ADD COLUMN country VARCHAR(100);
ALTER TABLE users ADD COLUMN avatar VARCHAR(500);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN backup_codes TEXT;
ALTER TABLE users ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/New_York';
ALTER TABLE users ADD COLUMN theme VARCHAR(20) DEFAULT 'light';
ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY';
ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN push_notifications BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN budget_alerts BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN goal_reminders BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN share_data BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN public_profile BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN analytics_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN marketing_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN third_party_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN share_transactions BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN share_goals BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN newsletters_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN product_updates_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN survey_invitations_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    device_info VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    location VARCHAR(255),
    last_activity DATETIME NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### User Activities Table
```sql
CREATE TABLE user_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(1000) NOT NULL,
    location VARCHAR(255),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Login History Table
```sql
CREATE TABLE login_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    location VARCHAR(255),
    device VARCHAR(1000) NOT NULL,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

This comprehensive User Profile Management API provides a complete solution for user account management, security, preferences, and privacy controls in the Money Manager application.