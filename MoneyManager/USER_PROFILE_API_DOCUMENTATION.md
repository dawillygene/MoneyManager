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

**Usage**:
```javascript
import { userService } from '../api';

const profile = await userService.getProfile();
console.log(profile.name); // "John Doe"
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

**Usage**:
```javascript
const updatedProfile = await userService.updateProfile({
  name: "John Smith",
  email: "johnsmith@example.com"
});

// Helper method for basic info
await userService.updateBasicInfo("John Smith", "johnsmith@example.com");

// Helper method for contact info
await userService.updateContactInfo("+1987654321", {
  street: "456 Oak Ave",
  city: "Los Angeles",
  state: "CA",
  zipCode: "90210"
});
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

**Usage**:
```javascript
await userService.deleteAccount({
  password: "currentpassword",
  confirmation: "DELETE_MY_ACCOUNT"
});
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

**Usage**:
```javascript
// Change password
await userService.changePassword({
  currentPassword: "oldpassword",
  newPassword: "newstrongpassword123!",
  confirmPassword: "newstrongpassword123!"
});

// Validate password strength
const validation = userService.validatePasswordStrength("newstrongpassword123!");
console.log(validation);
// Output: {
//   valid: true,
//   length: true,
//   hasUpperCase: true,
//   hasLowerCase: true,
//   hasNumbers: true,
//   hasSpecialChar: true
// }
```

---

## User Preferences

### GET /user/preferences
**Description**: Get user preferences and settings.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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

**Usage**:
```javascript
const preferences = await userService.getPreferences();
console.log(preferences.currency); // "USD"
```

---

### PUT /user/preferences
**Description**: Update user preferences and settings.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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

**Usage**:
```javascript
await userService.updatePreferences({
  currency: "EUR",
  timezone: "Europe/London",
  theme: "dark"
});

// Helper method for financial preferences
await userService.updateFinancialInfo("EUR", "Europe/London");
```

---

## Security & Session Management

### GET /user/sessions
**Description**: Get all active user sessions.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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
    },
    {
      "id": "session_456",
      "deviceInfo": "Safari on iPhone",
      "ipAddress": "192.168.1.101",
      "location": "New York, NY",
      "lastActivity": "2025-06-10T15:20:00Z",
      "current": false
    }
  ]
}
```

**Usage**:
```javascript
const sessions = await userService.getSessions();
console.log(sessions.sessions.length); // Number of active sessions
```

---

### DELETE /user/sessions/{sessionId}/revoke
**Description**: Revoke a specific session.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

**Path Parameters**:
- `sessionId`: The ID of the session to revoke

**Response**:
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

**Usage**:
```javascript
await userService.revokeSession("session_456");
```

---

### DELETE /user/sessions/revoke-all
**Description**: Revoke all sessions except the current one.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

**Response**:
```json
{
  "success": true,
  "message": "All other sessions revoked successfully",
  "revokedCount": 3
}
```

**Usage**:
```javascript
await userService.revokeAllSessions();
```

---

## Two-Factor Authentication

### POST /user/2fa/enable
**Description**: Enable two-factor authentication for the user.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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

**Usage**:
```javascript
const result = await userService.enable2FA({
  secret: "JBSWY3DPEHPK3PXP",
  token: "123456"
});
console.log(result.backupCodes); // Save these backup codes
```

---

### POST /user/2fa/disable
**Description**: Disable two-factor authentication.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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

**Usage**:
```javascript
await userService.disable2FA({
  password: "currentpassword",
  token: "123456"
});
```

---

### POST /user/2fa/verify
**Description**: Verify a 2FA token.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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

**Usage**:
```javascript
const isValid = await userService.verify2FA({
  token: "123456"
});
```

---

## Avatar Management

### POST /user/avatar
**Description**: Upload a new profile picture.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)
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

**Usage**:
```javascript
const fileInput = document.getElementById('avatar-input');
const file = fileInput.files[0];

const result = await userService.uploadAvatar(file);
console.log(result.avatar.url); // New avatar URL
```

---

### DELETE /user/avatar
**Description**: Remove the current profile picture.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

**Response**:
```json
{
  "success": true,
  "message": "Avatar removed successfully"
}
```

**Usage**:
```javascript
await userService.deleteAvatar();
```

---

## Email Verification

