package com.example.moneymanager.services;

import com.example.moneymanager.models.Transaction;
import com.example.moneymanager.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;

    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
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
        Optional<Transaction> existingTransaction = getTransactionByIdAndUserId(id, userId);
        if (existingTransaction.isPresent()) {
            Transaction transaction = existingTransaction.get();
            transaction.setAmount(updatedTransaction.getAmount());
            transaction.setDescription(updatedTransaction.getDescription());
            transaction.setCategory(updatedTransaction.getCategory());
            transaction.setType(updatedTransaction.getType());
            transaction.setDate(updatedTransaction.getDate());
            transaction.setNotes(updatedTransaction.getNotes());
            return transactionRepository.save(transaction);
        }
        throw new RuntimeException("Transaction not found or access denied");
    }

    public void deleteTransaction(Long id, Long userId) {
        Optional<Transaction> transaction = getTransactionByIdAndUserId(id, userId);
        if (transaction.isPresent()) {
            transactionRepository.deleteById(id);
        } else {
            throw new RuntimeException("Transaction not found or access denied");
        }
    }

    public List<Transaction> getTransactionsByBudgetId(Long budgetId, Long userId) {
        // This assumes transactions have a budgetId field - you may need to adjust based on your data model
        return transactionRepository.findByUserIdAndCategory(userId, "budget-" + budgetId);
    }
    
    // Enhanced filtering methods
    public List<Transaction> getTransactionsByType(Long userId, String type) {
        return transactionRepository.findByUserIdAndTypeOrderByDateDesc(userId, type);
    }
    
    public List<Transaction> getTransactionsByCategory(Long userId, String category) {
        return transactionRepository.findByUserIdAndCategoryOrderByDateDesc(userId, category);
    }
    
    public List<Transaction> getTransactionsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }
    
    public List<Transaction> getTransactionsByTypeAndCategory(Long userId, String type, String category) {
        return transactionRepository.findByUserIdAndTypeAndCategory(userId, type, category);
    }
    
    public List<Transaction> getTransactionsByTypeAndDateRange(Long userId, String type, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndTypeAndDateBetween(userId, type, startDate, endDate);
    }
    
    public List<Transaction> getTransactionsByCategoryAndDateRange(Long userId, String category, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndCategoryAndDateBetween(userId, category, startDate, endDate);
    }
    
    public List<Transaction> getTransactionsWithAllFilters(Long userId, String type, String category, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndTypeAndCategoryAndDateBetween(userId, type, category, startDate, endDate);
    }
    
    // Flexible filtering method
    public List<Transaction> getFilteredTransactions(Long userId, String type, String category, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findTransactionsWithFilters(userId, type, category, startDate, endDate);
    }
    
    // Get transactions by month and year
    public List<Transaction> getTransactionsByMonthAndYear(Long userId, int year, int month) {
        return transactionRepository.findByUserIdAndYearAndMonth(userId, year, month);
    }
    
    // Statistics methods
    public Long getTransactionCountByType(Long userId, String type) {
        return transactionRepository.countByUserIdAndType(userId, type);
    }
    
    public List<Transaction> getRecentTransactions(Long userId, int limit) {
        List<Transaction> allTransactions = transactionRepository.findByUserIdOrderByDateDesc(userId);
        return allTransactions.stream().limit(limit).toList();
    }
}