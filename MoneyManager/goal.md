# Goals System Documentation

## Overview
The Goals system is a comprehensive financial goal tracking feature that allows users to create, manage, and monitor their savings goals with advanced filtering, sorting, and progress tracking capabilities.

## File Structure
```
src/
├── pages/
│   └── Goals.jsx                 # Main goals page component
├── components/
│   ├── AddGoalForm.jsx          # Goal creation modal
│   └── AddFundsForm.jsx         # Funds contribution modal
├── api/
│   ├── services.js              # GoalService class with API methods
│   └── endpoints.js             # API endpoint definitions
└── hooks/
    └── useDashboard.js          # Dashboard hooks (includes goals data)
```

## Features

### 1. Goal Management
- **Create Goals**: Users can create financial goals with target amounts and dates
- **View Goals**: Display all goals in a responsive grid layout
- **Add Funds**: Contribute money towards specific goals
- **Progress Tracking**: Visual progress bars and percentage completion
- **Status Management**: Automatic status calculation (Active, Completed, Overdue, etc.)

### 2. Advanced Filtering & Search
- **Search**: Text search across goal names and descriptions
- **Status Filter**: Filter by goal status (All, Active, Completed, Overdue, Paused, Pending)
- **Category Filter**: Filter by goal categories (Emergency Fund, Vacation, House, Car, etc.)
- **Priority Filter**: Filter by priority levels (All, High, Medium, Low)
- **Active Filters Display**: Visual chips showing currently applied filters

### 3. Sorting Options
- **Target Date**: Sort by earliest or latest target dates
- **Amount**: Sort by highest or lowest target amounts
- **Progress**: Sort by completion percentage
- **Name**: Alphabetical sorting (A-Z or Z-A)
- **Date Created**: Sort by creation date (newest or oldest)

### 4. Data Visualization
- **Progress Bars**: Color-coded progress indicators
- **Status Badges**: Visual status indicators with appropriate colors
- **Summary Cards**: Overview statistics (Active Goals, Completed, Overall Progress, Total Saved)
- **Priority Indicators**: Visual priority level displays

## Components Documentation

### Goals.jsx (Main Component)

#### State Management
```javascript
// Goal data
const [goals, setGoals] = useState([]);
const [summary, setSummary] = useState(null);
const [categories, setCategories] = useState([]);

// UI state
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showAddGoal, setShowAddGoal] = useState(false);
const [showAddFunds, setShowAddFunds] = useState(false);
const [selectedGoal, setSelectedGoal] = useState(null);

// Filtering and sorting
const [filters, setFilters] = useState({
  status: 'all',
  category: 'all', 
  priority: 'all',
  search: '',
  sortBy: 'targetDate',
  sortOrder: 'asc'
});

// Pagination
const [pagination, setPagination] = useState({
  currentPage: 1,
  limit: 12,
  totalPages: 1,
  totalItems: 0
});
```

#### Key Functions

##### fetchGoals()
Fetches goals from the API with filtering and sorting parameters.
```javascript
const fetchGoals = async () => {
  // Builds API parameters based on current filters
  // Handles different response formats
  // Applies client-side filtering as fallback
  // Updates goals state and pagination
}
```

##### handleFilterChange(key, value)
Updates filter state and resets pagination when filters change.

##### resetFilters()
Resets all filters to default values.

##### handleAddGoal(newGoal)
Handles goal creation and refreshes data.

##### handleAddFunds(fundData)
Handles fund contributions to existing goals.

#### UI Sections

1. **Header Section**: Title, description, and summary cards
2. **Filters and Controls**: Search, filters, sorting, and action buttons
3. **Results Summary**: Shows count and current sorting method
4. **Goals Grid**: Responsive grid of goal cards
5. **Pagination**: Page navigation controls
6. **Modals**: Goal creation and fund addition forms

### AddGoalForm.jsx
Modal component for creating new financial goals.

**Props:**
- `onSubmit(goalData)`: Callback when goal is created
- `onClose()`: Callback to close modal
- `categories[]`: Available goal categories

### AddFundsForm.jsx
Modal component for adding funds to existing goals.

**Props:**
- `goalName`: Name of the goal receiving funds
- `goalId`: ID of the goal
- `onSubmit(fundData)`: Callback when funds are added
- `onClose()`: Callback to close modal

## API Integration

### GoalService Class
Located in `src/api/services.js`

#### Methods

##### getAll(queryParams = {})
Retrieves all goals with optional filtering and sorting.

**Parameters:**
```javascript
{
  page: 1,              // Page number for pagination
  limit: 12,            // Items per page
  status: 'all',        // Filter by status
  category: 'all',      // Filter by category
  priority: 'all',      // Filter by priority
  search: '',           // Search term
  sortBy: 'targetDate', // Sort field
  sortOrder: 'asc'      // Sort direction
}
```

**Response Format:**
```javascript
{
  goals: [
    {
      id: "goal_id",
      name: "Goal Name",
      description: "Goal description",
      targetAmount: 10000,
      currentAmount: 2500,
      targetDate: "2025-12-31",
      category: "vacation",
      priority: "high",
      status: "active",
      progress: 25.0,
      createdAt: "2025-01-01T00:00:00Z"
    }
  ],
  pagination: {
    currentPage: 1,
    totalPages: 3,
    totalItems: 30,
    itemsPerPage: 12
  }
}
```

##### getSummary(queryParams = {})
Retrieves goal summary statistics.

