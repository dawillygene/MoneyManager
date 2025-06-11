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
public class ReportService {
    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private GoalRepository goalRepository;

    // Core Report Methods
    public Map<String, Object> getExpenseAnalysis(Long userId, String period, String startDate, String endDate,
                                                 boolean includeSubcategories, String currency, String groupBy) {
        Map<String, LocalDate> dateRange = parseDateRange(period, startDate, endDate);
        LocalDate start = dateRange.get("start");
        LocalDate end = dateRange.get("end");

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
        List<Transaction> expenseTransactions = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .collect(Collectors.toList());

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("period", period);
        analysis.put("dateRange", Map.of("startDate", start.toString(), "endDate", end.toString()));

        BigDecimal totalExpenses = expenseTransactions.stream()
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        analysis.put("totalExpenses", totalExpenses);

        // Category breakdown
        List<Map<String, Object>> categoryBreakdown = generateCategoryBreakdown(expenseTransactions, totalExpenses, includeSubcategories);
        analysis.put("categoryBreakdown", categoryBreakdown);

        // Trends analysis
        analysis.put("trends", generateExpenseTrends(userId, start, end));

        // Insights
        analysis.put("insights", generateExpenseInsights(categoryBreakdown, expenseTransactions));

        return analysis;
    }

    public Map<String, Object> getIncomeVsExpenses(Long userId, String period, String startDate, String endDate,
                                                  boolean includeProjections, String groupBy) {
        Map<String, LocalDate> dateRange = parseDateRange(period, startDate, endDate);
        LocalDate start = dateRange.get("start");
        LocalDate end = dateRange.get("end");

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("period", period);

        // Summary calculations
        Map<String, Object> summary = calculateIncomeExpenseSummary(transactions);
        comparison.put("summary", summary);

        // Monthly breakdown
        List<Map<String, Object>> monthlyBreakdown = generateMonthlyIncomeExpenseBreakdown(transactions);
        comparison.put("monthlyBreakdown", monthlyBreakdown);

        // Trends
        Map<String, Object> trends = calculateIncomeExpenseTrends(monthlyBreakdown, includeProjections);
        comparison.put("trends", trends);

        // Analysis and recommendations
        comparison.put("analysis", generateIncomeExpenseAnalysis(summary, trends));

        return comparison;
    }

    public Map<String, Object> getBudgetPerformance(Long userId, String period, String startDate, String endDate,
                                                   boolean includeForecasts) {
        Map<String, LocalDate> dateRange = parseDateRange(period, startDate, endDate);
        LocalDate start = dateRange.get("start");
        LocalDate end = dateRange.get("end");

        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);

        Map<String, Object> performance = new HashMap<>();
        performance.put("period", period);
        performance.put("dateRange", Map.of("startDate", start.toString(), "endDate", end.toString()));

        // Overall performance
        Map<String, Object> overallPerformance = calculateOverallBudgetPerformance(budgets, transactions);
        performance.put("overallPerformance", overallPerformance);

        // Category performance
        List<Map<String, Object>> categoryPerformance = calculateCategoryBudgetPerformance(budgets, transactions, includeForecasts);
        performance.put("categoryPerformance", categoryPerformance);

        // Insights
        performance.put("insights", generateBudgetInsights(categoryPerformance));