### POST /user/verify-email
**Description**: Verify user's email address with a token.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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

**Usage**:
```javascript
await userService.verifyEmail("verification_token_123");
```

---

### POST /user/resend-verification
**Description**: Resend email verification.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

**Response**:
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

**Usage**:
```javascript
await userService.resendVerification();
```

---

## Privacy & Data Management

### GET /user/privacy
**Description**: Get user privacy settings.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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

**Usage**:
```javascript
const privacy = await userService.getPrivacySettings();
console.log(privacy.dataProcessing.analytics); // true
```

---

### PUT /user/privacy
**Description**: Update privacy settings.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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

**Usage**:
```javascript
await userService.updatePrivacySettings({
  dataProcessing: {
    analytics: false,
    marketing: false,
    thirdParty: false
  }
});
```

---

### POST /user/export-data
**Description**: Export all user data (GDPR compliance).

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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

**Usage**:
```javascript
const exportData = await userService.exportUserData({
  format: "json",
  includeTransactions: true,
  includeBudgets: true,
  includeGoals: true
});

// Create download link
const url = window.URL.createObjectURL(exportData);
const a = document.createElement('a');
a.href = url;
a.download = 'user-data-export.zip';
a.click();
```

---

## Activity & Audit Logs

### GET /user/activity
**Description**: Get user activity log.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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
    },
    {
      "id": 2,
      "action": "password_changed",
      "description": "Password was changed",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-06-10T14:20:00Z"
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

**Usage**:
```javascript
const activity = await userService.getActivityLog({
  page: 1,
  limit: 10,
  startDate: "2025-06-01",
  endDate: "2025-06-11"
});
```

---

### GET /user/login-history
**Description**: Get user login history.

**Headers**: 
- `Authorization: Bearer <token>` (automatic via cookies)

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
    },
    {
      "id": 2,
      "ipAddress": "192.168.1.101",
      "location": "New York, NY",
      "device": "Safari on iPhone",
      "success": false,
      "failureReason": "Invalid password",
      "timestamp": "2025-06-10T22:30:00Z"
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

**Usage**:
```javascript
const loginHistory = await userService.getLoginHistory({
  page: 1,
  limit: 10
});
```

---

## Validation Helpers

The UserService includes built-in validation methods:

### Password Strength Validation
```javascript
const validation = userService.validatePasswordStrength("MyPassword123!");

// Returns:
{
  valid: true,
  length: true,        // >= 8 characters
  hasUpperCase: true,  // Contains A-Z
  hasLowerCase: true,  // Contains a-z
  hasNumbers: true,    // Contains 0-9
  hasSpecialChar: true // Contains special characters
}
```

### Email Validation
```javascript
const isValid = userService.validateEmail("user@example.com");
// Returns: true or false
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
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

## Frontend Integration

### Component Example
```jsx
import React, { useState, useEffect } from 'react';
import { userService } from '../api';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (profileData) => {
    try {
      const updated = await userService.updateProfile(profileData);
      setProfile(updated.user);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Profile: {profile.name}</h2>
      <p>Email: {profile.email}</p>
      {/* Profile form components */}
    </div>
  );
};
```

### Hook Example
```jsx
import { useState, useEffect } from 'react';
import { userService } from '../api';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setProfile(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (profileData) => {
    try {
      const updated = await userService.updateProfile(profileData);
      setProfile(updated.user);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: () => fetchProfile()
  };
};
```

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

## Testing

### Unit Tests Example
```javascript
import { userService } from '../api';

describe('UserService', () => {
  test('should validate strong password', () => {
    const result = userService.validatePasswordStrength('StrongPass123!');
    expect(result.valid).toBe(true);
  });

  test('should validate email format', () => {
    expect(userService.validateEmail('test@example.com')).toBe(true);
    expect(userService.validateEmail('invalid-email')).toBe(false);
  });
});
```

### Integration Tests
```javascript
describe('User Profile API', () => {
  test('should get user profile', async () => {
    const profile = await userService.getProfile();
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('email');
  });

  test('should update profile', async () => {
    const result = await userService.updateProfile({
      name: 'Updated Name'
    });
    expect(result.success).toBe(true);
    expect(result.user.name).toBe('Updated Name');
  });
});
```

This comprehensive API documentation provides everything needed to implement and use the User Profile Management system in your Money Manager application.