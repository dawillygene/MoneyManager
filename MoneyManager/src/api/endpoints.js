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
    GET_ALL: '/budgets',
    CREATE: '/budgets',
    GET_BY_ID: (id) => `/budgets/${id}`,
    UPDATE: (id) => `/budgets/${id}`,
    DELETE: (id) => `/budgets/${id}`,
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
    GET_ALL: '/goals',
    CREATE: '/goals',
    GET_BY_ID: (id) => `/goals/${id}`,
    UPDATE: (id) => `/goals/${id}`,
    DELETE: (id) => `/goals/${id}`,
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