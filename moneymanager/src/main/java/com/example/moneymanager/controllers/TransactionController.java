package com.example.moneymanager.controllers;

import com.example.moneymanager.models.Transaction;
import com.example.moneymanager.services.TransactionService;
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
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    @Autowired
    private JwtService jwtService;

    private Long getUserIdFromToken(String authorizationHeader) {
        String token = authorizationHeader.replace("Bearer ", "");
        return Long.parseLong(jwtService.extractClaims(token).get("userId").toString());
    }

    @GetMapping
    public ResponseEntity<?> getAllTransactions(@RequestHeader("Authorization") String authorizationHeader,
                                              @RequestParam(required = false) String type,
                                              @RequestParam(required = false) String category,
                                              @RequestParam(required = false) String startDate,
                                              @RequestParam(required = false) String endDate,
                                              @RequestParam(required = false) Integer year,
                                              @RequestParam(required = false) Integer month,
                                              @RequestParam(required = false) Integer limit) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            List<Transaction> transactions;
            
            // Handle different filtering scenarios
            if (year != null && month != null) {
                // Filter by specific month and year
                transactions = transactionService.getTransactionsByMonthAndYear(userId, year, month);
            } else if (type != null || category != null || startDate != null || endDate != null) {
                // Use flexible filtering
                LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
                LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;
                transactions = transactionService.getFilteredTransactions(userId, type, category, start, end);
            } else {
                // Get all transactions
                transactions = transactionService.getTransactionsByUserId(userId);
            }
            
            // Apply limit if specified
            if (limit != null && limit > 0) {
                transactions = transactions.stream().limit(limit).toList();
            }
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve transactions: " + e.getMessage());
            errorResponse.put("code", "TRANSACTIONS_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestHeader("Authorization") String authorizationHeader,
                                             @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            // Validate required fields
            if (!requestBody.containsKey("amount") || !requestBody.containsKey("description") ||
                !requestBody.containsKey("category") || !requestBody.containsKey("type") ||
                !requestBody.containsKey("date")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Missing required fields: amount, description, category, type, date");
                errorResponse.put("code", "MISSING_REQUIRED_FIELDS");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            Transaction transaction = new Transaction();
            transaction.setAmount(new BigDecimal(requestBody.get("amount").toString()));
            transaction.setDescription((String) requestBody.get("description"));
            transaction.setCategory((String) requestBody.get("category"));
            
            // Validate transaction type
            String type = (String) requestBody.get("type");
            if (!type.equalsIgnoreCase("income") && !type.equalsIgnoreCase("expense")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Transaction type must be 'income' or 'expense'");
                errorResponse.put("code", "INVALID_TRANSACTION_TYPE");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            transaction.setType(type.toLowerCase());
            
            transaction.setDate(LocalDate.parse((String) requestBody.get("date")));
            transaction.setNotes((String) requestBody.get("notes"));
            transaction.setUserId(userId);
            
            Transaction createdTransaction = transactionService.saveTransaction(transaction);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to create transaction: " + e.getMessage());
            errorResponse.put("code", "TRANSACTION_CREATION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@RequestHeader("Authorization") String authorizationHeader,
                                              @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Optional<Transaction> transaction = transactionService.getTransactionByIdAndUserId(id, userId);
            
            if (transaction.isPresent()) {
                return ResponseEntity.ok(transaction.get());
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Transaction not found");
                errorResponse.put("code", "TRANSACTION_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve transaction");
            errorResponse.put("code", "TRANSACTION_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@RequestHeader("Authorization") String authorizationHeader,
                                             @PathVariable Long id,
                                             @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Transaction updatedTransaction = new Transaction();
            updatedTransaction.setAmount(new BigDecimal(requestBody.get("amount").toString()));
            updatedTransaction.setDescription((String) requestBody.get("description"));
            updatedTransaction.setCategory((String) requestBody.get("category"));
            
            // Validate transaction type
            String type = (String) requestBody.get("type");
            if (!type.equalsIgnoreCase("income") && !type.equalsIgnoreCase("expense")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Transaction type must be 'income' or 'expense'");
                errorResponse.put("code", "INVALID_TRANSACTION_TYPE");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            updatedTransaction.setType(type.toLowerCase());
            
            updatedTransaction.setDate(LocalDate.parse((String) requestBody.get("date")));
            updatedTransaction.setNotes((String) requestBody.get("notes"));
            
            Transaction transaction = transactionService.updateTransaction(id, updatedTransaction, userId);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to update transaction: " + e.getMessage());
            errorResponse.put("code", "TRANSACTION_UPDATE_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@RequestHeader("Authorization") String authorizationHeader,
                                             @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            transactionService.deleteTransaction(id, userId);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("message", "Transaction deleted successfully");
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to delete transaction: " + e.getMessage());
            errorResponse.put("code", "TRANSACTION_DELETION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/budget/{budgetId}")
    public ResponseEntity<?> getTransactionsByBudget(@RequestHeader("Authorization") String authorizationHeader,
                                                   @PathVariable Long budgetId) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            List<Transaction> transactions = transactionService.getTransactionsByBudgetId(budgetId, userId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve transactions for budget");
            errorResponse.put("code", "BUDGET_TRANSACTIONS_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // New filtering endpoints
    @GetMapping("/filter/type/{type}")
    public ResponseEntity<?> getTransactionsByType(@RequestHeader("Authorization") String authorizationHeader,
                                                 @PathVariable String type) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            if (!type.equalsIgnoreCase("income") && !type.equalsIgnoreCase("expense")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Type must be 'income' or 'expense'");
                errorResponse.put("code", "INVALID_TRANSACTION_TYPE");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            List<Transaction> transactions = transactionService.getTransactionsByType(userId, type.toLowerCase());
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve transactions by type");
            errorResponse.put("code", "TYPE_FILTER_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/filter/category/{category}")
    public ResponseEntity<?> getTransactionsByCategory(@RequestHeader("Authorization") String authorizationHeader,
                                                     @PathVariable String category) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            List<Transaction> transactions = transactionService.getTransactionsByCategory(userId, category);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve transactions by category");
            errorResponse.put("code", "CATEGORY_FILTER_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/filter/date-range")
    public ResponseEntity<?> getTransactionsByDateRange(@RequestHeader("Authorization") String authorizationHeader,
                                                       @RequestParam String startDate,
                                                       @RequestParam String endDate) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            if (start.isAfter(end)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Start date must be before or equal to end date");
                errorResponse.put("code", "INVALID_DATE_RANGE");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            List<Transaction> transactions = transactionService.getTransactionsByDateRange(userId, start, end);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve transactions by date range: " + e.getMessage());
            errorResponse.put("code", "DATE_FILTER_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<?> getTransactionStatistics(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Long incomeCount = transactionService.getTransactionCountByType(userId, "income");
            Long expenseCount = transactionService.getTransactionCountByType(userId, "expense");
            List<Transaction> recentTransactions = transactionService.getRecentTransactions(userId, 5);
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalTransactions", incomeCount + expenseCount);
            statistics.put("incomeTransactions", incomeCount);
            statistics.put("expenseTransactions", expenseCount);
            statistics.put("recentTransactions", recentTransactions);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve transaction statistics");
            errorResponse.put("code", "STATISTICS_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}