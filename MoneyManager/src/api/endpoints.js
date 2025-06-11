// API Endpoints Configuration
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify',
};

export const USER_ENDPOINTS = {
    // Profile management
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
    DELETE_ACCOUNT: '/user/delete',
    
    // Password management
    CHANGE_PASSWORD: '/user/change-password',
    
    // Profile settings
    PREFERENCES: '/user/preferences',
    UPDATE_PREFERENCES: '/user/preferences',
    
    // Security settings
    SESSIONS: '/user/sessions',
    REVOKE_SESSION: (sessionId) => `/user/sessions/${sessionId}/revoke`,
    REVOKE_ALL_SESSIONS: '/user/sessions/revoke-all',
    
    // Two-factor authentication
    ENABLE_2FA: '/user/2fa/enable',
    DISABLE_2FA: '/user/2fa/disable',
    VERIFY_2FA: '/user/2fa/verify',
    
    // Profile picture/avatar
    UPLOAD_AVATAR: '/user/avatar',
    DELETE_AVATAR: '/user/avatar',
    
    // Account verification
    VERIFY_EMAIL: '/user/verify-email',
    RESEND_VERIFICATION: '/user/resend-verification',
    
    // Data export/privacy
    EXPORT_DATA: '/user/export-data',
    PRIVACY_SETTINGS: '/user/privacy',
    
    // Activity logs
    ACTIVITY_LOG: '/user/activity',
    LOGIN_HISTORY: '/user/login-history',
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
    // Core reports
    EXPENSE_ANALYSIS: '/reports/expense-analysis',
    INCOME_VS_EXPENSES: '/reports/income-vs-expenses',
    SAVINGS_REPORT: '/reports/savings-report',
    BUDGET_PERFORMANCE: '/reports/budget-performance',
    
    // Report management
    LIST: '/reports/list',
    GENERATE: '/reports/generate',
    STATUS: (id) => `/reports/status/${id}`,
    DOWNLOAD: (id) => `/reports/download/${id}`,
    PREVIEW: (id) => `/reports/preview/${id}`,
    DELETE: (id) => `/reports/${id}`,
    
    // Advanced analytics
    FINANCIAL_HEALTH: '/reports/financial-health',
    CASH_FLOW: '/reports/cash-flow',
    
    // Templates and export
    TEMPLATES: '/reports/templates',
    EXPORT: '/reports/export'
};

export const DASHBOARD_ENDPOINTS = {
    // Core dashboard
    OVERVIEW: '/dashboard/overview',
    EXPENSE_CATEGORIES: '/dashboard/expense-categories',
    CASH_FLOW: '/dashboard/cash-flow',
    BUDGET_PROGRESS: '/dashboard/budget-progress',
    RECENT_TRANSACTIONS: '/dashboard/recent-transactions',
    FINANCIAL_SUMMARY: '/dashboard/financial-summary',
    
    // Widgets
    BALANCE_CARD: '/dashboard/widgets/balance-card',
    INCOME_CARD: '/dashboard/widgets/income-card',
    EXPENSES_CARD: '/dashboard/widgets/expenses-card',
    SAVINGS_CARD: '/dashboard/widgets/savings-card',
    
    // Export
    EXPORT: '/dashboard/export'
};

export const PUBLIC_ENDPOINTS = [
    AUTH_ENDPOINTS.LOGIN,
    AUTH_ENDPOINTS.REGISTER,
    AUTH_ENDPOINTS.REFRESH,
];