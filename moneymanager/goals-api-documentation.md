# Money Manager - Goals API Documentation

## Overview
This document provides comprehensive documentation for the Goals API endpoints available in the Money Manager application. The Goals API allows users to create, manage, and track financial goals with extensive filtering, sorting, and progress monitoring capabilities.

## Base URL
```
/api/goals
```

## Authentication
All endpoints require JWT authentication via Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Endpoints

### 1. Get All Goals

**Endpoint:** `GET /api/goals`

**Description:** Retrieves all goals for the authenticated user with extensive filtering, sorting, and pagination options.

**Query Parameters:**
- `page` (default: 1) - Page number for pagination
- `limit` (default: 10) - Number of items per page
- `sortBy` - Field to sort by (targetDate, name, currentAmount, targetAmount, progress, createdAt)
- `sortOrder` (default: asc) - Sort direction (asc, desc)
- `status` - Filter by status (all, active, completed, overdue, paused, pending)
- `category` - Filter by category (emergency, vacation, house, car, education, retirement, other)
- `priority` - Filter by priority (all, high, medium, low)
- `search` - Search term for name and description

**Response Format:**
```json
{
  "goals": [
    {
      "id": 1,
      "name": "Buy a House",
      "description": "Save for 20% down payment",
      "targetAmount": 50000.00,
      "currentAmount": 20000.00,
      "targetDate": "2026-12-31",
      "category": "house",
      "priority": "high",
      "status": "active",
      "progress": 40.0,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-06-01T14:20:00Z",
      "icon": "fa-home",
      "tags": "home,savings,future",
      "remainingAmount": 30000.00,
      "daysRemaining": 560,
      "isOverdue": false,
      "isCompleted": false,
      "onTrack": true,
      "dailyTargetAmount": 53.57,
      "weeklyTargetAmount": 375.00,
      "monthlyTargetAmount": 1607.14
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
    "overview": {
      "totalGoals": 25,
      "activeGoals": 18,
      "completedGoals": 5,
      "overdueGoals": 2
    },
    "financial": {
      "totalTargetAmount": 150000.00,
      "totalCurrentAmount": 50000.00,
      "totalRemainingAmount": 100000.00,
      "overallProgress": 33.33
    }
  }
}
```

### 2. Get Goal Summary

**Endpoint:** `GET /api/goals/summary`

**Description:** Retrieves summary statistics for the user's goals.

**Response Format:**
```json
{
  "overview": {
    "totalGoals": 25,
    "activeGoals": 18,
    "completedGoals": 5,
    "overdueGoals": 2
  },
  "financial": {
    "totalTargetAmount": 150000.00,
    "totalCurrentAmount": 50000.00,
    "totalRemainingAmount": 100000.00,
    "overallProgress": 33.33
  },
  "categories": [
    {
      "name": "house",
      "count": 3,
      "targetAmount": 80000.00,
      "currentAmount": 25000.00,
      "progress": 31.25
    },
    {
      "name": "emergency",
      "count": 1,
      "targetAmount": 10000.00,
      "currentAmount": 6000.00,
      "progress": 60.00
    }
  ],
  "priorities": [
    {
      "name": "high",
      "count": 7,
      "totalAmount": 70000.00
    },
    {
      "name": "medium",
      "count": 12,
      "totalAmount": 60000.00
    },
    {
      "name": "low",
      "count": 6,
      "totalAmount": 20000.00
    }
  ]
}
```

### 3. Get Goal Categories

**Endpoint:** `GET /api/goals/categories`

**Description:** Retrieves all available goal categories with counts.

**Response Format:**
```json
{
  "categories": [
    { "id": "emergency", "displayName": "Emergency Fund", "count": 1 },
    { "id": "vacation", "displayName": "Travel & Vacation", "count": 5 },
    { "id": "house", "displayName": "House", "count": 3 },
    { "id": "car", "displayName": "Car", "count": 2 },
    { "id": "education", "displayName": "Education", "count": 4 },
    { "id": "retirement", "displayName": "Retirement", "count": 1 },
    { "id": "other", "displayName": "Other", "count": 9 }
  ]
}
```

### 4. Get Goal By ID

**Endpoint:** `GET /api/goals/{id}`

