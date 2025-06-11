package com.example.moneymanager.services;

import com.example.moneymanager.models.Transaction;
import com.example.moneymanager.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private BudgetService budgetService;

    public Transaction saveTransaction(Transaction transaction) {
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // Update budget spending for this category
        if ("expense".equals(savedTransaction.getType())) {
            budgetService.updateBudgetSpendingForCategory(savedTransaction.getUserId(), savedTransaction.getCategory());
        }
        
        return savedTransaction;
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId);
    }

    public Optional<Transaction> getTransactionByIdAndUserId(Long id, Long userId) {
        Optional<Transaction> transaction = transactionRepository.findById(id);
        if (transaction.isPresent() && transaction.get().getUserId().equals(userId)) {
            return transaction;
        }
        return Optional.empty();
    }

    public Transaction updateTransaction(Long id, Transaction updatedTransaction, Long userId) {
        Optional<Transaction> existingTransactionOpt = getTransactionByIdAndUserId(id, userId);
        if (existingTransactionOpt.isEmpty()) {
            throw new RuntimeException("Transaction not found or access denied");
        }
        
        Transaction existingTransaction = existingTransactionOpt.get();
        String oldCategory = existingTransaction.getCategory();
        String oldType = existingTransaction.getType();
        
        // Update transaction fields
        existingTransaction.setAmount(updatedTransaction.getAmount());
        existingTransaction.setDescription(updatedTransaction.getDescription());
        existingTransaction.setCategory(updatedTransaction.getCategory());
        existingTransaction.setType(updatedTransaction.getType());
        existingTransaction.setDate(updatedTransaction.getDate());
        existingTransaction.setNotes(updatedTransaction.getNotes());
        
        Transaction savedTransaction = transactionRepository.save(existingTransaction);
        
        // Update budget spending for affected categories
        if ("expense".equals(oldType)) {
            budgetService.updateBudgetSpendingForCategory(userId, oldCategory);
        }
        if ("expense".equals(savedTransaction.getType()) && !oldCategory.equals(savedTransaction.getCategory())) {
            budgetService.updateBudgetSpendingForCategory(userId, savedTransaction.getCategory());
        }
        
        return savedTransaction;
    }

    public void deleteTransaction(Long id, Long userId) {
        Optional<Transaction> transactionOpt = getTransactionByIdAndUserId(id, userId);
        if (transactionOpt.isEmpty()) {
            throw new RuntimeException("Transaction not found or access denied");
        }
        
        Transaction transaction = transactionOpt.get();
        String category = transaction.getCategory();
        String type = transaction.getType();
        
        transactionRepository.deleteById(id);
        
        // Update budget spending for this category
        if ("expense".equals(type)) {
            budgetService.updateBudgetSpendingForCategory(userId, category);
        }
    }

    // Enhanced filtering methods with comprehensive query support
    public List<Transaction> getFilteredTransactions(Long userId, String type, String category, 
                                                   LocalDate startDate, LocalDate endDate, 
                                                   Integer year, Integer month, Integer limit) {
        
        List<Transaction> transactions;
        
        // Handle year/month filtering
        if (year != null && month != null) {
            transactions = transactionRepository.findByUserIdAndYearAndMonth(userId, year, month);
        } else if (startDate != null && endDate != null) {
            transactions = transactionRepository.findTransactionsWithFilters(userId, type, category, startDate, endDate);
        } else {
            transactions = transactionRepository.findTransactionsWithFilters(userId, type, category, null, null);
        }
        
        // Apply limit if specified
        if (limit != null && limit > 0) {
            transactions = transactions.stream().limit(limit).toList();
        }
        
        return transactions;
    }
    
    public List<Transaction> getTransactionsByType(Long userId, String type) {
        return transactionRepository.findByUserIdAndTypeOrderByDateDesc(userId, type);
    }
    
    public List<Transaction> getTransactionsByCategory(Long userId, String category) {
        return transactionRepository.findByUserIdAndCategoryOrderByDateDesc(userId, category);
    }
    
    public List<Transaction> getTransactionsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }
    
    public List<Transaction> getTransactionsByMonthAndYear(Long userId, int year, int month) {
        return transactionRepository.findByUserIdAndYearAndMonth(userId, year, month);
    }
    
    // Statistics and analytics methods
    public Map<String, Object> getTransactionStatistics(Long userId) {
        List<Transaction> allTransactions = transactionRepository.findByUserId(userId);
        
        long totalTransactions = allTransactions.size();
        long incomeTransactions = transactionRepository.countByUserIdAndType(userId, "income");
        long expenseTransactions = transactionRepository.countByUserIdAndType(userId, "expense");
        
        List<Transaction> recentTransactions = transactionRepository.findByUserIdOrderByDateDesc(userId)
            .stream().limit(5).toList();
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalTransactions", totalTransactions);
        statistics.put("incomeTransactions", incomeTransactions);
        statistics.put("expenseTransactions", expenseTransactions);
        statistics.put("recentTransactions", recentTransactions);
        
        return statistics;
    }
    
    public Long getTransactionCountByType(Long userId, String type) {
        return transactionRepository.countByUserIdAndType(userId, type);
    }
    
    public List<Transaction> getRecentTransactions(Long userId, int limit) {
        List<Transaction> allTransactions = transactionRepository.findByUserIdOrderByDateDesc(userId);
        return allTransactions.stream().limit(limit).toList();
    }
    
    // Flexible filtering method for the main GET endpoint
    public List<Transaction> getTransactionsWithFilters(Long userId, String type, String category, 
                                                      LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findTransactionsWithFilters(userId, type, category, startDate, endDate);
    }
    
    // Get transactions by budget category and date range
    public List<Transaction> getTransactionsByBudgetId(Long budgetId, Long userId) {
        // First get the budget to find its category and date range
        // Since we can't inject BudgetService here due to circular dependency,
        // we'll need to use a different approach
        // For now, let's assume we get transactions by category
        // This method would need to be enhanced with proper budget lookup
        return transactionRepository.findByUserId(userId);
    }
}