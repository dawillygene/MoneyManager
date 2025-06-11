// API Endpoints Configuration
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify',
};

export const USER_ENDPOINTS = {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
    DELETE_ACCOUNT: '/user/delete',
};

export const BUDGET_ENDPOINTS = {
    // Basic CRUD operations
    GET_ALL: '/budgets',
    CREATE: '/budgets',
    GET_BY_ID: (id) => `/budgets/${id}`,
    UPDATE: (id) => `/budgets/${id}`,
    DELETE: (id) => `/budgets/${id}`,
    
    // Advanced endpoints
    SUMMARY: '/budgets/summary',
    CATEGORIES: '/budgets/categories',
    ALERTS: '/budgets/alerts',
    DUPLICATE: (id) => `/budgets/duplicate/${id}`,
    BATCH_CREATE: '/budgets/batch',
    RECURRING_GENERATE: '/budgets/recurring/generate',
    ARCHIVE: (id) => `/budgets/${id}/archive`,
    RESTORE: (id) => `/budgets/${id}/restore`,
};

export const TRANSACTION_ENDPOINTS = {
    GET_ALL: '/transactions',
    CREATE: '/transactions',
    GET_BY_ID: (id) => `/transactions/${id}`,
    UPDATE: (id) => `/transactions/${id}`,
    DELETE: (id) => `/transactions/${id}`,
    GET_BY_BUDGET: (budgetId) => `/transactions/budget/${budgetId}`,
};

export const GOAL_ENDPOINTS = {
    // Basic CRUD operations
    GET_ALL: '/goals',
    CREATE: '/goals',
    GET_BY_ID: (id) => `/goals/${id}`,
    UPDATE: (id) => `/goals/${id}`,
    DELETE: (id) => `/goals/${id}`,
    
    // Contribution management
    CONTRIBUTE: (id) => `/goals/${id}/contribute`,
    GET_CONTRIBUTIONS: (id) => `/goals/${id}/contributions`,
    UPDATE_CONTRIBUTION: (id, contributionId) => `/goals/${id}/contributions/${contributionId}`,
    DELETE_CONTRIBUTION: (id, contributionId) => `/goals/${id}/contributions/${contributionId}`,
    BULK_CONTRIBUTE: '/goals/bulk-contribute',
    
    // Analytics and insights
    SUMMARY: '/goals/summary',
    ANALYTICS: '/goals/analytics',
    CATEGORIES: '/goals/categories',
};

export const REPORT_ENDPOINTS = {
    MONTHLY: '/reports/monthly',
    YEARLY: '/reports/yearly',
    CUSTOM: '/reports/custom',
    EXPORT: '/reports/export',
};


export const PUBLIC_ENDPOINTS = [
    AUTH_ENDPOINTS.LOGIN,
    AUTH_ENDPOINTS.REGISTER,
    AUTH_ENDPOINTS.REFRESH,
];