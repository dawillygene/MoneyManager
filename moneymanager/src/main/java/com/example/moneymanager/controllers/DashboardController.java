package com.example.moneymanager.controllers;

import com.example.moneymanager.services.DashboardService;
import com.example.moneymanager.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private JwtService jwtService;

    private Long getUserIdFromToken(String authorizationHeader) {
        String token = authorizationHeader.replace("Bearer ", "");
        return Long.parseLong(jwtService.extractClaims(token).get("userId").toString());
    }

    @GetMapping("/overview")
    public ResponseEntity<?> getDashboardOverview(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "true") boolean includeCharts,
            @RequestParam(defaultValue = "true") boolean includeProjections) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> overview = dashboardService.getDashboardOverview(
                userId, period, startDate, endDate, includeCharts, includeProjections);
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve dashboard overview: " + e.getMessage());
            errorResponse.put("code", "DASHBOARD_OVERVIEW_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/widgets")
    public ResponseEntity<?> getWidgetData(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String widgets,
            @RequestParam(defaultValue = "this-month") String period) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            String[] widgetList = widgets.split(",");
            Map<String, Object> widgetData = dashboardService.getWidgetData(userId, widgetList, period);
            return ResponseEntity.ok(widgetData);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve widget data: " + e.getMessage());
            errorResponse.put("code", "WIDGET_DATA_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/expense-categories")
    public ResponseEntity<?> getExpenseCategories(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "true") boolean includeSubcategories,
            @RequestParam(defaultValue = "1.0") double minPercentage) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> expenseCategories = dashboardService.getExpenseCategories(
                userId, period, startDate, endDate, includeSubcategories, minPercentage);
            return ResponseEntity.ok(expenseCategories);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve expense categories: " + e.getMessage());
            errorResponse.put("code", "EXPENSE_CATEGORIES_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/cash-flow")
    public ResponseEntity<?> getCashFlow(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "6") int months,
            @RequestParam(defaultValue = "true") boolean includeProjections) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> cashFlow = dashboardService.getCashFlow(userId, months, includeProjections);
            return ResponseEntity.ok(cashFlow);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve cash flow data: " + e.getMessage());
            errorResponse.put("code", "CASH_FLOW_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/budget-progress")
    public ResponseEntity<?> getBudgetProgress(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(defaultValue = "true") boolean includeOverBudget,
            @RequestParam(defaultValue = "usage") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> budgetProgress = dashboardService.getBudgetProgress(
                userId, period, includeOverBudget, sortBy, sortOrder);
            return ResponseEntity.ok(budgetProgress);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve budget progress: " + e.getMessage());
            errorResponse.put("code", "BUDGET_PROGRESS_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/recent-transactions")
    public ResponseEntity<?> getRecentTransactions(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> recentTransactions = dashboardService.getRecentTransactionsForDashboard(userId, limit);
            return ResponseEntity.ok(recentTransactions);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve recent transactions: " + e.getMessage());
            errorResponse.put("code", "RECENT_TRANSACTIONS_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/financial-summary")
    public ResponseEntity<?> getFinancialSummary(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(defaultValue = "TZS") String currency) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> financialSummary = dashboardService.getFinancialSummary(userId, period, currency);
            return ResponseEntity.ok(financialSummary);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve financial summary: " + e.getMessage());
            errorResponse.put("code", "FINANCIAL_SUMMARY_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/export")
    public ResponseEntity<?> exportDashboard(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody Map<String, Object> exportRequest) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            // Get the export format and data
            String format = (String) exportRequest.getOrDefault("format", "PDF");
            String reportType = (String) exportRequest.getOrDefault("reportType", "dashboard");
            String period = (String) exportRequest.getOrDefault("period", "this-month");
            
            // Generate dashboard data for export
            Map<String, Object> dashboardData = dashboardService.getDashboardOverview(
                userId, period, null, null, true, true);
            
            // Create export data
            Map<String, Object> exportData = new HashMap<>();
            exportData.put("title", "Dashboard Export - " + period);
            exportData.put("generatedDate", java.time.LocalDateTime.now().toString());
            exportData.put("format", format);
            exportData.put("data", dashboardData);
            exportData.put("userId", userId);
            
            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to export dashboard: " + e.getMessage());
            errorResponse.put("code", "DASHBOARD_EXPORT_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}