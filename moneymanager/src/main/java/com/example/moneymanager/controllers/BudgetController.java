package com.example.moneymanager.controllers;

import com.example.moneymanager.models.Budget;
import com.example.moneymanager.services.BudgetService;
import com.example.moneymanager.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class BudgetController {
    
    @Autowired
    private BudgetService budgetService;

    @Autowired
    private JwtService jwtService;

    private Long getUserIdFromToken(String authorizationHeader) {
        String token = authorizationHeader.replace("Bearer ", "");
        return Long.parseLong(jwtService.extractClaims(token).get("userId").toString());
    }

    private Map<String, Object> createErrorResponse(String message, String code) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", true);
        errorResponse.put("message", message);
        errorResponse.put("code", code);
        return errorResponse;
    }

    // GET /api/budgets - Get all budgets with filtering and pagination
    @GetMapping
    public ResponseEntity<?> getAllBudgets(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String recurring,
            @RequestParam(required = false) String search) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Map<String, Object> response = budgetService.getBudgetsWithPagination(
                userId, page, limit, sortBy, sortOrder, category, status, recurring, search);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve budgets: " + e.getMessage(), "BUDGETS_RETRIEVAL_FAILED"));
        }
    }

    // POST /api/budgets - Create a new budget
    @PostMapping
    public ResponseEntity<?> createBudget(
            @RequestHeader("Authorization") String authorizationHeader, 
            @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            // Validate required fields
            if (!requestBody.containsKey("name") || !requestBody.containsKey("amount") || 
                !requestBody.containsKey("category") || !requestBody.containsKey("startDate") || 
                !requestBody.containsKey("endDate")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Missing required fields: name, amount, category, startDate, endDate", "VALIDATION_ERROR"));
            }
            
            Budget budget = new Budget();
            budget.setName((String) requestBody.get("name"));
            budget.setAmount(new BigDecimal(requestBody.get("amount").toString()));
            budget.setCategory((String) requestBody.get("category"));
            budget.setStartDate(LocalDate.parse((String) requestBody.get("startDate")));
            budget.setEndDate(LocalDate.parse((String) requestBody.get("endDate")));
            budget.setDescription((String) requestBody.get("description"));
            budget.setRecurring((String) requestBody.get("recurring"));
            budget.setCategoryIcon((String) requestBody.get("categoryIcon"));
            budget.setCategoryColor((String) requestBody.get("categoryColor"));
            budget.setUserId(userId);
            
            if (requestBody.containsKey("alertLevel")) {
                budget.setAlertLevel(Integer.parseInt(requestBody.get("alertLevel").toString()));
            }
            
            // Handle tags
            if (requestBody.containsKey("tags") && requestBody.get("tags") instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> tags = (List<String>) requestBody.get("tags");
                budget.setTagsList(tags);
            }
            
            Budget createdBudget = budgetService.createBudget(budget);
            Map<String, Object> response = budgetService.enhanceBudgetWithDetails(createdBudget);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("Failed to create budget: " + e.getMessage(), "BUDGET_CREATION_FAILED"));
        }
    }

    // GET /api/budgets/{id} - Get specific budget with details
    @GetMapping("/{id}")
    public ResponseEntity<?> getBudgetById(
            @RequestHeader("Authorization") String authorizationHeader, 
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean includeTransactions,
            @RequestParam(defaultValue = "10") int transactionLimit) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Map<String, Object> response = budgetService.getBudgetWithDetails(id, userId, includeTransactions, transactionLimit);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Budget not found", "BUDGET_NOT_FOUND"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve budget: " + e.getMessage(), "BUDGET_RETRIEVAL_FAILED"));
        }
    }

    // PUT /api/budgets/{id} - Update specific budget
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(
            @RequestHeader("Authorization") String authorizationHeader, 
            @PathVariable Long id, 
            @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Budget updatedBudget = new Budget();
            updatedBudget.setName((String) requestBody.get("name"));
            updatedBudget.setAmount(new BigDecimal(requestBody.get("amount").toString()));
            updatedBudget.setCategory((String) requestBody.get("category"));
            updatedBudget.setStartDate(LocalDate.parse((String) requestBody.get("startDate")));
            updatedBudget.setEndDate(LocalDate.parse((String) requestBody.get("endDate")));
            updatedBudget.setDescription((String) requestBody.get("description"));
            updatedBudget.setRecurring((String) requestBody.get("recurring"));
            updatedBudget.setCategoryIcon((String) requestBody.get("categoryIcon"));
            updatedBudget.setCategoryColor((String) requestBody.get("categoryColor"));
            
            if (requestBody.containsKey("alertLevel")) {
                updatedBudget.setAlertLevel(Integer.parseInt(requestBody.get("alertLevel").toString()));
            }
            
            // Handle tags
            if (requestBody.containsKey("tags") && requestBody.get("tags") instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> tags = (List<String>) requestBody.get("tags");
                updatedBudget.setTagsList(tags);
            }
            
            Budget budget = budgetService.updateBudget(id, updatedBudget, userId);
            Map<String, Object> response = budgetService.enhanceBudgetWithDetails(budget);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Budget not found", "BUDGET_NOT_FOUND"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("Failed to update budget: " + e.getMessage(), "BUDGET_UPDATE_FAILED"));
        }
    }

    // DELETE /api/budgets/{id} - Delete specific budget
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(
            @RequestHeader("Authorization") String authorizationHeader, 
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean cascade) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            budgetService.deleteBudget(id, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Budget deleted successfully");
            response.put("deletedBudgetId", id);
            response.put("deletedTransactions", 0); // Could be enhanced to track this
            response.put("reassignedTransactions", 0);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Budget not found", "BUDGET_NOT_FOUND"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("Failed to delete budget: " + e.getMessage(), "BUDGET_DELETION_FAILED"));
        }
    }

    // GET /api/budgets/summary - Get budget summary and statistics
    @GetMapping("/summary")
    public ResponseEntity<?> getBudgetSummary(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "current") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Map<String, Object> summary = budgetService.getBudgetSummary(userId);
            
            // Add period and date range info
            Map<String, Object> dateRange = new HashMap<>();
            LocalDate now = LocalDate.now();
            dateRange.put("startDate", now.withDayOfMonth(1));
            dateRange.put("endDate", now.withDayOfMonth(now.lengthOfMonth()));
            
            summary.put("period", period);
            summary.put("dateRange", dateRange);
            
            // Add category breakdown
            List<Map<String, Object>> categoryBreakdown = budgetService.getCategoryBreakdown(userId);
            summary.put("categoryBreakdown", categoryBreakdown);
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve budget summary: " + e.getMessage(), "SUMMARY_RETRIEVAL_FAILED"));
        }
    }

    // GET /api/budgets/categories - Get available budget categories
    @GetMapping("/categories")
    public ResponseEntity<?> getAvailableCategories() {
        try {
            List<Map<String, Object>> categories = budgetService.getAvailableCategories();
            
            Map<String, Object> response = new HashMap<>();
            response.put("categories", categories);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve categories: " + e.getMessage(), "CATEGORIES_RETRIEVAL_FAILED"));
        }
    }

    // POST /api/budgets/duplicate/{id} - Duplicate an existing budget
    @PostMapping("/duplicate/{id}")
    public ResponseEntity<?> duplicateBudget(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long id,
            @RequestBody Map<String, Object> modifications) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Budget duplicatedBudget = budgetService.duplicateBudget(id, userId, modifications);
            Map<String, Object> response = budgetService.enhanceBudgetWithDetails(duplicatedBudget);
            response.put("sourceBudgetId", id);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Source budget not found", "BUDGET_NOT_FOUND"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("Failed to duplicate budget: " + e.getMessage(), "BUDGET_DUPLICATION_FAILED"));
        }
    }

    // GET /api/budgets/alerts - Get budget alerts
    @GetMapping("/alerts")
    public ResponseEntity<?> getBudgetAlerts(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String category) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            List<Map<String, Object>> alerts = budgetService.getBudgetAlerts(userId, severity, category);
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalAlerts", alerts.size());
            summary.put("warningCount", alerts.stream().mapToInt(a -> "warning".equals(a.get("severity")) ? 1 : 0).sum());
            summary.put("criticalCount", alerts.stream().mapToInt(a -> "critical".equals(a.get("severity")) ? 1 : 0).sum());
            summary.put("overBudgetCount", alerts.stream().mapToInt(a -> "critical".equals(a.get("severity")) ? 1 : 0).sum());
            
            Map<String, Object> response = new HashMap<>();
            response.put("alerts", alerts);
            response.put("summary", summary);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve alerts: " + e.getMessage(), "ALERTS_RETRIEVAL_FAILED"));
        }
    }

    // POST /api/budgets/batch - Create multiple budgets at once
    @PostMapping("/batch")
    public ResponseEntity<?> createBudgetsBatch(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            if (!requestBody.containsKey("budgets")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Missing 'budgets' array in request body", "VALIDATION_ERROR"));
            }
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> budgetRequests = (List<Map<String, Object>>) requestBody.get("budgets");
            
            Map<String, Object> response = budgetService.createBudgetsBatch(userId, budgetRequests);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("Failed to create budgets batch: " + e.getMessage(), "BATCH_CREATION_FAILED"));
        }
    }

    // GET /api/budgets/recurring/generate - Generate recurring budgets
    @GetMapping("/recurring/generate")
    public ResponseEntity<?> generateRecurringBudgets(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "1") int months,
            @RequestParam(defaultValue = "false") boolean dryRun) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            if (months < 1 || months > 12) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Months parameter must be between 1 and 12", "VALIDATION_ERROR"));
            }
            
            Map<String, Object> response = budgetService.generateRecurringBudgets(userId, months, dryRun);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to generate recurring budgets: " + e.getMessage(), "RECURRING_GENERATION_FAILED"));
        }
    }

    // PUT /api/budgets/{id}/archive - Archive a budget
    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archiveBudget(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Budget archivedBudget = budgetService.archiveBudget(id, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Budget archived successfully");
            response.put("budgetId", id);
            response.put("archivedAt", archivedBudget.getArchivedAt());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Budget not found", "BUDGET_NOT_FOUND"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("Failed to archive budget: " + e.getMessage(), "BUDGET_ARCHIVE_FAILED"));
        }
    }

    // PUT /api/budgets/{id}/restore - Restore an archived budget
    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restoreBudget(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Budget restoredBudget = budgetService.restoreBudget(id, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Budget restored successfully");
            response.put("budgetId", id);
            response.put("restoredAt", restoredBudget.getRestoredAt());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Budget not found", "BUDGET_NOT_FOUND"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("Failed to restore budget: " + e.getMessage(), "BUDGET_RESTORE_FAILED"));
        }
    }
}