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
      "updatedAt": "2025-06-10T14:20:00Z"
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
    "overallProgress": 63.33
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
  "tags": ["car", "family", "transportation"]
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

#### GET /goals/{id}
Get a specific goal by ID with detailed information and contribution history.

#### PUT /goals/{id}
Update a specific goal's information.

#### DELETE /goals/{id}
Delete a specific goal and all associated contributions.

#### POST /goals/{id}/contribute
Add funds to a specific goal.

**Request Body:**
```json
{
  "amount": 250.00,
  "source": "salary",
  "notes": "Bi-weekly contribution",
  "date": "2025-06-11"
}
```

#### GET /goals/{id}/contributions
Get contribution history for a specific goal with filtering and pagination.

#### GET /goals/summary
Get comprehensive goal statistics and overview for the authenticated user.

#### GET /goals/categories
Get available goal categories with their default icons, colors, and descriptions.

#### POST /goals/bulk-contribute
Add contributions to multiple goals at once.

### Goal Status Values
- `active`: Goal is current and being worked on
- `completed`: Goal has reached 100% of target amount
- `paused`: Goal is temporarily inactive (not accepting contributions)
- `overdue`: Goal has passed target date without completion
- `cancelled`: Goal has been cancelled (soft-deleted)
- `upcoming`: Goal with future start date

### Goal Priority Values
- `low`: Nice-to-have goals with flexible timelines
- `medium`: Important goals with moderate urgency (default)
- `high`: Critical goals requiring focused attention and regular contributions

### Contribution Source Values
- `salary`: Regular employment income
- `bonus`: Work bonuses, commissions, overtime pay
- `savings`: Transfer from existing savings accounts
- `gift`: Money received as gifts
- `other`: Miscellaneous income sources

### Goal Categories
Goals can be categorized to help with organization and reporting:
- `travel`: Vacations, trips, travel experiences
- `emergency`: Emergency funds, financial security
- `transportation`: Cars, bikes, transportation needs
- `home`: House down payments, furniture, home improvements
- `education`: Courses, degrees, certifications
- `technology`: Gadgets, computers, tech equipment
- `health`: Medical expenses, fitness, wellness
- `business`: Business ventures, investments
- `entertainment`: Hobbies, entertainment, leisure
- `gifts`: Presents, special events, celebrations
- `other`: Custom or miscellaneous goals

### Error Handling for Goals

#### Goal-Specific Error Codes
- `GOAL_NOT_FOUND`: Goal with specified ID doesn't exist
- `GOAL_ALREADY_COMPLETED`: Cannot modify completed goal
- `GOAL_CONTRIBUTION_EXCEEDS_TARGET`: Contribution would exceed target amount
- `GOAL_INVALID_TARGET_DATE`: Target date must be in the future
- `GOAL_INVALID_AMOUNT`: Amount must be positive and within limits
- `GOAL_DUPLICATE_NAME`: Goal name already exists for user
- `CONTRIBUTION_NOT_FOUND`: Contribution with specified ID doesn't exist
- `CONTRIBUTION_CANNOT_MODIFY`: Contribution cannot be modified (too old)
- `BULK_CONTRIBUTION_MISMATCH`: Total amount doesn't match distribution sum

#### Example Error Responses
```json
{
  "error": true,
  "message": "Goal not found",
  "code": "GOAL_NOT_FOUND",
  "details": {
    "goalId": 999,
    "userId": 123
  }
}
```

```json
{
  "error": true,
  "message": "Contribution exceeds target amount",
  "code": "GOAL_CONTRIBUTION_EXCEEDS_TARGET",
  "details": {
    "goalId": 1,
    "contributionAmount": 500.00,
    "currentAmount": 2800.00,
    "targetAmount": 3000.00,
    "maxAllowedContribution": 200.00
  }
}
```