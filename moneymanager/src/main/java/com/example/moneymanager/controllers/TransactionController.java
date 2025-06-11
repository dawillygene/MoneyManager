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
    public ResponseEntity<?> getAllTransactions(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            List<Transaction> transactions = transactionService.getTransactionsByUserId(userId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve transactions");
            errorResponse.put("code", "TRANSACTIONS_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestHeader("Authorization") String authorizationHeader,
                                             @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Transaction transaction = new Transaction();
            transaction.setAmount(new BigDecimal(requestBody.get("amount").toString()));
            transaction.setDescription((String) requestBody.get("description"));
            transaction.setCategory((String) requestBody.get("category"));
            transaction.setType((String) requestBody.get("type"));
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
            updatedTransaction.setType((String) requestBody.get("type"));
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
            return ResponseEntity.ok().build();
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
}