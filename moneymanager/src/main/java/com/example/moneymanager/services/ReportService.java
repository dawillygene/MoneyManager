package com.example.moneymanager.services;

import com.example.moneymanager.models.Transaction;
import com.example.moneymanager.models.Budget;
import com.example.moneymanager.models.Goal;
import com.example.moneymanager.repositories.TransactionRepository;
import com.example.moneymanager.repositories.BudgetRepository;
import com.example.moneymanager.repositories.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {
    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private GoalRepository goalRepository;

    public Map<String, Object> getMonthlyReport(Long userId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        
        Map<String, Object> report = new HashMap<>();
        report.put("period", String.format("%d-%02d", year, month));
        report.put("startDate", startDate.toString());
        report.put("endDate", endDate.toString());
        
        // Calculate totals
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "income".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        report.put("totalIncome", totalIncome);
        report.put("totalExpenses", totalExpenses);
        report.put("netIncome", totalIncome.subtract(totalExpenses));
        
        // Category breakdown
        Map<String, BigDecimal> categoryBreakdown = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        
        report.put("categoryBreakdown", categoryBreakdown);
        report.put("transactionCount", transactions.size());
        report.put("budgetCount", budgets.size());
        
        return report;
    }

    public Map<String, Object> getYearlyReport(Long userId, int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<Goal> goals = goalRepository.findByUserId(userId);
        
        Map<String, Object> report = new HashMap<>();
        report.put("year", year);
        report.put("startDate", startDate.toString());
        report.put("endDate", endDate.toString());
        
        // Calculate totals
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "income".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        report.put("totalIncome", totalIncome);
        report.put("totalExpenses", totalExpenses);
        report.put("netIncome", totalIncome.subtract(totalExpenses));
        
        // Monthly breakdown
        Map<String, Map<String, BigDecimal>> monthlyBreakdown = new HashMap<>();
        for (int month = 1; month <= 12; month++) {
            LocalDate monthStart = LocalDate.of(year, month, 1);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
            
            List<Transaction> monthTransactions = transactions.stream()
                    .filter(t -> !t.getDate().isBefore(monthStart) && !t.getDate().isAfter(monthEnd))
                    .collect(Collectors.toList());
            
            BigDecimal monthIncome = monthTransactions.stream()
                    .filter(t -> "income".equals(t.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal monthExpenses = monthTransactions.stream()
                    .filter(t -> "expense".equals(t.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, BigDecimal> monthData = new HashMap<>();
            monthData.put("income", monthIncome);
            monthData.put("expenses", monthExpenses);
            monthData.put("net", monthIncome.subtract(monthExpenses));
            
            monthlyBreakdown.put(String.format("%02d", month), monthData);
        }
        
        report.put("monthlyBreakdown", monthlyBreakdown);
        report.put("transactionCount", transactions.size());
        report.put("budgetCount", budgets.size());
        report.put("goalCount", goals.size());
        
        return report;
    }

    public Map<String, Object> getCustomReport(Long userId, String startDateStr, String endDateStr) {
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        
        Map<String, Object> report = new HashMap<>();
        report.put("startDate", startDateStr);
        report.put("endDate", endDateStr);
        report.put("period", String.format("%s to %s", startDateStr, endDateStr));
        
        // Calculate totals
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "income".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        report.put("totalIncome", totalIncome);
        report.put("totalExpenses", totalExpenses);
        report.put("netIncome", totalIncome.subtract(totalExpenses));
        
        // Category breakdown
        Map<String, BigDecimal> categoryBreakdown = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        
        report.put("categoryBreakdown", categoryBreakdown);
        report.put("transactionCount", transactions.size());
        report.put("transactions", transactions);
        
        return report;
    }

    public Map<String, Object> exportReport(Long userId, String type, Integer year, Integer month, 
                                          String startDate, String endDate) {
        Map<String, Object> reportData;
        
        switch (type.toLowerCase()) {
            case "monthly":
                if (year == null || month == null) {
                    throw new IllegalArgumentException("Year and month are required for monthly reports");
                }
                reportData = getMonthlyReport(userId, year, month);
                break;
            case "yearly":
                if (year == null) {
                    throw new IllegalArgumentException("Year is required for yearly reports");
                }
                reportData = getYearlyReport(userId, year);
                break;
            case "custom":
                if (startDate == null || endDate == null) {
                    throw new IllegalArgumentException("Start date and end date are required for custom reports");
                }
                reportData = getCustomReport(userId, startDate, endDate);
                break;
            default:
                throw new IllegalArgumentException("Invalid report type: " + type);
        }
        
        // Add export metadata
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("reportType", type);
        exportData.put("exportDate", LocalDate.now().toString());
        exportData.put("data", reportData);
        exportData.put("format", "json"); // Could be extended to support CSV, PDF, etc.
        
        return exportData;
    }
}