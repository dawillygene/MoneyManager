import api from './apiConfig';
import { BUDGET_ENDPOINTS, TRANSACTION_ENDPOINTS, GOAL_ENDPOINTS, REPORT_ENDPOINTS, DASHBOARD_ENDPOINTS, USER_ENDPOINTS } from './endpoints';

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

    //
    async getSummary(queryParams = {}) {
        const response = await api.get(BUDGET_ENDPOINTS.SUMMARY, {
            params: queryParams
        });
        console.log('Budget Summary Response:', response.data);
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
    // Basic CRUD operations
    async getAll(queryParams = {}) {
        const response = await api.get(GOAL_ENDPOINTS.GET_ALL, {
            params: queryParams
        });
        return response.data;
    }

    async create(goalData) {
        const response = await api.post(GOAL_ENDPOINTS.CREATE, goalData);
        return response.data;
    }

    async getById(id, queryParams = {}) {
        const response = await api.get(GOAL_ENDPOINTS.GET_BY_ID(id), {
            params: queryParams
        });
        return response.data;
    }

    async update(id, goalData) {
        const response = await api.put(GOAL_ENDPOINTS.UPDATE(id), goalData);
        return response.data;
    }

    async delete(id, queryParams = {}) {
        const response = await api.delete(GOAL_ENDPOINTS.DELETE(id), {
            params: queryParams
        });
        return response.data;
    }

    // Contribution management
    async contribute(id, contributionData) {
        const response = await api.post(GOAL_ENDPOINTS.CONTRIBUTE(id), contributionData);
        return response.data;
    }

    async getContributions(id, queryParams = {}) {
        const response = await api.get(GOAL_ENDPOINTS.GET_CONTRIBUTIONS(id), {
            params: queryParams
        });
        return response.data;
    }

    async updateContribution(goalId, contributionId, contributionData) {
        const response = await api.put(GOAL_ENDPOINTS.UPDATE_CONTRIBUTION(goalId, contributionId), contributionData);
        return response.data;
    }

    async deleteContribution(goalId, contributionId) {
        const response = await api.delete(GOAL_ENDPOINTS.DELETE_CONTRIBUTION(goalId, contributionId));
        return response.data;
    }

    async bulkContribute(contributionData) {
        const response = await api.post(GOAL_ENDPOINTS.BULK_CONTRIBUTE, contributionData);
        return response.data;
    }

    // Analytics and insights
    async getSummary(queryParams = {}) {
        const response = await api.get(GOAL_ENDPOINTS.SUMMARY, {
            params: queryParams
        });
        return response.data;
    }

    async getAnalytics(queryParams = {}) {
        const response = await api.get(GOAL_ENDPOINTS.ANALYTICS, {
            params: queryParams
        });
        return response.data;
    }

    async getCategories() {
        const response = await api.get(GOAL_ENDPOINTS.CATEGORIES);
        return response.data;
    }

    // Helper methods for common filtering operations
    async getByStatus(status, queryParams = {}) {
        return this.getAll({ status, ...queryParams });
    }

    async getByCategory(category, queryParams = {}) {
        return this.getAll({ category, ...queryParams });
    }

    async getByPriority(priority, queryParams = {}) {
        return this.getAll({ priority, ...queryParams });
    }

    async searchGoals(search, queryParams = {}) {
        return this.getAll({ search, ...queryParams });
    }

    async getActiveGoals(queryParams = {}) {
        return this.getByStatus('active', queryParams);
    }

    async getCompletedGoals(queryParams = {}) {
        return this.getByStatus('completed', queryParams);
    }

    async getOverdueGoals(queryParams = {}) {
        return this.getByStatus('overdue', queryParams);
    }

    async getGoalsByDateRange(startDate, endDate, queryParams = {}) {
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

    // Convenience methods for contributions
    async addFunds(goalId, amount, source, notes = '', date = null) {
        const contributionData = {
            amount,
            source,
            notes,
            date: date || new Date().toISOString().split('T')[0]
        };
        return this.contribute(goalId, contributionData);
    }

    // Goal progress calculations (client-side helpers)
    calculateProgress(currentAmount, targetAmount) {
        if (!targetAmount || targetAmount <= 0) return 0;
        return Math.min((currentAmount / targetAmount) * 100, 100);
    }

    calculateRemainingAmount(currentAmount, targetAmount) {
        return Math.max(targetAmount - currentAmount, 0);
    }

    calculateDaysRemaining(targetDate) {
        const today = new Date();
        const target = new Date(targetDate);
        const diffTime = target - today;
        return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
    }

    calculateDailyTargetAmount(remainingAmount, daysRemaining) {
        if (daysRemaining <= 0) return 0;
        return remainingAmount / daysRemaining;
    }

    isGoalOverdue(targetDate, progress) {
        const today = new Date();
        const target = new Date(targetDate);
        return target < today && progress < 100;
    }

    isGoalCompleted(progress) {
        return progress >= 100;
    }

    getGoalStatus(targetDate, progress, currentAmount, targetAmount) {
        if (this.isGoalCompleted(progress)) return 'completed';
        if (this.isGoalOverdue(targetDate, progress)) return 'overdue';
        if (currentAmount === 0) return 'upcoming';
        return 'active';
    }
}

// Report Service
export class ReportService {
    // Core report endpoints
    async getExpenseAnalysis(params = {}) {
        const response = await api.get(REPORT_ENDPOINTS.EXPENSE_ANALYSIS, { params });
        return response.data;
    }

    async getIncomeVsExpenses(params = {}) {
        const response = await api.get(REPORT_ENDPOINTS.INCOME_VS_EXPENSES, { params });
        return response.data;
    }

    async getSavingsReport(params = {}) {
        const response = await api.get(REPORT_ENDPOINTS.SAVINGS_REPORT, { params });
        return response.data;
    }

    async getBudgetPerformance(params = {}) {
        const response = await api.get(REPORT_ENDPOINTS.BUDGET_PERFORMANCE, { params });
        return response.data;
    }

    // Report management
    async getReportsList(params = {}) {
        const response = await api.get(REPORT_ENDPOINTS.LIST, { params });
        return response.data;
    }

    async generateReport(reportData) {
        const response = await api.post(REPORT_ENDPOINTS.GENERATE, reportData);
        return response.data;
    }

    async getReportStatus(reportId) {
        const response = await api.get(REPORT_ENDPOINTS.STATUS(reportId));
        return response.data;
    }

    async downloadReport(reportId, format = 'pdf') {
        try {
            // Validate format
            const validFormats = ['pdf', 'excel', 'xlsx', 'csv'];
            if (!validFormats.includes(format.toLowerCase())) {
                throw new Error('INVALID_FORMAT');
            }

            const params = { format: format.toLowerCase() };
            const response = await api.get(REPORT_ENDPOINTS.DOWNLOAD(reportId), {
                params,
                responseType: 'blob'
            });

            // Extract metadata from response headers
            const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
            const contentLength = response.headers['content-length'] || response.headers['Content-Length'];
            const fileSize = response.headers['x-file-size'] || response.headers['X-File-Size'];

            // Extract filename from Content-Disposition header
            let filename = `financial-report-${reportId}.${format}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/["']/g, '');
                }
            }

            return {
                blob: response.data,
                filename,
                fileSize: fileSize || contentLength,
                contentType: response.headers['content-type'] || response.headers['Content-Type']
            };
        } catch (error) {
            // Map specific error codes from API documentation
            if (error.response?.data) {
                try {
                    // Try to parse error response
                    const errorText = await error.response.data.text();
                    const errorObj = JSON.parse(errorText);
                    
                    // Map API error codes to user-friendly messages
                    const errorMessage = this.mapDownloadErrorCode(errorObj.code, errorObj.message);
                    const mappedError = new Error(errorMessage);
                    mappedError.code = errorObj.code;
                    mappedError.originalError = error;
                    throw mappedError;
                } catch (parseError) {
                    // If we can't parse the error, use the original error
                    console.warn('Could not parse error response:', parseError);
                }
            }

            // Handle network and other errors
            if (!error.response) {
                throw new Error('Network error: Please check your connection and try again.');
            } else if (error.response.status === 404) {
                throw new Error('REPORT_NOT_FOUND');
            } else if (error.response.status === 401) {
                throw new Error('Authentication required. Please log in again.');
            } else if (error.response.status === 403) {
                throw new Error('Access denied. You may not have permission to download this report.');
            } else {
                throw new Error('REPORT_DOWNLOAD_FAILED');
            }
        }
    }

    // Helper method to map API error codes to user-friendly messages
    mapDownloadErrorCode(code, originalMessage) {
        const errorMap = {
            'REPORT_GENERATION_FAILED': 'Failed to generate the report. Please try again.',
            'REPORT_DOWNLOAD_FAILED': 'Failed to download the report. Please try again.',
            'INVALID_FORMAT': 'The selected file format is not supported. Please choose PDF, Excel, or CSV.',
            'REPORT_NOT_FOUND': 'Report not found. It may have been deleted or expired.'
        };

        return errorMap[code] || originalMessage || 'An unknown error occurred while downloading the report.';
    }

    async previewReport(reportId) {
        const response = await api.get(REPORT_ENDPOINTS.PREVIEW(reportId));
        return response.data;
    }

    async deleteReport(reportId) {
        const response = await api.delete(REPORT_ENDPOINTS.DELETE(reportId));
        return response.data;
    }

    // Advanced analytics
    async getFinancialHealth(params = {}) {
        const response = await api.get(REPORT_ENDPOINTS.FINANCIAL_HEALTH, { params });
        return response.data;
    }

    async getCashFlow(params = {}) {
        const response = await api.get(REPORT_ENDPOINTS.CASH_FLOW, { params });
        return response.data;
    }

    // Templates and customization
    async getTemplates() {
        const response = await api.get(REPORT_ENDPOINTS.TEMPLATES);
        return response.data;
    }

    async exportReport(exportData) {
        const response = await api.post(REPORT_ENDPOINTS.EXPORT, exportData, {
            responseType: 'blob'
        });
        return response.data;
    }

    // Helper methods for report ID generation and management
    generateReportId(reportType, dateRange = null) {
        // Generate report ID in format: {type}_YYYYMM_001
        const typeMap = {
            'expense-analysis': 'expense_analysis',
            'income-vs-expenses': 'income_vs_expenses',
            'budget-performance': 'budget_progress',
            'savings-report': 'savings_report',
            'comprehensive': 'comprehensive'
        };

        const mappedType = typeMap[reportType] || reportType.replace('-', '_');
        
        // Use provided date range or current date
        let yearMonth;
        if (dateRange && dateRange.startDate) {
            const date = new Date(dateRange.startDate);
            yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else {
            const now = new Date();
            yearMonth = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        }

        // Generate sequence number (in real implementation, this would come from backend)
        const sequence = '001';
        
        return `${mappedType}_${yearMonth}_${sequence}`;
    }

    validateReportId(reportId) {
        // Validate report ID format: {type}_YYYYMM_001
        const pattern = /^[a-z_]+_\d{6}_\d{3}$/;
        return pattern.test(reportId);
    }

    parseReportId(reportId) {
        if (!this.validateReportId(reportId)) {
            throw new Error('Invalid report ID format');
        }

        const parts = reportId.split('_');
        const sequence = parts.pop();
        const yearMonth = parts.pop();
        const type = parts.join('_');

        return {
            type,
            year: parseInt(yearMonth.substring(0, 4)),
            month: parseInt(yearMonth.substring(4, 6)),
            sequence: parseInt(sequence)
        };
    }

    // Helper methods for time periods
    getThisMonthParams() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return {
            period: 'this-month',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    getLastMonthParams() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        
        return {
            period: 'last-month',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    getThisYearParams() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), 0, 1);
        const endDate = new Date(now.getFullYear(), 11, 31);
        
        return {
            period: 'this-year',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    getCustomRangeParams(startDate, endDate) {
        return {
            period: 'custom',
            startDate,
            endDate
        };
    }
}

// Dashboard Service
export class DashboardService {
    // Core dashboard data
    async getOverview(params = {}) {
        const response = await api.get(DASHBOARD_ENDPOINTS.OVERVIEW, { params });
        return response.data;
    }

    async getExpenseCategories(params = {}) {
        const response = await api.get(DASHBOARD_ENDPOINTS.EXPENSE_CATEGORIES, { params });
        return response.data;
    }

    async getCashFlow(params = {}) {
        const response = await api.get(DASHBOARD_ENDPOINTS.CASH_FLOW, { params });
        return response.data;
    }

    async getBudgetProgress(params = {}) {
        const response = await api.get(DASHBOARD_ENDPOINTS.BUDGET_PROGRESS, { params });
        return response.data;
    }

    async getRecentTransactions(params = {}) {
        const response = await api.get(DASHBOARD_ENDPOINTS.RECENT_TRANSACTIONS, { params });
        return response.data;
    }

    async getFinancialSummary(params = {}) {
        const response = await api.get(DASHBOARD_ENDPOINTS.FINANCIAL_SUMMARY, { params });
        return response.data;
    }

    // Widget endpoints
    async getBalanceCard() {
        const response = await api.get(DASHBOARD_ENDPOINTS.BALANCE_CARD);
        return response.data;
    }

    async getIncomeCard() {
        const response = await api.get(DASHBOARD_ENDPOINTS.INCOME_CARD);
        return response.data;
    }

    async getExpensesCard() {
        const response = await api.get(DASHBOARD_ENDPOINTS.EXPENSES_CARD);
        return response.data;
    }

    async getSavingsCard() {
        const response = await api.get(DASHBOARD_ENDPOINTS.SAVINGS_CARD);
        return response.data;
    }

    // Export functionality
    async exportDashboard(exportData) {
        const response = await api.post(DASHBOARD_ENDPOINTS.EXPORT, exportData, {
            responseType: 'blob'
        });
        return response.data;
    }

    // Helper methods for dashboard periods
    getCurrentMonthParams() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return {
            period: 'current-month',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    getLastMonthParams() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        
        return {
            period: 'last-month',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    getCurrentYearParams() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), 0, 1);
        const endDate = new Date(now.getFullYear(), 11, 31);
        
        return {
            period: 'current-year',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    getCustomRangeParams(startDate, endDate) {
        return {
            period: 'custom',
            startDate,
            endDate
        };
    }
}

// User Service
export class UserService {
    // Profile management
    async getProfile() {
        const response = await api.get(USER_ENDPOINTS.PROFILE);
        return response.data;
    }

    async updateProfile(profileData) {
        const response = await api.put(USER_ENDPOINTS.UPDATE_PROFILE, profileData);
        return response.data;
    }

    async deleteAccount(confirmationData = {}) {
        const response = await api.delete(USER_ENDPOINTS.DELETE_ACCOUNT, {
            data: confirmationData
        });
        return response.data;
    }

    // Password management
    async changePassword(passwordData) {
        const response = await api.put(USER_ENDPOINTS.CHANGE_PASSWORD, passwordData);
        return response.data;
    }

    // User preferences
    async getPreferences() {
        const response = await api.get(USER_ENDPOINTS.PREFERENCES);
        return response.data;
    }

    async updatePreferences(preferencesData) {
        const response = await api.put(USER_ENDPOINTS.UPDATE_PREFERENCES, preferencesData);
        return response.data;
    }

    // Security and session management
    async getSessions() {
        const response = await api.get(USER_ENDPOINTS.SESSIONS);
        return response.data;
    }

    async revokeSession(sessionId) {
        const response = await api.delete(USER_ENDPOINTS.REVOKE_SESSION(sessionId));
        return response.data;
    }

    async revokeAllSessions() {
        const response = await api.delete(USER_ENDPOINTS.REVOKE_ALL_SESSIONS);
        return response.data;
    }

    // Two-factor authentication
    async enable2FA(verificationData) {
        const response = await api.post(USER_ENDPOINTS.ENABLE_2FA, verificationData);
        return response.data;
    }

    async disable2FA(verificationData) {
        const response = await api.post(USER_ENDPOINTS.DISABLE_2FA, verificationData);
        return response.data;
    }

    async verify2FA(verificationData) {
        const response = await api.post(USER_ENDPOINTS.VERIFY_2FA, verificationData);
        return response.data;
    }

    // Avatar/Profile picture management
    async uploadAvatar(avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const response = await api.post(USER_ENDPOINTS.UPLOAD_AVATAR, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async deleteAvatar() {
        const response = await api.delete(USER_ENDPOINTS.DELETE_AVATAR);
        return response.data;
    }

    // Email verification
    async verifyEmail(verificationToken) {
        const response = await api.post(USER_ENDPOINTS.VERIFY_EMAIL, {
            token: verificationToken
        });
        return response.data;
    }

    async resendVerification() {
        const response = await api.post(USER_ENDPOINTS.RESEND_VERIFICATION);
        return response.data;
    }

    // Privacy and data management
    async exportUserData(exportOptions = {}) {
        const response = await api.post(USER_ENDPOINTS.EXPORT_DATA, exportOptions, {
            responseType: 'blob'
        });
        return response.data;
    }

    async getPrivacySettings() {
        const response = await api.get(USER_ENDPOINTS.PRIVACY_SETTINGS);
        return response.data;
    }

    async updatePrivacySettings(privacyData) {
        const response = await api.put(USER_ENDPOINTS.PRIVACY_SETTINGS, privacyData);
        return response.data;
    }

    // Activity and audit logs
    async getActivityLog(params = {}) {
        const response = await api.get(USER_ENDPOINTS.ACTIVITY_LOG, { params });
        return response.data;
    }

    async getLoginHistory(params = {}) {
        const response = await api.get(USER_ENDPOINTS.LOGIN_HISTORY, { params });
        return response.data;
    }

    // Helper methods for common profile operations
    async updateBasicInfo(name, email) {
        return this.updateProfile({ name, email });
    }

    async updateContactInfo(phone, address) {
        return this.updateProfile({ phone, address });
    }

    async updateFinancialInfo(currency, timezone) {
        return this.updatePreferences({ currency, timezone });
    }

    // Validation helpers
    validatePasswordStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            valid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            length: password.length >= minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar
        };
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Export service instances
export const budgetService = new BudgetService();
export const transactionService = new TransactionService();
export const goalService = new GoalService();
export const reportService = new ReportService();
export const dashboardService = new DashboardService();
export const userService = new UserService();