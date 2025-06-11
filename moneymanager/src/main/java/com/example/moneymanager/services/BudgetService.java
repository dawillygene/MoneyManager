package com.example.moneymanager.services;

import com.example.moneymanager.models.Budget;
import com.example.moneymanager.repositories.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {
    @Autowired
    private BudgetRepository budgetRepository;

    public List<Budget> getAllBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    public Optional<Budget> getBudgetByIdAndUserId(Long id, Long userId) {
        Optional<Budget> budget = budgetRepository.findById(id);
        if (budget.isPresent() && budget.get().getUserId().equals(userId)) {
            return budget;
        }
        return Optional.empty();
    }

    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Long id, Budget updatedBudget, Long userId) {
        Optional<Budget> existingBudget = getBudgetByIdAndUserId(id, userId);
        if (existingBudget.isPresent()) {
            Budget budget = existingBudget.get();
            budget.setName(updatedBudget.getName());
            budget.setAmount(updatedBudget.getAmount());
            budget.setCategory(updatedBudget.getCategory());
            budget.setStartDate(updatedBudget.getStartDate());
            budget.setEndDate(updatedBudget.getEndDate());
            budget.setDescription(updatedBudget.getDescription());
            budget.setRecurring(updatedBudget.getRecurring());
            budget.setAlertLevel(updatedBudget.getAlertLevel());
            return budgetRepository.save(budget);
        }
        throw new RuntimeException("Budget not found or access denied");
    }

    public void deleteBudget(Long id, Long userId) {
        Optional<Budget> budget = getBudgetByIdAndUserId(id, userId);
        if (budget.isPresent()) {
            budgetRepository.deleteById(id);
        } else {
            throw new RuntimeException("Budget not found or access denied");
        }
    }
}