import api from './apiConfig';
import { BUDGET_ENDPOINTS, TRANSACTION_ENDPOINTS, GOAL_ENDPOINTS, REPORT_ENDPOINTS } from './endpoints';

// Budget Service
export class BudgetService {
    // Basic CRUD operations
    async getAll(queryParams = {}) {
        const response = await api.get(BUDGET_ENDPOINTS.GET_ALL, {
            params: queryParams
        });
        return response.data;
    }

    async create(budgetData) {
        const response = await api.post(BUDGET_ENDPOINTS.CREATE, budgetData);
        return response.data;
    }

    async getById(id, queryParams = {}) {
        const response = await api.get(BUDGET_ENDPOINTS.GET_BY_ID(id), {
            params: queryParams
        });
        return response.data;
    }

    async update(id, budgetData) {
        const response = await api.put(BUDGET_ENDPOINTS.UPDATE(id), budgetData);
        return response.data;
    }

    async delete(id, queryParams = {}) {
        const response = await api.delete(BUDGET_ENDPOINTS.DELETE(id), {
            params: queryParams
        });
        return response.data;
    }

    // Advanced budget operations
    async getSummary(queryParams = {}) {
        const response = await api.get(BUDGET_ENDPOINTS.SUMMARY, {
            params: queryParams
        });
        return response.data;
    }

    async getCategories() {
        const response = await api.get(BUDGET_ENDPOINTS.CATEGORIES);
        return response.data;
    }

    async getAlerts(queryParams = {}) {
        const response = await api.get(BUDGET_ENDPOINTS.ALERTS, {
            params: queryParams
        });
        return response.data;
    }

    async duplicate(id, duplicateData) {
        const response = await api.post(BUDGET_ENDPOINTS.DUPLICATE(id), duplicateData);
        return response.data;
    }

    async batchCreate(budgetsData) {
        const response = await api.post(BUDGET_ENDPOINTS.BATCH_CREATE, budgetsData);
        return response.data;
    }

    async generateRecurring(queryParams = {}) {
        const response = await api.get(BUDGET_ENDPOINTS.RECURRING_GENERATE, {
            params: queryParams
        });
        return response.data;
    }

    async archive(id) {
        const response = await api.put(BUDGET_ENDPOINTS.ARCHIVE(id));
        return response.data;
    }

    async restore(id) {
        const response = await api.put(BUDGET_ENDPOINTS.RESTORE(id));
        return response.data;
    }

    // Helper methods for common filtering operations
    async getByStatus(status, queryParams = {}) {
        return this.getAll({ status, ...queryParams });
    }

    async getByCategory(category, queryParams = {}) {
        return this.getAll({ category, ...queryParams });
    }

    async searchBudgets(search, queryParams = {}) {
        return this.getAll({ search, ...queryParams });
    }

    async getRecurringBudgets(recurring = 'monthly', queryParams = {}) {
        return this.getAll({ recurring, ...queryParams });
    }

    async getActiveBudgets(queryParams = {}) {
        return this.getByStatus('active', queryParams);
    }

    async getOverBudgets(queryParams = {}) {
        return this.getAll({ ...queryParams, overBudget: true });
    }

    async getBudgetsByDateRange(startDate, endDate, queryParams = {}) {
        return this.getAll({ startDate, endDate, ...queryParams });
    }

    // Pagination helpers
    async getPaginated(page = 1, limit = 10, queryParams = {}) {
        return this.getAll({ page, limit, ...queryParams });
    }

    // Sorting helpers
    async getSorted(sortBy = 'createdAt', sortOrder = 'desc', queryParams = {}) {
        return this.getAll({ sortBy, sortOrder, ...queryParams });
    }
}

// Transaction Service
export class TransactionService {
    async getAll(queryParams = {}) {
        const response = await api.get(TRANSACTION_ENDPOINTS.GET_ALL, {
            params: queryParams
        });
        return response.data;
    }

    async create(transactionData) {
        const response = await api.post(TRANSACTION_ENDPOINTS.CREATE, transactionData);
        return response.data;
    }

    async getById(id) {
        const response = await api.get(TRANSACTION_ENDPOINTS.GET_BY_ID(id));
        return response.data;
    }

    async update(id, transactionData) {
        const response = await api.put(TRANSACTION_ENDPOINTS.UPDATE(id), transactionData);
        return response.data;
    }

    async delete(id) {
        const response = await api.delete(TRANSACTION_ENDPOINTS.DELETE(id));
        return response.data;
    }

    async getByBudget(budgetId) {
        const response = await api.get(TRANSACTION_ENDPOINTS.GET_BY_BUDGET(budgetId));
        return response.data;
    }

    // Filter transactions by type
    async getByType(type) {
        const response = await api.get(`/transactions/filter/type/${type}`);
        return response.data;
    }

    // Filter transactions by category
    async getByCategory(category) {
        const encodedCategory = encodeURIComponent(category);
        const response = await api.get(`/transactions/filter/category/${encodedCategory}`);
        return response.data;
    }

    // Filter transactions by date range
    async getByDateRange(startDate, endDate) {
        const response = await api.get('/transactions/filter/date-range', {
            params: { startDate, endDate }
        });
        return response.data;
    }

    // Get transaction statistics
    async getStatistics() {
        const response = await api.get('/transactions/statistics');
        return response.data;
    }

    // Advanced filtering with multiple parameters
    async getFiltered(filters = {}) {
        const params = {};
        
        if (filters.type && filters.type !== 'all') {
            params.type = filters.type;
        }
        if (filters.category && filters.category !== 'all') {
            params.category = filters.category;
        }
        if (filters.startDate) {
            params.startDate = filters.startDate;
        }
        if (filters.endDate) {
            params.endDate = filters.endDate;
        }
        if (filters.year) {
            params.year = filters.year;
        }
        if (filters.month) {
            params.month = filters.month;
        }
        if (filters.limit) {
            params.limit = filters.limit;
        }

        return this.getAll(params);
    }
}

// Goal Service
export class GoalService {
    async getAll() {
        const response = await api.get(GOAL_ENDPOINTS.GET_ALL);
        return response.data;
    }

    async create(goalData) {
        const response = await api.post(GOAL_ENDPOINTS.CREATE, goalData);
        return response.data;
    }

    async getById(id) {
        const response = await api.get(GOAL_ENDPOINTS.GET_BY_ID(id));
        return response.data;
    }

    async update(id, goalData) {
        const response = await api.put(GOAL_ENDPOINTS.UPDATE(id), goalData);
        return response.data;
    }

    async delete(id) {
        const response = await api.delete(GOAL_ENDPOINTS.DELETE(id));
        return response.data;
    }
}

// Report Service
export class ReportService {
    async getMonthlyReport(year, month) {
        const response = await api.get(REPORT_ENDPOINTS.MONTHLY, {
            params: { year, month }
        });
        return response.data;
    }

    async getYearlyReport(year) {
        const response = await api.get(REPORT_ENDPOINTS.YEARLY, {
            params: { year }
        });
        return response.data;
    }

    async getCustomReport(startDate, endDate) {
        const response = await api.get(REPORT_ENDPOINTS.CUSTOM, {
            params: { startDate, endDate }
        });
        return response.data;
    }

    async exportReport(type, params) {
        const response = await api.get(REPORT_ENDPOINTS.EXPORT, {
            params: { type, ...params },
            responseType: 'blob' 
        });
        return response.data;
    }
}

// Export service instances
export const budgetService = new BudgetService();
export const transactionService = new TransactionService();
export const goalService = new GoalService();
export const reportService = new ReportService();