**Response Format:**
```javascript
{
  overview: {
    activeGoals: 5,
    completedGoals: 2,
    totalGoals: 7
  },
  financial: {
    totalCurrentAmount: 15000,
    totalTargetAmount: 50000,
    overallProgress: 30.0
  }
}
```

##### getCategories()
Retrieves available goal categories.

**Response Format:**
```javascript
{
  categories: [
    { id: 1, name: "emergency", displayName: "Emergency Fund" },
    { id: 2, name: "vacation", displayName: "Travel & Vacation" },
    { id: 3, name: "house", displayName: "House" },
    { id: 4, name: "car", displayName: "Car" },
    { id: 5, name: "education", displayName: "Education" },
    { id: 6, name: "retirement", displayName: "Retirement" },
    { id: 7, name: "other", displayName: "Other" }
  ]
}
```

##### contribute(id, contributionData)
Adds funds to a specific goal.

**Parameters:**
```javascript
{
  amount: 500,
  description: "Monthly contribution",
  date: "2025-06-19"
}
```

### API Endpoints
Located in `src/api/endpoints.js`

```javascript
export const GOAL_ENDPOINTS = {
  GET_ALL: '/goals',
  CREATE: '/goals',
  GET_BY_ID: (id) => `/goals/${id}`,
  UPDATE: (id) => `/goals/${id}`,
  DELETE: (id) => `/goals/${id}`,
  CONTRIBUTE: (id) => `/goals/${id}/contribute`,
  GET_CONTRIBUTIONS: (id) => `/goals/${id}/contributions`,
  SUMMARY: '/goals/summary',
  ANALYTICS: '/goals/analytics',
  CATEGORIES: '/goals/categories'
};
```

## Backend Integration Requirements

### Database Schema
```sql
CREATE TABLE goals (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  category VARCHAR(100),
  priority ENUM('low', 'medium', 'high'),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_status (user_id, status),
  INDEX idx_user_category (user_id, category),
  INDEX idx_target_date (target_date)
);
```

### API Implementation Example (Node.js/Express)

```javascript
// GET /goals - Retrieve goals with filtering
router.get('/goals', async (req, res) => {
  const {
    page = 1,
    limit = 12,
    status,
    category,
    priority,
    search,
    sortBy = 'targetDate',
    sortOrder = 'asc'
  } = req.query;

  try {
    // Build filters
    const filters = { user_id: req.user.id };
    
    if (status && status !== 'all') filters.status = status;
    if (category && category !== 'all') filters.category = category;
    if (priority && priority !== 'all') filters.priority = priority;
    
    // Search functionality
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const goals = await Goal.find(filters)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Goal.countDocuments(filters);

    res.json({
      goals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});
```

## Status Calculation Logic

Goals have automatic status calculation based on:

1. **Completed**: Progress >= 100%
2. **Overdue**: Target date passed and progress < 100%
3. **Active**: Current date < target date and progress < 100%
4. **Paused**: Manually set status
5. **Pending**: Newly created goals

## Color Coding System

### Status Colors
- **Completed**: Green (`bg-green-100 text-green-800`)
- **Active**: Blue (`bg-blue-100 text-blue-800`)
- **Overdue**: Red (`bg-red-100 text-red-800`)
- **Paused**: Yellow (`bg-yellow-100 text-yellow-800`)
- **Pending**: Gray (`bg-gray-100 text-gray-800`)

### Priority Colors
- **High**: Red (`text-red-600`)
- **Medium**: Yellow (`text-yellow-600`)
- **Low**: Green (`text-green-600`)

### Progress Bar Colors
- **100%**: Green (`bg-green-500`)
- **75-99%**: Blue (`bg-blue-500`)
- **50-74%**: Yellow (`bg-yellow-500`)
- **0-49%**: Gray (`bg-gray-400`)

## Responsive Design

The Goals page is fully responsive with:
- **Mobile**: Single column grid
- **Tablet**: Two column grid
- **Desktop**: Three column grid
- **Large screens**: Maintains max width with centered content

## Performance Optimizations

1. **Efficient Re-rendering**: useEffect dependencies properly managed
2. **Client-side Fallbacks**: Filtering works even if API doesn't support it
3. **Pagination**: Reduces data load for large goal lists
4. **Debounced Search**: Prevents excessive API calls
5. **Error Handling**: Graceful degradation with multiple API strategies

## Future Enhancements

1. **Goal Templates**: Pre-defined goal templates for common scenarios
2. **Recurring Contributions**: Automatic scheduled contributions
3. **Goal Sharing**: Share goals with family members
4. **Achievement System**: Badges and rewards for completed goals
5. **Goal Analytics**: Detailed progress charts and predictions
6. **Export/Import**: Backup and restore goal data
7. **Notifications**: Reminders and milestone alerts

## Testing Considerations

1. **Filter Combinations**: Test all filter combinations
2. **Sorting**: Verify sorting works correctly for all fields
3. **Pagination**: Test navigation and state preservation
4. **API Failures**: Test graceful degradation
5. **Empty States**: Test UI with no goals
6. **Large Datasets**: Performance testing with many goals
7. **Mobile Responsiveness**: Test on various screen sizes

## Error Handling

The system includes comprehensive error handling:
- **API Failures**: Multiple fallback strategies
- **Network Issues**: Graceful error messages
- **Invalid Data**: Form validation and sanitization
- **Empty States**: Helpful empty state messaging
- **Loading States**: User feedback during operations

This documentation covers the complete Goals system implementation, providing developers with all necessary information for maintenance, extension, and integration.