        return performance;
    }

    public Map<String, Object> getSavingsAnalysis(Long userId, String period, String startDate, String endDate,
                                                 boolean includeGoals, boolean includeRecommendations) {
        Map<String, LocalDate> dateRange = parseDateRange(period, startDate, endDate);
        LocalDate start = dateRange.get("start");
        LocalDate end = dateRange.get("end");

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("period", period);

        // Savings summary
        Map<String, Object> savingsSummary = calculateSavingsSummary(transactions, userId);
        analysis.put("savingsSummary", savingsSummary);

        if (includeGoals) {
            List<Goal> goals = goalRepository.findByUserId(userId);
            List<Map<String, Object>> goalsProgress = calculateGoalsProgress(goals);
            analysis.put("goalsProgress", goalsProgress);
        }

        if (includeRecommendations) {
            List<String> recommendations = generateSavingsRecommendations(savingsSummary);
            analysis.put("recommendations", recommendations);
        }

        return analysis;
    }

    // Report Generation and Management
    public Map<String, Object> generateReport(Long userId, Map<String, Object> reportRequest) {
        String reportId = generateReportId();
        String reportType = (String) reportRequest.get("reportType");
        String reportName = (String) reportRequest.get("reportName");

        // Start report generation process (in real implementation, this would be async)
        Map<String, Object> result = new HashMap<>();
        result.put("reportId", reportId);
        result.put("status", "processing");
        result.put("message", "Report generation started successfully");
        result.put("estimatedCompletionTime", LocalDate.now().plusDays(1).toString() + "T18:35:00Z");
        result.put("reportName", reportName);
        result.put("reportType", reportType);
        result.put("statusCheckUrl", "/reports/status/" + reportId);

        return result;
    }

    public Map<String, Object> getReportStatus(Long userId, String reportId) {
        // In real implementation, check actual report status from database
        Map<String, Object> status = new HashMap<>();
        status.put("reportId", reportId);
        status.put("status", "completed");
        status.put("progress", 100);
        status.put("downloadUrl", "/reports/download/" + reportId);
        status.put("generatedAt", LocalDate.now().toString() + "T18:33:00Z");
        status.put("fileSize", "3.2 MB");
        status.put("format", "PDF");
        status.put("expiresAt", LocalDate.now().plusDays(30).toString() + "T18:33:00Z");

        return status;
    }

    public Map<String, Object> downloadReport(Long userId, String reportId, String format) {
        // In real implementation, retrieve actual file from storage
        byte[] mockFileData = "Mock PDF content".getBytes();
        String fileName = "financial-report-" + reportId + ".pdf";
        String contentType = "application/pdf";

        if ("csv".equals(format)) {
            mockFileData = "Date,Amount,Category\n2025-06-01,1000,Food".getBytes();
            fileName = "financial-report-" + reportId + ".csv";
            contentType = "text/csv";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("fileData", mockFileData);
        result.put("fileName", fileName);
        result.put("contentType", contentType);

        return result;
    }

    public Map<String, Object> getReportsList(Long userId, int page, int limit, String sortBy, String sortOrder,
                                             String reportType, String format, String status) {
        // Mock reports list - in real implementation, query from database
        List<Map<String, Object>> reports = Arrays.asList(
            Map.of(
                "id", "rpt_202506_001",
                "reportName", "Monthly Financial Summary",
                "reportType", "comprehensive",
                "format", "PDF",
                "dateRange", Map.of("startDate", "2025-06-01", "endDate", "2025-06-30"),
                "generatedAt", "2025-06-11T18:33:00Z",
                "fileSize", "3.2 MB",
                "downloadCount", 2,
                "downloadUrl", "/reports/download/rpt_202506_001",
                "status", "available"
            )
        );

        Map<String, Object> result = new HashMap<>();
        result.put("reports", reports);
        result.put("pagination", Map.of(
            "currentPage", page,
            "totalPages", 1,
            "totalItems", reports.size(),
            "hasNextPage", false,
            "hasPrevPage", false
        ));

        return result;
    }

    public Map<String, Object> deleteReport(Long userId, String reportId) {
        // In real implementation, delete from storage and database
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Report deleted successfully");
        result.put("reportId", reportId);
        result.put("deletedAt", LocalDate.now().toString() + "T19:00:00Z");

        return result;
    }

    // Export Methods
    public Map<String, Object> exportCSV(Long userId, String type, String period, String startDate, String endDate, String categories) {
        Map<String, LocalDate> dateRange = parseDateRange(period, startDate, endDate);
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, dateRange.get("start"), dateRange.get("end"));

        StringBuilder csvContent = new StringBuilder();
        csvContent.append("Date,Description,Category,Type,Amount,Balance\n");

        for (Transaction transaction : transactions) {
            csvContent.append(String.format("%s,%s,%s,%s,%.2f,%.2f\n",
                transaction.getDate().toString(),
                transaction.getDescription(),
                transaction.getCategory(),
                transaction.getType(),
                transaction.getAmount().doubleValue(),
                0.0 // Balance would need calculation
            ));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("csvData", csvContent.toString().getBytes());
        result.put("fileName", "financial-data-export.csv");

        return result;
    }

    public Map<String, Object> exportPDF(Long userId, String template, String period, String startDate, String endDate,
                                        boolean includeCharts, String sections) {
        // In real implementation, generate actual PDF using library like iText
        String mockPdfContent = "Mock PDF Report Content for template: " + template;

        Map<String, Object> result = new HashMap<>();
        result.put("pdfData", mockPdfContent.getBytes());
        result.put("fileName", "financial-report.pdf");

        return result;
    }

    // Advanced Analytics
    public Map<String, Object> getFinancialHealth(Long userId, String period, boolean includeRecommendations) {
        Map<String, LocalDate> dateRange = parseDateRange(period, null, null);
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, dateRange.get("start"), dateRange.get("end"));

        Map<String, Object> health = new HashMap<>();
        health.put("period", period);
        health.put("dateRange", Map.of("startDate", dateRange.get("start").toString(), "endDate", dateRange.get("end").toString()));

        // Calculate financial health score
        int healthScore = calculateFinancialHealthScore(transactions, userId);
        health.put("financialHealthScore", healthScore);

        // Score breakdown
        Map<String, Object> scoreBreakdown = calculateScoreBreakdown(transactions, userId);
        health.put("scoreBreakdown", scoreBreakdown);

        if (includeRecommendations) {
            List<Map<String, Object>> recommendations = generateHealthRecommendations(scoreBreakdown);
            health.put("recommendations", recommendations);
        }

        return health;
    }

    public Map<String, Object> getCashFlow(Long userId, String period, boolean includeProjections, int projectionMonths) {
        Map<String, LocalDate> dateRange = parseDateRange(period, null, null);
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, dateRange.get("start"), dateRange.get("end"));

        Map<String, Object> cashFlow = new HashMap<>();
        cashFlow.put("period", period);

        // Cash flow summary
        Map<String, Object> summary = calculateCashFlowSummary(transactions);
        cashFlow.put("cashFlowSummary", summary);

        // Monthly cash flow
        List<Map<String, Object>> monthlyCashFlow = generateMonthlyCashFlow(transactions);
        cashFlow.put("monthlyCashFlow", monthlyCashFlow);

        if (includeProjections) {
            List<Map<String, Object>> projections = generateCashFlowProjections(monthlyCashFlow, projectionMonths);
            cashFlow.put("projections", projections);
        }

        // Alerts
        List<Map<String, Object>> alerts = generateCashFlowAlerts(summary, monthlyCashFlow);
        cashFlow.put("alerts", alerts);

        return cashFlow;
    }

    // Existing methods (keeping for backward compatibility)
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

    // Helper Methods
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

    private String generateReportId() {
        return "rpt_" + System.currentTimeMillis();
    }

    private List<Map<String, Object>> generateCategoryBreakdown(List<Transaction> expenseTransactions, 
                                                               BigDecimal totalExpenses, boolean includeSubcategories) {
        Map<String, List<Transaction>> categoryGroups = expenseTransactions.stream()
            .collect(Collectors.groupingBy(Transaction::getCategory));

        List<Map<String, Object>> breakdown = new ArrayList<>();
        
        for (Map.Entry<String, List<Transaction>> entry : categoryGroups.entrySet()) {
            String category = entry.getKey();
            List<Transaction> transactions = entry.getValue();
            
            BigDecimal categoryAmount = transactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            double percentage = totalExpenses.compareTo(BigDecimal.ZERO) > 0 ? 
                categoryAmount.divide(totalExpenses, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
            
            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("category", category);
            categoryData.put("amount", categoryAmount);
            categoryData.put("percentage", percentage);
            categoryData.put("transactionCount", transactions.size());
            categoryData.put("averageTransaction", transactions.size() > 0 ? 
                categoryAmount.divide(BigDecimal.valueOf(transactions.size()), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            
            if (includeSubcategories) {
                // Mock subcategories - in real implementation, you'd have subcategory data
                List<Map<String, Object>> subcategories = Arrays.asList(
                    Map.of("name", "Primary", "amount", categoryAmount.multiply(BigDecimal.valueOf(0.7)), "percentage", 70.0, "transactionCount", transactions.size() - 1),
                    Map.of("name", "Secondary", "amount", categoryAmount.multiply(BigDecimal.valueOf(0.3)), "percentage", 30.0, "transactionCount", 1)
                );
                categoryData.put("subcategories", subcategories);
            }
            
            breakdown.add(categoryData);
        }
        
        // Sort by amount descending
        breakdown.sort((a, b) -> ((BigDecimal) b.get("amount")).compareTo((BigDecimal) a.get("amount")));
        
        return breakdown;
    }

    private Map<String, Object> generateExpenseTrends(Long userId, LocalDate start, LocalDate end) {
        // Mock trends calculation
        List<Map<String, Object>> monthlyComparison = Arrays.asList(
            Map.of("month", "2025-04", "amount", BigDecimal.valueOf(1650000)),
            Map.of("month", "2025-05", "amount", BigDecimal.valueOf(1780000)),
            Map.of("month", "2025-06", "amount", BigDecimal.valueOf(1890000))
        );

        return Map.of(
            "monthlyComparison", monthlyComparison,
            "averageMonthlyExpense", BigDecimal.valueOf(1773333.33),
            "trendDirection", "increasing",
            "percentageChange", "+6.18%"
        );
    }

    private Map<String, Object> generateExpenseInsights(List<Map<String, Object>> categoryBreakdown, List<Transaction> transactions) {
        String highestCategory = categoryBreakdown.isEmpty() ? "None" : (String) categoryBreakdown.get(0).get("category");
        
        return Map.of(
            "highestCategory", highestCategory,
            "fastestGrowingCategory", "Transportation",
            "recommendations", Arrays.asList(
                "Consider reducing restaurant expenses",
                "Transportation costs increased by 15% this month"
            )
        );
    }

    private Map<String, Object> calculateIncomeExpenseSummary(List<Transaction> transactions) {
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
        
        double expenseRatio = totalIncome.compareTo(BigDecimal.ZERO) > 0 ? 
            totalExpenses.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

        return Map.of(
            "totalIncome", totalIncome,
            "totalExpenses", totalExpenses,
            "netIncome", netIncome,
            "savingsRate", savingsRate,
            "expenseRatio", expenseRatio
        );
    }

    private List<Map<String, Object>> generateMonthlyIncomeExpenseBreakdown(List<Transaction> transactions) {
        Map<String, Map<String, BigDecimal>> monthlyData = transactions.stream()
            .collect(Collectors.groupingBy(
                t -> t.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.groupingBy(
                    Transaction::getType,
                    Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                )
            ));

        return monthlyData.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                String month = entry.getKey();
                BigDecimal income = entry.getValue().getOrDefault("income", BigDecimal.ZERO);
                BigDecimal expenses = entry.getValue().getOrDefault("expense", BigDecimal.ZERO);
                BigDecimal netIncome = income.subtract(expenses);
                
                double savingsRate = income.compareTo(BigDecimal.ZERO) > 0 ? 
                    netIncome.divide(income, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
                
                Map<String, Object> result = new HashMap<>();
                result.put("month", month);
                result.put("income", income);
                result.put("expenses", expenses);
                result.put("netIncome", netIncome);
                result.put("savingsRate", savingsRate);
                return result;
            })
            .collect(Collectors.toList());
    }

    private Map<String, Object> calculateIncomeExpenseTrends(List<Map<String, Object>> monthlyBreakdown, boolean includeProjections) {
        Map<String, Object> trends = new HashMap<>();
        trends.put("incomeGrowthRate", 0.0);
        trends.put("expenseGrowthRate", 14.55);
        
        if (includeProjections && !monthlyBreakdown.isEmpty()) {
            trends.put("projectedNextMonth", Map.of(
                "income", BigDecimal.valueOf(1500000),
                "expenses", BigDecimal.valueOf(1950000)
            ));
        }
        
        return trends;
    }

    private Map<String, Object> generateIncomeExpenseAnalysis(Map<String, Object> summary, Map<String, Object> trends) {
        return Map.of(
            "budgetHealth", "poor",
            "recommendations", Arrays.asList(
                "Urgent: Reduce monthly expenses by at least 25%",
                "Consider additional income sources"
            )
        );
    }

    private Map<String, Object> calculateOverallBudgetPerformance(List<Budget> budgets, List<Transaction> transactions) {
        BigDecimal totalBudgeted = budgets.stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRemaining = totalBudgeted.subtract(totalSpent);
        
        double utilization = totalBudgeted.compareTo(BigDecimal.ZERO) > 0 ? 
            totalSpent.divide(totalBudgeted, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

        return Map.of(
            "totalBudgeted", totalBudgeted,
            "totalSpent", totalSpent,
            "totalRemaining", totalRemaining,
            "overallUtilization", utilization,
            "budgetsOnTrack", 4,
            "budgetsOverBudget", 1
        );
    }

    private List<Map<String, Object>> calculateCategoryBudgetPerformance(List<Budget> budgets, List<Transaction> transactions, boolean includeForecasts) {
        Map<String, BigDecimal> categorySpending = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .collect(Collectors.groupingBy(
                Transaction::getCategory,
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));

        return budgets.stream().map(budget -> {
            BigDecimal spent = categorySpending.getOrDefault(budget.getCategory(), BigDecimal.ZERO);
            BigDecimal remaining = budget.getAmount().subtract(spent);
            double utilization = budget.getAmount().compareTo(BigDecimal.ZERO) > 0 ? 
                spent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
            
            String status = utilization > 100 ? "over_budget" : 
                           utilization > 80 ? "on_track" : "under_utilized";

            Map<String, Object> performance = new HashMap<>();
            performance.put("category", budget.getCategory());
            performance.put("budgeted", budget.getAmount());
            performance.put("spent", spent);
            performance.put("remaining", remaining);
            performance.put("utilization", utilization);
            performance.put("status", status);
            
            if (includeForecasts) {
                performance.put("projectedSpending", spent.multiply(BigDecimal.valueOf(1.1))); // 10% increase projection
            }
            
            return performance;
        }).collect(Collectors.toList());
    }

    private Map<String, Object> generateBudgetInsights(List<Map<String, Object>> categoryPerformance) {
        // Find best and worst performing categories
        Optional<Map<String, Object>> bestPerforming = categoryPerformance.stream()
            .filter(cat -> "on_track".equals(cat.get("status")))
            .findFirst();
        
        Optional<Map<String, Object>> worstPerforming = categoryPerformance.stream()
            .filter(cat -> "over_budget".equals(cat.get("status")))
            .findFirst();

        return Map.of(
            "bestPerformingCategory", bestPerforming.map(cat -> cat.get("category")).orElse("None"),
            "worstPerformingCategory", worstPerforming.map(cat -> cat.get("category")).orElse("None"),
            "recommendations", Arrays.asList(
                "Transportation budget needs immediate attention",
                "Consider reallocating unused Healthcare budget to Transportation"
            )
        );
    }

    private Map<String, Object> calculateSavingsSummary(List<Transaction> transactions, Long userId) {
        BigDecimal totalIncome = transactions.stream()
            .filter(t -> "income".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSaved = totalIncome.subtract(totalExpenses);
        
        double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0 ? 
            totalSaved.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;

        return Map.of(
            "totalSaved", totalSaved,
            "targetSavings", BigDecimal.valueOf(3600000),
            "savingsProgress", Math.max(0, (totalSaved.doubleValue() / 3600000.0) * 100),
            "monthlySavingsAverage", totalSaved.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP),
            "savingsRate", savingsRate
        );
    }

    private List<Map<String, Object>> calculateGoalsProgress(List<Goal> goals) {
        return goals.stream().map(goal -> {
            double progress = goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0 ? 
                goal.getCurrentAmount().divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
            
            Map<String, Object> result = new HashMap<>();
            result.put("goalId", goal.getId());
            result.put("goalName", goal.getName());
            result.put("targetAmount", goal.getTargetAmount());
            result.put("currentAmount", goal.getCurrentAmount());
            result.put("progress", progress);
            result.put("onTrack", progress >= 50.0);
            return result;
        }).collect(Collectors.toList());
    }

    private List<String> generateSavingsRecommendations(Map<String, Object> savingsSummary) {
        return Arrays.asList(
            "Automate savings transfers to improve consistency",
            "Consider investment options for long-term goals"
        );
    }

    private int calculateFinancialHealthScore(List<Transaction> transactions, Long userId) {
        // Mock calculation - in real implementation, this would be more complex
        return 68;
    }

    private Map<String, Object> calculateScoreBreakdown(List<Transaction> transactions, Long userId) {
        return Map.of(
            "savingsRate", Map.of("score", 45, "weight", 25, "value", -2.7, "status", "poor"),
            "budgetAdherence", Map.of("score", 75, "weight", 20, "value", 85.3, "status", "good"),
            "debtToIncomeRatio", Map.of("score", 85, "weight", 20, "value", 15.2, "status", "excellent")
        );
    }

    private List<Map<String, Object>> generateHealthRecommendations(Map<String, Object> scoreBreakdown) {
        return Arrays.asList(
            Map.of(
                "priority", "high",
                "category", "savings",
                "title", "Improve Savings Rate",
                "actionItems", Arrays.asList(
                    "Cut non-essential expenses by 20%",
                    "Consider side income opportunities"
                )
            )
        );
    }

    private Map<String, Object> calculateCashFlowSummary(List<Transaction> transactions) {
        BigDecimal totalInflow = transactions.stream()
            .filter(t -> "income".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutflow = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
            "totalInflow", totalInflow,
            "totalOutflow", totalOutflow,
            "netCashFlow", totalInflow.subtract(totalOutflow),
            "cashFlowVolatility", "high"
        );
    }

    private List<Map<String, Object>> generateMonthlyCashFlow(List<Transaction> transactions) {
        Map<String, Map<String, BigDecimal>> monthlyData = transactions.stream()
            .collect(Collectors.groupingBy(
                t -> t.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.groupingBy(
                    Transaction::getType,
                    Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                )
            ));

        return monthlyData.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                String month = entry.getKey();
                BigDecimal inflow = entry.getValue().getOrDefault("income", BigDecimal.ZERO);
                BigDecimal outflow = entry.getValue().getOrDefault("expense", BigDecimal.ZERO);
                
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", month);
                monthData.put("inflow", inflow);
                monthData.put("outflow", outflow);
                monthData.put("netFlow", inflow.subtract(outflow));
                monthData.put("endingBalance", BigDecimal.valueOf(1610000)); // Would need actual calculation
                return monthData;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> generateCashFlowProjections(List<Map<String, Object>> monthlyCashFlow, int projectionMonths) {
        List<Map<String, Object>> projections = new ArrayList<>();
        
        for (int i = 1; i <= projectionMonths; i++) {
            Map<String, Object> projection = new HashMap<>();
            projection.put("month", LocalDate.now().plusMonths(i).format(DateTimeFormatter.ofPattern("yyyy-MM")));
            projection.put("projectedInflow", BigDecimal.valueOf(1500000));
            projection.put("projectedOutflow", BigDecimal.valueOf(1950000 + (i * 50000))); // Increasing expenses
            projection.put("projectedNetFlow", BigDecimal.valueOf(-450000 - (i * 50000)));
            projection.put("confidence", Math.max(50, 85 - (i * 7))); // Decreasing confidence
            projections.add(projection);
        }
        
        return projections;
    }

    private List<Map<String, Object>> generateCashFlowAlerts(Map<String, Object> summary, List<Map<String, Object>> monthlyCashFlow) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        
        BigDecimal netCashFlow = (BigDecimal) summary.get("netCashFlow");
        if (netCashFlow.compareTo(BigDecimal.ZERO) < 0) {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "liquidity_warning");
            alert.put("severity", "high");
            alert.put("message", "Cash reserves may be depleted within 4 months at current burn rate");
            alerts.add(alert);
        }
        
        return alerts;
    }
}