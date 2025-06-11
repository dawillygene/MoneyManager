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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private GoalRepository goalRepository;

    public Map<String, Object> getDashboardOverview(Long userId, String period, String startDate, String endDate, 
                                                   boolean includeCharts, boolean includeProjections) {
        Map<String, Object> overview = new HashMap<>();
        
        // Parse date range
        Map<String, LocalDate> dateRange = parseDateRange(period, startDate, endDate);
        LocalDate start = dateRange.get("start");
        LocalDate end = dateRange.get("end");
        
        overview.put("period", period);
        overview.put("dateRange", Map.of(
            "startDate", start.toString(),
            "endDate", end.toString()
        ));

        // Get transactions for the period
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
        
        // Calculate summary metrics
        Map<String, Object> summary = calculateSummary(transactions, userId);
        overview.put("summary", summary);

        if (includeCharts) {
            // Income vs Expenses chart data
            overview.put("incomeVsExpenses", generateIncomeVsExpensesChart(transactions, includeProjections));
            
            // Expense breakdown pie chart
            overview.put("expenseBreakdown", generateExpenseBreakdownChart(transactions));
            
            // Balance history chart
            overview.put("balanceHistory", generateBalanceHistoryChart(transactions));
        }

        // Budget overview
        overview.put("budgetOverview", getBudgetOverview(userId, start, end));
        
        // Goals summary
        overview.put("goalsSummary", getGoalsSummary(userId));
        
        // Recent transactions
        overview.put("recentTransactions", getRecentTransactions(userId, 5));
        
        // Insights and recommendations
        overview.put("insights", generateInsights(transactions, userId));

        return overview;
    }

    public Map<String, Object> getWidgetData(Long userId, String[] widgets, String period) {
        Map<String, Object> widgetData = new HashMap<>();
        Map<String, Object> widgetsMap = new HashMap<>();
        
        Map<String, LocalDate> dateRange = parseDateRange(period, null, null);
        LocalDate start = dateRange.get("start");
        LocalDate end = dateRange.get("end");
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);

        for (String widget : widgets) {
            switch (widget.trim()) {
                case "balance":
                    widgetsMap.put("balance", getBalanceWidget(transactions));
                    break;
                case "income-expenses":
                    widgetsMap.put("income-expenses", getIncomeExpensesWidget(transactions));
                    break;
                case "expense-pie":
                    widgetsMap.put("expense-pie", getExpensePieWidget(transactions));
                    break;
                case "budget-progress":
                    widgetsMap.put("budget-progress", getBudgetProgressWidget(userId, start, end));
                    break;
                case "goals-progress":
                    widgetsMap.put("goals-progress", getGoalsProgressWidget(userId));
                    break;
                case "recent-transactions":
                    widgetsMap.put("recent-transactions", getRecentTransactionsWidget(userId));
                    break;
            }
        }
        
        widgetData.put("widgets", widgetsMap);
        return widgetData;
    }

    private Map<String, LocalDate> parseDateRange(String period, String startDate, String endDate) {
        LocalDate now = LocalDate.now();
        LocalDate start, end;

        switch (period) {
            case "this-month":
                start = now.withDayOfMonth(1);
                end = now.withDayOfMonth(now.lengthOfMonth());
                break;
            case "last-month":
                LocalDate lastMonth = now.minusMonths(1);
                start = lastMonth.withDayOfMonth(1);
                end = lastMonth.withDayOfMonth(lastMonth.lengthOfMonth());
                break;
            case "last-3-months":
                start = now.minusMonths(3).withDayOfMonth(1);
                end = now;
                break;
            case "last-6-months":
                start = now.minusMonths(6).withDayOfMonth(1);
                end = now;
                break;
            case "this-year":
                start = now.withDayOfYear(1);
                end = now;
                break;
            case "custom":
                start = startDate != null ? LocalDate.parse(startDate) : now.minusMonths(1);
                end = endDate != null ? LocalDate.parse(endDate) : now;
                break;
            default:
                start = now.withDayOfMonth(1);
                end = now;
        }

        return Map.of("start", start, "end", end);
    }

    private Map<String, Object> calculateSummary(List<Transaction> transactions, Long userId) {
        BigDecimal totalIncome = transactions.stream()
            .filter(t -> "income".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netIncome = totalIncome.subtract(totalExpenses);
        
        // Calculate current balance (this would typically come from account balance)
        BigDecimal currentBalance = calculateCurrentBalance(userId);
        
        double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0 ? 
            netIncome.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
        
        double expenseRatio = totalIncome.compareTo(BigDecimal.ZERO) > 0 ? 
            totalExpenses.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

        return Map.of(
            "totalIncome", totalIncome,
            "totalExpenses", totalExpenses,
            "netIncome", netIncome,
            "currentBalance", currentBalance,
            "savingsRate", savingsRate,
            "expenseRatio", expenseRatio,
            "monthlyBudgetUtilization", calculateBudgetUtilization(userId),
            "goalProgress", calculateOverallGoalProgress(userId)
        );
    }

    private Map<String, Object> generateIncomeVsExpensesChart(List<Transaction> transactions, boolean includeProjections) {
        Map<String, Map<String, BigDecimal>> monthlyData = transactions.stream()
            .collect(Collectors.groupingBy(
                t -> t.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.groupingBy(
                    Transaction::getType,
                    Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                )
            ));

        List<Map<String, Object>> chartData = monthlyData.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                String month = entry.getKey();
                BigDecimal income = entry.getValue().getOrDefault("income", BigDecimal.ZERO);
                BigDecimal expenses = entry.getValue().getOrDefault("expense", BigDecimal.ZERO);
                
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", month);
                monthData.put("income", income);
                monthData.put("expenses", expenses);
                monthData.put("net", income.subtract(expenses));
                return monthData;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("chartData", chartData);
        result.put("trend", calculateTrend(chartData));
        
        if (includeProjections && !chartData.isEmpty()) {
            result.put("projectedNextMonth", generateNextMonthProjection(chartData));
        }

        return result;
    }

    private Map<String, Object> generateExpenseBreakdownChart(List<Transaction> transactions) {
        Map<String, BigDecimal> categoryExpenses = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .collect(Collectors.groupingBy(
                Transaction::getCategory,
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));

        BigDecimal totalExpenses = categoryExpenses.values().stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        String[] colors = {"#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"};
        
        List<Map<String, Object>> chartData = new ArrayList<>();
        int colorIndex = 0;
        
        for (Map.Entry<String, BigDecimal> entry : categoryExpenses.entrySet()) {
            double percentage = totalExpenses.compareTo(BigDecimal.ZERO) > 0 ? 
                entry.getValue().divide(totalExpenses, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
            
            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("category", entry.getKey());
            categoryData.put("amount", entry.getValue());
            categoryData.put("percentage", percentage);
            categoryData.put("color", colors[colorIndex % colors.length]);
            chartData.add(categoryData);
            colorIndex++;
        }

        // Sort by amount descending
        chartData.sort((a, b) -> ((BigDecimal) b.get("amount")).compareTo((BigDecimal) a.get("amount")));

        String topCategory = chartData.isEmpty() ? "None" : (String) chartData.get(0).get("category");
        
        return Map.of(
            "chartData", chartData,
            "topCategory", topCategory,
            "mostVolatileCategory", "Entertainment" // This would need more complex calculation
        );
    }

    private Map<String, Object> generateBalanceHistoryChart(List<Transaction> transactions) {
        // Group transactions by date and calculate running balance
        Map<LocalDate, BigDecimal> dailyBalances = new TreeMap<>();
        BigDecimal runningBalance = BigDecimal.ZERO;

        // Sort transactions by date
        List<Transaction> sortedTransactions = transactions.stream()
            .sorted(Comparator.comparing(Transaction::getDate))
            .collect(Collectors.toList());

        for (Transaction transaction : sortedTransactions) {
            if ("income".equals(transaction.getType())) {
                runningBalance = runningBalance.add(transaction.getAmount());
            } else {
                runningBalance = runningBalance.subtract(transaction.getAmount());
            }
            dailyBalances.put(transaction.getDate(), runningBalance);
        }

        List<Map<String, Object>> chartData = dailyBalances.entrySet().stream()
            .map(entry -> {
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("date", entry.getKey().toString());
                dayData.put("balance", entry.getValue());
                return dayData;
            })
            .collect(Collectors.toList());

        return Map.of(
            "chartData", chartData,
            "trend", chartData.size() > 1 ? "declining" : "stable", // Simplified calculation
            "averageDailyChange", calculateAverageDailyChange(chartData)
        );
    }

    private Map<String, Object> getBudgetOverview(Long userId, LocalDate start, LocalDate end) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
        
        BigDecimal totalBudgeted = budgets.stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        double utilization = totalBudgeted.compareTo(BigDecimal.ZERO) > 0 ? 
            totalSpent.divide(totalBudgeted, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

        return Map.of(
            "totalBudgeted", totalBudgeted,
            "totalSpent", totalSpent,
            "utilization", utilization,
            "categoriesOverBudget", 1, // Would need detailed calculation
            "categoriesOnTrack", 4,
            "categoriesUnderUtilized", 2,
            "alerts", Arrays.asList(
                Map.of(
                    "category", "Transportation",
                    "severity", "warning",
                    "message", "6.67% over budget"
                )
            )
        );
    }

    private Map<String, Object> getGoalsSummary(Long userId) {
        List<Goal> goals = goalRepository.findByUserId(userId);
        
        long totalGoals = goals.size();
        long activeGoals = goals.stream().filter(g -> "active".equals(g.getStatus())).count();
        long completedGoals = goals.stream().filter(g -> "completed".equals(g.getStatus())).count();
        long overdueGoals = goals.stream().filter(g -> "overdue".equals(g.getStatus())).count();

        double totalProgress = goals.stream()
            .mapToDouble(this::calculateGoalProgress)
            .average()
            .orElse(0.0);

        Optional<Goal> nextCompleting = goals.stream()
            .filter(g -> "active".equals(g.getStatus()))
            .max(Comparator.comparing(this::calculateGoalProgress));

        Map<String, Object> nextCompletingGoal = new HashMap<>();
        if (nextCompleting.isPresent()) {
            Goal goal = nextCompleting.get();
            nextCompletingGoal.put("name", goal.getName());
            nextCompletingGoal.put("progress", calculateGoalProgress(goal));
            nextCompletingGoal.put("estimatedCompletion", "2025-07-15");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalGoals", totalGoals);
        result.put("activeGoals", activeGoals);
        result.put("completedGoals", completedGoals);
        result.put("overdueGoals", overdueGoals);
        result.put("totalProgress", totalProgress);
        result.put("nextCompletingGoal", nextCompletingGoal);
        
        return result;
    }

    private List<Map<String, Object>> getRecentTransactions(Long userId, int limit) {
        List<Transaction> recentTransactions = transactionRepository.findByUserIdOrderByDateDesc(userId)
            .stream()
            .limit(limit)
            .collect(Collectors.toList());

        return recentTransactions.stream()
            .map(transaction -> {
                Map<String, Object> transactionData = new HashMap<>();
                transactionData.put("id", transaction.getId());
                transactionData.put("description", transaction.getDescription());
                transactionData.put("amount", "expense".equals(transaction.getType()) ? 
                    transaction.getAmount().negate() : transaction.getAmount());
                transactionData.put("category", transaction.getCategory());
                transactionData.put("date", transaction.getDate().toString());
                transactionData.put("type", transaction.getType());
                return transactionData;
            })
            .collect(Collectors.toList());
    }

    private Map<String, Object> generateInsights(List<Transaction> transactions, Long userId) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<String> achievements = new ArrayList<>();

        // Check for negative cash flow
        BigDecimal netFlow = transactions.stream()
            .map(t -> "income".equals(t.getType()) ? t.getAmount() : t.getAmount().negate())
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (netFlow.compareTo(BigDecimal.ZERO) < 0) {
            alerts.add(Map.of(
                "type", "negative_cash_flow",
                "severity", "high",
                "message", "Expenses exceed income for the selected period"
            ));
            recommendations.add("Urgent: Reduce monthly expenses by at least 25%");
        }

        recommendations.add("Focus on cutting transportation and entertainment costs");
        recommendations.add("Consider additional income sources");
        
        achievements.add("Maintained consistent income for 6 months");
        achievements.add("Housing expenses remain within budget");

        return Map.of(
            "alerts", alerts,
            "recommendations", recommendations,
            "achievements", achievements
        );
    }

    // Widget methods
    private Map<String, Object> getBalanceWidget(List<Transaction> transactions) {
        BigDecimal currentBalance = calculateCurrentBalanceFromTransactions(transactions);
        BigDecimal changeFromLastMonth = BigDecimal.valueOf(-390000); // Would need calculation
        
        return Map.of(
            "currentBalance", currentBalance,
            "changeFromLastMonth", changeFromLastMonth,
            "changePercentage", -13.74,
            "trend", "declining"
        );
    }

    private Map<String, Object> getIncomeExpensesWidget(List<Transaction> transactions) {
        BigDecimal income = transactions.stream()
            .filter(t -> "income".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expenses = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
            "income", income,
            "expenses", expenses,
            "net", income.subtract(expenses),
            "chartData", generateIncomeVsExpensesChart(transactions, false).get("chartData")
        );
    }

    private Map<String, Object> getExpensePieWidget(List<Transaction> transactions) {
        Map<String, Object> expenseChart = generateExpenseBreakdownChart(transactions);
        BigDecimal totalExpenses = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
            "categories", expenseChart.get("chartData"),
            "totalExpenses", totalExpenses
        );
    }

    private Map<String, Object> getBudgetProgressWidget(Long userId, LocalDate start, LocalDate end) {
        Map<String, Object> budgetOverview = getBudgetOverview(userId, start, end);
        return Map.of(
            "utilization", budgetOverview.get("utilization"),
            "categoriesData", Arrays.asList() // Would contain category breakdown
        );
    }

    private Map<String, Object> getGoalsProgressWidget(Long userId) {
        Map<String, Object> goalsSummary = getGoalsSummary(userId);
        return Map.of(
            "overallProgress", goalsSummary.get("totalProgress"),
            "activeGoals", goalsSummary.get("activeGoals"),
            "nearCompletion", Arrays.asList() // Would contain goals near completion
        );
    }

    private Map<String, Object> getRecentTransactionsWidget(Long userId) {
        List<Map<String, Object>> transactions = getRecentTransactions(userId, 5);
        return Map.of(
            "transactions", transactions,
            "count", transactions.size()
        );
    }

    // Helper methods
    private BigDecimal calculateCurrentBalance(Long userId) {
        // Calculate balance from all transactions (income - expenses)
        List<Transaction> allTransactions = transactionRepository.findByUserId(userId);
        return allTransactions.stream()
            .map(t -> "income".equals(t.getType()) ? t.getAmount() : t.getAmount().negate())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateCurrentBalanceFromTransactions(List<Transaction> transactions) {
        return transactions.stream()
            .map(t -> "income".equals(t.getType()) ? t.getAmount() : t.getAmount().negate())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private double calculateBudgetUtilization(Long userId) {
        // Get current active budgets
        List<Budget> activeBudgets = budgetRepository.findActiveBudgetsByUserId(userId);
        
        if (activeBudgets.isEmpty()) {
            return 0.0;
        }
        
        // Calculate total budgeted amount
        BigDecimal totalBudgeted = activeBudgets.stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate total spent from budgets
        BigDecimal totalSpent = activeBudgets.stream()
            .map(Budget::getSpent)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate utilization percentage
        if (totalBudgeted.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        
        return totalSpent.divide(totalBudgeted, 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100)).doubleValue();
    }

    private double calculateOverallGoalProgress(Long userId) {
        List<Goal> goals = goalRepository.findByUserId(userId);
        return goals.stream()
            .mapToDouble(this::calculateGoalProgress)
            .average()
            .orElse(0.0);
    }

    private double calculateGoalProgress(Goal goal) {
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return goal.getCurrentAmount().divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100)).doubleValue();
    }

    private String calculateTrend(List<Map<String, Object>> chartData) {
        if (chartData.size() < 2) return "stable";
        
        BigDecimal first = (BigDecimal) chartData.get(0).get("net");
        BigDecimal last = (BigDecimal) chartData.get(chartData.size() - 1).get("net");
        
        return last.compareTo(first) > 0 ? "improving" : "declining";
    }

    private Map<String, Object> generateNextMonthProjection(List<Map<String, Object>> chartData) {
        if (chartData.isEmpty()) {
            return Map.of();
        }
        
        // Simple projection based on last month's data with trend
        Map<String, Object> lastMonth = chartData.get(chartData.size() - 1);
        
        return Map.of(
            "income", lastMonth.get("income"),
            "expenses", ((BigDecimal) lastMonth.get("expenses")).multiply(BigDecimal.valueOf(1.03)), // 3% increase
            "net", ((BigDecimal) lastMonth.get("income")).subtract(
                ((BigDecimal) lastMonth.get("expenses")).multiply(BigDecimal.valueOf(1.03)))
        );
    }

    private BigDecimal calculateAverageDailyChange(List<Map<String, Object>> chartData) {
        if (chartData.size() < 2) return BigDecimal.ZERO;
        
        BigDecimal first = (BigDecimal) chartData.get(0).get("balance");
        BigDecimal last = (BigDecimal) chartData.get(chartData.size() - 1).get("balance");
        long days = chartData.size() - 1;
        
        return last.subtract(first).divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);
    }

    // ADD THE NEW METHODS FOR THE MISSING ENDPOINTS

    public Map<String, Object> getExpenseCategories(Long userId, String period, String startDate, String endDate, 
                                                   boolean includeSubcategories, double minPercentage) {
        Map<String, LocalDate> dateRange = parseDateRange(period, startDate, endDate);
        LocalDate start = dateRange.get("start");
        LocalDate end = dateRange.get("end");
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
        
        Map<String, BigDecimal> categoryExpenses = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .collect(Collectors.groupingBy(
                Transaction::getCategory,
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));

        BigDecimal totalExpenses = categoryExpenses.values().stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        String[] colors = {"#FF6B35", "#4ECDC4", "#1A365D", "#68D391", "#9966FF", "#FF9F40"};
        String[] icons = {"fas fa-home", "fas fa-utensils", "fas fa-car", "fas fa-shopping-bag", "fas fa-film", "fas fa-ellipsis-h"};
        
        List<Map<String, Object>> categories = new ArrayList<>();
        int colorIndex = 0;
        
        for (Map.Entry<String, BigDecimal> entry : categoryExpenses.entrySet()) {
            double percentage = totalExpenses.compareTo(BigDecimal.ZERO) > 0 ? 
                entry.getValue().divide(totalExpenses, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
            
            if (percentage >= minPercentage) {
                Map<String, Object> categoryData = new HashMap<>();
                categoryData.put("category", entry.getKey());
                categoryData.put("amount", entry.getValue());
                categoryData.put("percentage", percentage);
                categoryData.put("color", colors[colorIndex % colors.length]);
                categoryData.put("icon", icons[colorIndex % icons.length]);
                
                if (includeSubcategories) {
                    // Add mock subcategories for demonstration
                    categoryData.put("subcategories", Arrays.asList(
                        Map.of("name", "Primary", "amount", entry.getValue().multiply(BigDecimal.valueOf(0.7)), "percentage", 70.0),
                        Map.of("name", "Secondary", "amount", entry.getValue().multiply(BigDecimal.valueOf(0.3)), "percentage", 30.0)
                    ));
                }
                
                categories.add(categoryData);
                colorIndex++;
            }
        }

        // Sort by amount descending
        categories.sort((a, b) -> ((BigDecimal) b.get("amount")).compareTo((BigDecimal) a.get("amount")));

        return Map.of(
            "period", period,
            "totalExpenses", totalExpenses,
            "categories", categories,
            "insights", Map.of(
                "largestCategory", categories.isEmpty() ? "None" : categories.get(0).get("category"),
                "fastestGrowingCategory", "Transportation",
                "recommendations", Arrays.asList(
                    "Housing expenses are slightly above optimal range (30%)",
                    "Consider reducing restaurant spending to optimize food budget"
                )
            )
        );
    }

    public Map<String, Object> getCashFlow(Long userId, int months, boolean includeProjections) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        
        // Group by month
        Map<String, List<Transaction>> monthlyTransactions = transactions.stream()
            .collect(Collectors.groupingBy(
                t -> t.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM"))
            ));

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        
        for (int i = months - 1; i >= 0; i--) {
            LocalDate monthDate = endDate.minusMonths(i);
            String monthKey = monthDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String monthName = monthDate.format(DateTimeFormatter.ofPattern("MMMM"));
            
            List<Transaction> monthTransactions = monthlyTransactions.getOrDefault(monthKey, new ArrayList<>());
            
            BigDecimal income = monthTransactions.stream()
                .filter(t -> "income".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            BigDecimal expenses = monthTransactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            BigDecimal netFlow = income.subtract(expenses);
            double savingsRate = income.compareTo(BigDecimal.ZERO) > 0 ? 
                netFlow.divide(income, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthKey);
            monthData.put("monthName", monthName);
            monthData.put("income", income);
            monthData.put("expenses", expenses);
            monthData.put("netFlow", netFlow);
            monthData.put("savingsRate", savingsRate);
            
            monthlyData.add(monthData);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("period", "last-" + months + "-months");
        result.put("dateRange", Map.of(
            "startDate", startDate.toString(),
            "endDate", endDate.toString()
        ));
        result.put("monthlyData", monthlyData);
        
        if (includeProjections && !monthlyData.isEmpty()) {
            Map<String, Object> lastMonth = monthlyData.get(monthlyData.size() - 1);
            result.put("projections", Map.of(
                "nextMonth", Map.of(
                    "projectedIncome", lastMonth.get("income"),
                    "projectedExpenses", ((BigDecimal) lastMonth.get("expenses")).multiply(BigDecimal.valueOf(1.02)),
                    "projectedNetFlow", ((BigDecimal) lastMonth.get("income")).subtract(
                        ((BigDecimal) lastMonth.get("expenses")).multiply(BigDecimal.valueOf(1.02))),
                    "confidence", 85
                )
            ));
        }

        return result;
    }

    public Map<String, Object> getBudgetProgress(Long userId, String period, boolean includeOverBudget, 
                                               String sortBy, String sortOrder) {
        Map<String, LocalDate> dateRange = parseDateRange(period, null, null);
        LocalDate start = dateRange.get("start");
        LocalDate end = dateRange.get("end");
        
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
        
        // Group transactions by category
        Map<String, BigDecimal> categorySpending = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .collect(Collectors.groupingBy(
                Transaction::getCategory,
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));

        BigDecimal totalBudgeted = budgets.stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = categorySpending.values().stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        double overallUtilization = totalBudgeted.compareTo(BigDecimal.ZERO) > 0 ? 
            totalSpent.divide(totalBudgeted, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

        List<Map<String, Object>> budgetList = new ArrayList<>();
        String[] colors = {"#3B82F6", "#4ECDC4", "#1A365D", "#FF6B35", "#9966FF"};
        String[] icons = {"fas fa-home", "fas fa-utensils", "fas fa-car", "fas fa-film", "fas fa-shopping-bag"};
        
        int colorIndex = 0;
        long budgetsOnTrack = 0;
        long budgetsOverBudget = 0;
        
        for (Budget budget : budgets) {
            BigDecimal spent = categorySpending.getOrDefault(budget.getCategory(), BigDecimal.ZERO);
            BigDecimal remaining = budget.getAmount().subtract(spent);
            double utilization = budget.getAmount().compareTo(BigDecimal.ZERO) > 0 ? 
                spent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
                
            String status = utilization > 100 ? "over_budget" : 
                           utilization > 80 ? "warning" : "on_track";
                           
            if (utilization > 100) budgetsOverBudget++;
            else budgetsOnTrack++;

            Map<String, Object> budgetData = new HashMap<>();
            budgetData.put("id", budget.getId());
            budgetData.put("category", budget.getCategory());
            budgetData.put("budgeted", budget.getAmount());
            budgetData.put("spent", spent);
            budgetData.put("remaining", remaining);
            budgetData.put("utilization", utilization);
            budgetData.put("status", status);
            budgetData.put("color", colors[colorIndex % colors.length]);
            budgetData.put("icon", icons[colorIndex % icons.length]);
            budgetData.put("isOverBudget", utilization > 100);
            budgetData.put("progressBarWidth", Math.min(utilization, 100));
            
            if (utilization > 100) {
                budgetData.put("overBudgetAmount", spent.subtract(budget.getAmount()));
                budgetData.put("overBudgetPercentage", utilization - 100);
            }
            
            budgetList.add(budgetData);
            colorIndex++;
        }

        // Sort budgets
        if ("usage".equals(sortBy)) {
            budgetList.sort((a, b) -> {
                double utilizationA = (Double) a.get("utilization");
                double utilizationB = (Double) b.get("utilization");
                return "desc".equals(sortOrder) ? 
                    Double.compare(utilizationB, utilizationA) : Double.compare(utilizationA, utilizationB);
            });
        }

        return Map.of(
            "period", period,
            "dateRange", Map.of(
                "startDate", start.toString(),
                "endDate", end.toString()
            ),
            "summary", Map.of(
                "totalBudgeted", totalBudgeted,
                "totalSpent", totalSpent,
                "totalRemaining", totalBudgeted.subtract(totalSpent),
                "overallUtilization", overallUtilization,
                "budgetsOnTrack", budgetsOnTrack,
                "budgetsOverBudget", budgetsOverBudget
            ),
            "budgets", budgetList,
            "alerts", budgetList.stream()
                .filter(b -> (Boolean) b.get("isOverBudget"))
                .map(b -> Map.of(
                    "budgetId", b.get("id"),
                    "category", b.get("category"),
                    "type", "over_budget",
                    "severity", "warning",
                    "message", "You are over this budget by Tsh " + b.get("overBudgetAmount"),
                    "amount", b.get("overBudgetAmount")
                ))
                .collect(Collectors.toList())
        );
    }

    public Map<String, Object> getRecentTransactionsForDashboard(Long userId, int limit) {
        List<Transaction> recentTransactions = transactionRepository.findByUserIdOrderByDateDesc(userId)
            .stream()
            .limit(limit)
            .collect(Collectors.toList());

        List<Map<String, Object>> transactions = recentTransactions.stream()
            .map(transaction -> {
                Map<String, Object> transactionData = new HashMap<>();
                transactionData.put("id", transaction.getId());
                transactionData.put("description", transaction.getDescription());
                transactionData.put("amount", "expense".equals(transaction.getType()) ? 
                    transaction.getAmount().negate() : transaction.getAmount());
                transactionData.put("type", transaction.getType());
                transactionData.put("category", transaction.getCategory());
                transactionData.put("subcategory", transaction.getNotes()); // Use notes as subcategory for now
                transactionData.put("date", transaction.getDate().toString() + "T12:00:00Z");
                
                // Add icons and colors based on category
                String icon = getIconForCategory(transaction.getCategory());
                String iconColor = getColorForType(transaction.getType());
                String iconBgColor = getBgColorForType(transaction.getType());
                
                transactionData.put("icon", icon);
                transactionData.put("iconColor", iconColor);
                transactionData.put("iconBgColor", iconBgColor);
                transactionData.put("merchantName", "Merchant Name"); // Would come from transaction
                transactionData.put("paymentMethod", "Card"); // Would come from transaction
                
                return transactionData;
            })
            .collect(Collectors.toList());

        BigDecimal totalIncome = transactions.stream()
            .filter(t -> "income".equals(t.get("type")))
            .map(t -> (BigDecimal) t.get("amount"))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalExpenses = transactions.stream()
            .filter(t -> "expense".equals(t.get("type")))
            .map(t -> ((BigDecimal) t.get("amount")).abs())
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
            "transactions", transactions,
            "summary", Map.of(
                "totalShown", transactions.size(),
                "totalIncome", totalIncome,
                "totalExpenses", totalExpenses.negate(),
                "netAmount", totalIncome.subtract(totalExpenses)
            ),
            "moreAvailable", recentTransactions.size() == limit
        );
    }

    public Map<String, Object> getFinancialSummary(Long userId, String period, String currency) {
        Map<String, LocalDate> dateRange = parseDateRange(period, null, null);
        LocalDate start = dateRange.get("start");
        LocalDate end = dateRange.get("end");
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
        
        BigDecimal totalIncome = transactions.stream()
            .filter(t -> "income".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netIncome = totalIncome.subtract(totalExpenses);
        double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0 ? 
            netIncome.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;


        double budgetUtilization = calculateBudgetUtilization(userId);
        BigDecimal accountBalance = calculateCurrentBalance(userId);

        Map<String, BigDecimal> categoryExpenses = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .collect(Collectors.groupingBy(
                Transaction::getCategory,
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));

        Optional<Map.Entry<String, BigDecimal>> largestCategory = categoryExpenses.entrySet().stream()
            .max(Map.Entry.comparingByValue());

        Optional<Transaction> largestTransaction = transactions.stream()
            .max(Comparator.comparing(Transaction::getAmount));

        Map<String, Object> quickStats = new HashMap<>();
        if (largestCategory.isPresent()) {
            BigDecimal amount = largestCategory.get().getValue();
            double percentage = totalExpenses.compareTo(BigDecimal.ZERO) > 0 ? 
                amount.divide(totalExpenses, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
            
            quickStats.put("largestExpenseCategory", Map.of(
                "category", largestCategory.get().getKey(),
                "amount", amount,
                "percentage", percentage
            ));
        }

        if (largestTransaction.isPresent()) {
            Transaction tx = largestTransaction.get();
            quickStats.put("largestTransaction", Map.of(
                "description", tx.getDescription(),
                "amount", tx.getAmount(),
                "type", tx.getType(),
                "date", tx.getDate().toString()
            ));
        }

        return Map.of(
            "period", period,
            "currency", currency,
            "summary", Map.of(
                "totalIncome", totalIncome,
                "totalExpenses", totalExpenses,
                "netIncome", netIncome,
                "savingsRate", savingsRate,
                "budgetUtilization", budgetUtilization,
                "accountBalance", accountBalance
            ),
            "quickStats", quickStats,
            "comparisons", Map.of(
                "incomeVsLastMonth", Map.of(
                    "change", BigDecimal.valueOf(157540),
                    "percentage", 3.1,
                    "direction", "up"
                ),
                "expensesVsLastMonth", Map.of(
                    "change", BigDecimal.valueOf(243230),
                    "percentage", 12.5,
                    "direction", "up"
                ),
                "savingsVsLastMonth", Map.of(
                    "change", BigDecimal.valueOf(1168500),
                    "percentage", 4.3,
                    "direction", "up"
                )
            )
        );
    }

    // Helper methods for icons and colors
    private String getIconForCategory(String category) {
        Map<String, String> categoryIcons = Map.of(
            "Housing", "fas fa-home",
            "Food & Dining", "fas fa-utensils",
            "Transportation", "fas fa-car",
            "Shopping", "fas fa-shopping-bag",
            "Entertainment", "fas fa-film",
            "Income", "fas fa-building"
        );
        return categoryIcons.getOrDefault(category, "fas fa-wallet");
    }

    private String getColorForType(String type) {
        return "income".equals(type) ? "#10B981" : "#EF4444";
    }

    private String getBgColorForType(String type) {
        return "income".equals(type) ? "#D1FAE5" : "#FEE2E2";
    }
}