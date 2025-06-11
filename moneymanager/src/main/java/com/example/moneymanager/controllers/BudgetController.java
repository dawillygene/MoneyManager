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
import java.util.Optional;

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
        String email = jwtService.extractEmailFromToken(token);
        // You might want to get user ID from email via UserService
        // For now, extracting from token claims
        return Long.parseLong(jwtService.extractClaims(token).get("userId").toString());
    }

    @GetMapping
    public ResponseEntity<?> getAllBudgets(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            List<Budget> budgets = budgetService.getAllBudgetsByUserId(userId);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve budgets");
            errorResponse.put("code", "BUDGETS_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createBudget(@RequestHeader("Authorization") String authorizationHeader, 
                                        @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Budget budget = new Budget();
            budget.setName((String) requestBody.get("name"));
            budget.setAmount(new BigDecimal(requestBody.get("amount").toString()));
            budget.setCategory((String) requestBody.get("category"));
            budget.setStartDate(LocalDate.parse((String) requestBody.get("startDate")));
            budget.setEndDate(LocalDate.parse((String) requestBody.get("endDate")));
            budget.setDescription((String) requestBody.get("description"));
            budget.setRecurring((String) requestBody.get("recurring"));
            
            if (requestBody.get("alertLevel") != null) {
                budget.setAlertLevel(Integer.parseInt(requestBody.get("alertLevel").toString()));
            }
            
            budget.setUserId(userId);
            
            Budget createdBudget = budgetService.createBudget(budget);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBudget);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to create budget: " + e.getMessage());
            errorResponse.put("code", "BUDGET_CREATION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBudgetById(@RequestHeader("Authorization") String authorizationHeader, 
                                         @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Optional<Budget> budget = budgetService.getBudgetByIdAndUserId(id, userId);
            
            if (budget.isPresent()) {
                return ResponseEntity.ok(budget.get());
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Budget not found");
                errorResponse.put("code", "BUDGET_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve budget");
            errorResponse.put("code", "BUDGET_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(@RequestHeader("Authorization") String authorizationHeader, 
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
            
            if (requestBody.get("alertLevel") != null) {
                updatedBudget.setAlertLevel(Integer.parseInt(requestBody.get("alertLevel").toString()));
            }
            
            Budget budget = budgetService.updateBudget(id, updatedBudget, userId);
            return ResponseEntity.ok(budget);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to update budget: " + e.getMessage());
            errorResponse.put("code", "BUDGET_UPDATE_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@RequestHeader("Authorization") String authorizationHeader, 
                                        @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            budgetService.deleteBudget(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to delete budget: " + e.getMessage());
            errorResponse.put("code", "BUDGET_DELETION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}