**Description:** Retrieves a specific goal by ID.

**Response Format:**
```json
{
  "goal": {
    "id": 1,
    "name": "Buy a House",
    "description": "Save for 20% down payment",
    "targetAmount": 50000.00,
    "currentAmount": 20000.00,
    "targetDate": "2026-12-31",
    "category": "house",
    "priority": "high",
    "status": "active",
    "progress": 40.0,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-06-01T14:20:00Z",
    "icon": "fa-home",
    "tags": "home,savings,future",
    "remainingAmount": 30000.00,
    "daysRemaining": 560,
    "isOverdue": false,
    "isCompleted": false,
    "onTrack": true,
    "contributions": [
      {
        "id": 101,
        "amount": 5000.00,
        "description": "Initial deposit",
        "date": "2025-01-15T10:30:00Z"
      },
      {
        "id": 102,
        "amount": 1000.00,
        "description": "Monthly contribution",
        "date": "2025-02-15T14:20:00Z"
      }
    ]
  }
}
```

### 5. Create Goal

**Endpoint:** `POST /api/goals`

**Description:** Creates a new financial goal.

**Request Body:**
```json
{
  "name": "Buy a Car",
  "description": "Save for a new electric vehicle",
  "targetAmount": 30000.00,
  "currentAmount": 5000.00,
  "targetDate": "2026-01-15",
  "category": "car",
  "priority": "medium",
  "icon": "fa-car"
}
```

**Required Fields:**
- `name` - Goal name (must be unique per user)
- `targetAmount` - Target amount to save
- `targetDate` - Target completion date (must be in future)

**Optional Fields:**
- `description` - Detailed description
- `currentAmount` - Current amount saved (default: 0)
- `category` - Category (default: "other")
- `priority` - Priority level (high, medium, low) (default: "medium")
- `icon` - Icon class (default: "fa-bullseye")
- `tags` - Comma-separated tags

**Response Format:**
```json
{
  "success": true,
  "message": "Goal created successfully",
  "goal": {
    "id": 26,
    "name": "Buy a Car",
    // Other goal properties...
  }
}
```

### 6. Update Goal

**Endpoint:** `PUT /api/goals/{id}`

**Description:** Updates an existing goal.

**Request Body:**
```json
{
  "name": "Buy a Car",
  "description": "Updated description",
  "targetAmount": 35000.00,
  "targetDate": "2026-06-15",
  "category": "car",
  "priority": "high"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Goal updated successfully",
  "goal": {
    "id": 26,
    "name": "Buy a Car",
    // Updated goal properties...
  }
}
```

### 7. Delete Goal

**Endpoint:** `DELETE /api/goals/{id}`

**Description:** Deletes a goal.

**Response Format:**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

### 8. Add Contribution

**Endpoint:** `POST /api/goals/{id}/contribute`

**Description:** Adds funds to a goal.

**Request Body:**
```json
{
  "amount": 500.00,
  "description": "Monthly contribution",
  "date": "2025-06-19"
}
```

**Required Fields:**
- `amount` - Contribution amount (must be positive)

**Optional Fields:**
- `description` - Contribution description
- `date` - Contribution date (default: current date)

**Response Format:**
```json
{
  "success": true,
  "message": "Contribution added successfully",
  "goal": {
    "id": 26,
    "name": "Buy a Car",
    "currentAmount": 5500.00,
    "progress": 15.71,
    // Other updated goal properties...
  },
  "contribution": {
    "id": 103,
    "amount": 500.00,
    "description": "Monthly contribution",
    "date": "2025-06-19T00:00:00Z"
  }
}
```

### 9. Get Goal Contributions

**Endpoint:** `GET /api/goals/{id}/contributions`

**Description:** Retrieves all contributions for a specific goal.

**Query Parameters:**
- `page` (default: 1) - Page number for pagination
- `limit` (default: 10) - Number of items per page
- `sortBy` (default: "date") - Field to sort by (date, amount)
- `sortOrder` (default: "desc") - Sort direction (asc, desc)

