package com.example.moneymanager.services;

import com.example.moneymanager.models.Transaction;
import com.example.moneymanager.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        return transactionRepository.findByUserId(userId);
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
}