**Response Format:**
```json
{
  "contributions": [
    {
      "id": 102,
      "amount": 1000.00,
      "description": "Monthly contribution",
      "date": "2025-02-15T14:20:00Z"
    },
    {
      "id": 101,
      "amount": 5000.00,
      "description": "Initial deposit",
      "date": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 2,
    "itemsPerPage": 10
  },
  "total": 6000.00
}
```

### 10. Change Goal Status

**Endpoint:** `PATCH /api/goals/{id}/status`

**Description:** Updates the status of a goal.

**Request Body:**
```json
{
  "status": "paused",
  "reason": "Temporarily redirecting funds to emergency fund"
}
```

**Valid Status Values:**
- `active` - Active goal
- `paused` - Temporarily paused
- `completed` - Manually marked as completed
- `cancelled` - Cancelled goal

**Response Format:**
```json
{
  "success": true,
  "message": "Goal status updated successfully",
  "goal": {
    "id": 26,
    "status": "paused",
    // Other goal properties...
  }
}
```

### 11. Get Goal Analytics

**Endpoint:** `GET /api/goals/analytics`

**Description:** Retrieves advanced analytics for goals.

**Query Parameters:**
- `startDate` - Start date for analytics period (YYYY-MM-DD)
- `endDate` - End date for analytics period (YYYY-MM-DD)

**Response Format:**
```json
{
  "monthlySavings": [
    { "month": "2025-01", "amount": 8000.00 },
    { "month": "2025-02", "amount": 6500.00 },
    { "month": "2025-03", "amount": 7200.00 }
  ],
  "categoryDistribution": [
    { "category": "house", "percentage": 40.0 },
    { "category": "car", "percentage": 20.0 },
    { "category": "vacation", "percentage": 15.0 },
    { "category": "other", "percentage": 25.0 }
  ],
  "completionRate": {
    "completed": 5,
    "total": 25,
    "percentage": 20.0
  },
  "averageProgress": 33.5,
  "projectedCompletions": [
    { "month": "2025-07", "count": 2 },
    { "month": "2025-08", "count": 1 },
    { "month": "2025-12", "count": 3 }
  ]
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": true,
  "message": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required or invalid token
- `GOAL_NOT_FOUND` - Goal with specified ID not found
- `INVALID_REQUEST` - Invalid request parameters
- `VALIDATION_ERROR` - Validation failed for input data
- `DATABASE_ERROR` - Database error occurred
- `DUPLICATE_NAME` - Goal name already exists
- `INSUFFICIENT_PRIVILEGES` - User doesn't have permission
- `GOAL_COMPLETED` - Cannot modify completed goal
- `INVALID_STATUS` - Invalid status value provided

## Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request or validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient privileges
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate name)
- `500 Internal Server Error` - Server error

## Frontend Integration Examples

### Fetching Goals with Filtering
```javascript
// Goals.jsx
const fetchGoals = async () => {
  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: itemsPerPage,
      status: filters.status !== 'all' ? filters.status : '',
      category: filters.category !== 'all' ? filters.category : '',
      priority: filters.priority !== 'all' ? filters.priority : '',
      search: filters.search || '',
      sortBy: filters.sortBy || 'targetDate',
      sortOrder: filters.sortOrder || 'asc'
    });

    const response = await fetch(`/api/goals?${params}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setGoals(data.goals);
    setPagination(data.pagination);
    setSummary(data.summary);
  } catch (error) {
    console.error('Error fetching goals:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Creating a New Goal
```javascript
// AddGoalForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: goalName,
        description: description,
        targetAmount: parseFloat(targetAmount),
        currentAmount: initialAmount ? parseFloat(initialAmount) : 0,
        targetDate: targetDate,
        category: category,
        priority: priority,
        icon: selectedIcon
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create goal');
    }
    
    const data = await response.json();
    onSubmit(data.goal);
    onClose();
  } catch (error) {
    setError(error.message);
  }
};
```

### Adding Funds to a Goal
```javascript
// AddFundsForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch(`/api/goals/${goalId}/contribute`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        description: description,
        date: contributionDate
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add contribution');
    }
    
    const data = await response.json();
    onSubmit(data);
    onClose();
  } catch (error) {
    setError(error.message);
  }
};
```

This API documentation provides all the necessary information for integrating the frontend Goals component with your existing backend services.
