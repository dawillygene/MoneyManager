package com.example.moneymanager.services;

import com.example.moneymanager.models.Budget;
import com.example.moneymanager.models.Transaction;
import com.example.moneymanager.repositories.BudgetRepository;
import com.example.moneymanager.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BudgetService {
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;

    // Category definitions with icons and colors
    private static final Map<String, Map<String, String>> CATEGORY_DEFINITIONS;
    
    static {
        Map<String, Map<String, String>> categories = new HashMap<>();
        categories.put("Housing", Map.of("icon", "fas fa-home", "color", "#8B5CF6", "description", "Rent, utilities, maintenance"));
        categories.put("Food & Dining", Map.of("icon", "fas fa-utensils", "color", "#3B82F6", "description", "Groceries, restaurants, takeout"));
        categories.put("Transportation", Map.of("icon", "fas fa-car", "color", "#F59E0B", "description", "Fuel, public transit, maintenance"));
        categories.put("Entertainment", Map.of("icon", "fas fa-film", "color", "#3B82F6", "description", "Movies, events, subscriptions"));
        categories.put("Shopping", Map.of("icon", "fas fa-shopping-bag", "color", "#10B981", "description", "Clothes, accessories, gifts"));
        categories.put("Healthcare", Map.of("icon", "fas fa-heartbeat", "color", "#EF4444", "description", "Medicine, doctor visits, insurance"));
        categories.put("Education", Map.of("icon", "fas fa-graduation-cap", "color", "#6366F1", "description", "Courses, books, training"));
        categories.put("Travel", Map.of("icon", "fas fa-plane", "color", "#8B5CF6", "description", "Trips, accommodation, flights"));
        categories.put("Insurance", Map.of("icon", "fas fa-shield-alt", "color", "#6B7280", "description", "Life, health, property insurance"));
        categories.put("Savings", Map.of("icon", "fas fa-piggy-bank", "color", "#10B981", "description", "Emergency fund, investments"));
        categories.put("Debt Payment", Map.of("icon", "fas fa-credit-card", "color", "#EF4444", "description", "Loan payments, credit cards"));
        categories.put("Personal Care", Map.of("icon", "fas fa-user", "color", "#F59E0B", "description", "Haircuts, gym, personal items"));
        categories.put("Gifts & Donations", Map.of("icon", "fas fa-gift", "color", "#EC4899", "description", "Presents, charity, donations"));
        categories.put("Business", Map.of("icon", "fas fa-briefcase", "color", "#6B7280", "description", "Office supplies, networking"));
        categories.put("Other", Map.of("icon", "fas fa-ellipsis-h", "color", "#9CA3AF", "description", "Miscellaneous expenses"));
        CATEGORY_DEFINITIONS = Collections.unmodifiableMap(categories);
    }

    // Basic CRUD operations
    public List<Budget> getAllBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserIdAndIsArchivedFalse(userId);
    }

    public Optional<Budget> getBudgetByIdAndUserId(Long id, Long userId) {
        return budgetRepository.findByIdAndUserId(id, userId);
    }

    public Budget createBudget(Budget budget) {
        // Set category icon and color if not provided
        if (budget.getCategoryIcon() == null || budget.getCategoryColor() == null) {
            setCategoryDefaults(budget);
        }
        
        // Calculate initial spending
        updateBudgetSpending(budget);
        
        Budget savedBudget = budgetRepository.save(budget);
        checkAndTriggerAlerts(savedBudget);
        return savedBudget;
    }

    public Budget updateBudget(Long id, Budget updatedBudget, Long userId) {
        Optional<Budget> existingBudgetOpt = getBudgetByIdAndUserId(id, userId);
        if (existingBudgetOpt.isEmpty()) {
            throw new RuntimeException("Budget not found or access denied");
        }
        
        Budget existingBudget = existingBudgetOpt.get();
        
        // Update fields
        existingBudget.setName(updatedBudget.getName());
        existingBudget.setAmount(updatedBudget.getAmount());
        existingBudget.setCategory(updatedBudget.getCategory());
        existingBudget.setStartDate(updatedBudget.getStartDate());
        existingBudget.setEndDate(updatedBudget.getEndDate());
        existingBudget.setDescription(updatedBudget.getDescription());
        existingBudget.setRecurring(updatedBudget.getRecurring());
        existingBudget.setAlertLevel(updatedBudget.getAlertLevel());
        existingBudget.setCategoryIcon(updatedBudget.getCategoryIcon());
        existingBudget.setCategoryColor(updatedBudget.getCategoryColor());
        existingBudget.setTags(updatedBudget.getTags());
        
        // Set category defaults if needed
        if (existingBudget.getCategoryIcon() == null || existingBudget.getCategoryColor() == null) {
            setCategoryDefaults(existingBudget);
        }
        
        // Recalculate spending if date range changed
        updateBudgetSpending(existingBudget);
        
        Budget savedBudget = budgetRepository.save(existingBudget);
        checkAndTriggerAlerts(savedBudget);
        return savedBudget;
    }

    public void deleteBudget(Long id, Long userId) {
        Optional<Budget> budget = getBudgetByIdAndUserId(id, userId);
        if (budget.isEmpty()) {
            throw new RuntimeException("Budget not found or access denied");
        }
        budgetRepository.deleteById(id);
    }

    // Enhanced query methods with filtering and pagination
    public Map<String, Object> getBudgetsWithPagination(Long userId, int page, int limit, String sortBy, 
                                                       String sortOrder, String category, String status, 
                                                       String recurring, String search) {
        // Validate and set defaults
        page = Math.max(1, page);
        limit = Math.min(Math.max(1, limit), 100);
        sortBy = sortBy != null ? sortBy : "createdAt";
        sortOrder = "desc".equalsIgnoreCase(sortOrder) ? "desc" : "asc";
        
        // Create sort object
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, limit, sort);
        
        // Get budgets with filters
        Page<Budget> budgetPage;
        if (status != null && !status.isEmpty()) {
            budgetPage = getBudgetsByStatus(userId, status, pageable);
        } else {
            budgetPage = budgetRepository.findBudgetsWithFilters(userId, category, recurring, search, pageable);
        }
        
        // Enhance budgets with spending data and transactions
        List<Map<String, Object>> enhancedBudgets = budgetPage.getContent().stream()
            .map(this::enhanceBudgetWithDetails)
            .collect(Collectors.toList());
        
        // Create pagination info
        Map<String, Object> pagination = new HashMap<>();
        pagination.put("currentPage", page);
        pagination.put("totalPages", budgetPage.getTotalPages());
        pagination.put("totalItems", budgetPage.getTotalElements());
        pagination.put("itemsPerPage", limit);
        pagination.put("hasNextPage", budgetPage.hasNext());
        pagination.put("hasPrevPage", budgetPage.hasPrevious());
        
        // Create summary
        Map<String, Object> summary = getBudgetSummary(userId);
        
        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("budgets", enhancedBudgets);
        response.put("pagination", pagination);
        response.put("summary", summary);
        
        return response;
    }

    private Page<Budget> getBudgetsByStatus(Long userId, String status, Pageable pageable) {
        List<Budget> budgets;
        switch (status.toLowerCase()) {
            case "active":
                budgets = budgetRepository.findActiveBudgetsByUserId(userId);
                break;
            case "upcoming":
                budgets = budgetRepository.findUpcomingBudgetsByUserId(userId);
                break;
            case "expired":
                budgets = budgetRepository.findExpiredBudgetsByUserId(userId);
                break;
            default:
                budgets = budgetRepository.findByUserIdAndIsArchivedFalse(userId);
                break;
        }
        
        // Convert to Page manually (simplified pagination)
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), budgets.size());
        List<Budget> pageContent = start < budgets.size() ? budgets.subList(start, end) : new ArrayList<>();
        
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, budgets.size());
    }

    public Map<String, Object> getBudgetWithDetails(Long id, Long userId, boolean includeTransactions, int transactionLimit) {
        Optional<Budget> budgetOpt = getBudgetByIdAndUserId(id, userId);
        if (budgetOpt.isEmpty()) {
            throw new RuntimeException("Budget not found or access denied");
        }
        
        Budget budget = budgetOpt.get();
        updateBudgetSpending(budget);
        
        Map<String, Object> response = enhanceBudgetWithDetails(budget);
        
        if (includeTransactions) {
            List<Transaction> transactions = transactionRepository
                .findByUserIdAndCategoryAndDateBetween(userId, budget.getCategory(), 
                    budget.getStartDate(), budget.getEndDate())
                .stream()
                .limit(transactionLimit)
                .collect(Collectors.toList());
            
            response.put("transactions", transactions);
            
            // Add analytics
            Map<String, Object> analytics = calculateBudgetAnalytics(budget, transactions);
            response.put("analytics", analytics);
        }
        
        return response;
    }

    // Budget summary and analytics
    public Map<String, Object> getBudgetSummary(Long userId) {
        List<Budget> activeBudgets = budgetRepository.findActiveBudgetsByUserId(userId);
        
        BigDecimal totalBudgetAmount = activeBudgets.stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalSpent = activeBudgets.stream()
            .map(Budget::getSpent)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalRemaining = totalBudgetAmount.subtract(totalSpent);
        
        double progress = totalBudgetAmount.compareTo(BigDecimal.ZERO) > 0 
            ? totalSpent.divide(totalBudgetAmount, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue()
            : 0.0;
        
        long totalBudgets = budgetRepository.countActiveBudgetsByUserId(userId);
        long activeBudgetsCount = budgetRepository.countCurrentActiveBudgetsByUserId(userId);
        long overBudgetCount = budgetRepository.countOverBudgetsByUserId(userId);
        long alertTriggeredCount = budgetRepository.countBudgetsWithAlertsByUserId(userId);
        
        Map<String, Object> totals = new HashMap<>();
        totals.put("budgetAmount", totalBudgetAmount);
        totals.put("spent", totalSpent);
        totals.put("remaining", totalRemaining);
        totals.put("progress", progress);
        
        Map<String, Object> counts = new HashMap<>();
        counts.put("totalBudgets", totalBudgets);
        counts.put("activeBudgets", activeBudgetsCount);
        counts.put("overBudgetCount", overBudgetCount);
        counts.put("alertTriggeredCount", alertTriggeredCount);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalBudgets", totalBudgets);
        summary.put("activeBudgets", activeBudgetsCount);
        summary.put("totalBudgetAmount", totalBudgetAmount);
        summary.put("totalSpent", totalSpent);
        summary.put("totalRemaining", totalRemaining);
        summary.put("overBudgetCount", overBudgetCount);
        summary.put("alertTriggeredCount", alertTriggeredCount);
        
        return summary;
    }

    public List<Map<String, Object>> getCategoryBreakdown(Long userId) {
        List<Object[]> categoryData = budgetRepository.findCategoryBreakdownByUserId(userId);
        
        return categoryData.stream().map(data -> {
            Map<String, Object> category = new HashMap<>();
            String categoryName = (String) data[0];
            BigDecimal budgeted = (BigDecimal) data[1];
            BigDecimal spent = (BigDecimal) data[2];
            
            double progress = budgeted.compareTo(BigDecimal.ZERO) > 0 
                ? spent.divide(budgeted, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue()
                : 0.0;
            
            String status = progress > 100 ? "over" : progress > 80 ? "warning" : "good";
            
            category.put("category", categoryName);
            category.put("budgeted", budgeted);
            category.put("spent", spent);
            category.put("progress", progress);
            category.put("status", status);
            
            return category;
        }).collect(Collectors.toList());
    }

    // Alert management
    public List<Map<String, Object>> getBudgetAlerts(Long userId, String severity, String category) {
        List<Budget> budgetsWithAlerts = budgetRepository.findBudgetsWithAlerts(userId);
        
        return budgetsWithAlerts.stream()
            .filter(budget -> severity == null || getSeverity(budget).equals(severity))
            .filter(budget -> category == null || budget.getCategory().equals(category))
            .map(this::createAlertResponse)
            .collect(Collectors.toList());
    }

    private String getSeverity(Budget budget) {
        if (budget.getIsOverBudget()) {
            return "critical";
        } else if (budget.getProgress() > budget.getAlertLevel()) {
            return "warning";
        }
        return "info";
    }

    private Map<String, Object> createAlertResponse(Budget budget) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("budgetId", budget.getId());
        alert.put("budgetName", budget.getName());
        alert.put("category", budget.getCategory());
        alert.put("severity", getSeverity(budget));
        alert.put("currentSpent", budget.getSpent());
        alert.put("budgetAmount", budget.getAmount());
        alert.put("alertLevel", budget.getAlertLevel());
        alert.put("daysRemaining", budget.getDaysRemaining());
        alert.put("createdAt", budget.getUpdatedAt());
        
        if (budget.getIsOverBudget()) {
            alert.put("message", String.format("You've exceeded your %s budget by Tsh %,.2f", 
                budget.getCategory().toLowerCase(), budget.getSpent().subtract(budget.getAmount()).doubleValue()));
            alert.put("projectedOverage", budget.getSpent().subtract(budget.getAmount()));
        } else {
            alert.put("message", String.format("You've spent %.1f%% of your %s budget", 
                budget.getProgress(), budget.getCategory().toLowerCase()));
            alert.put("projectedOverage", BigDecimal.ZERO);
        }
        
        return alert;
    }

    // Budget duplication
    public Budget duplicateBudget(Long sourceBudgetId, Long userId, Map<String, Object> modifications) {
        Optional<Budget> sourceBudgetOpt = getBudgetByIdAndUserId(sourceBudgetId, userId);
        if (sourceBudgetOpt.isEmpty()) {
            throw new RuntimeException("Source budget not found or access denied");
        }
        
        Budget sourceBudget = sourceBudgetOpt.get();
        Budget newBudget = new Budget();
        
        // Copy properties from source
        newBudget.setName((String) modifications.getOrDefault("name", sourceBudget.getName()));
        newBudget.setDescription(sourceBudget.getDescription());
        newBudget.setAmount(modifications.containsKey("amount") 
            ? new BigDecimal(modifications.get("amount").toString()) 
            : sourceBudget.getAmount());
        newBudget.setCategory(sourceBudget.getCategory());
        newBudget.setCategoryIcon(sourceBudget.getCategoryIcon());
        newBudget.setCategoryColor(sourceBudget.getCategoryColor());
        newBudget.setRecurring(sourceBudget.getRecurring());
        newBudget.setAlertLevel(sourceBudget.getAlertLevel());
        newBudget.setTags(sourceBudget.getTags());
        newBudget.setUserId(userId);
        newBudget.setSourceBudgetId(sourceBudgetId);
        
        // Set new dates
        if (modifications.containsKey("startDate")) {
            newBudget.setStartDate(LocalDate.parse((String) modifications.get("startDate")));
        }
        if (modifications.containsKey("endDate")) {
            newBudget.setEndDate(LocalDate.parse((String) modifications.get("endDate")));
        }
        
        return createBudget(newBudget);
    }

    // Archive and restore
    public Budget archiveBudget(Long id, Long userId) {
        Optional<Budget> budgetOpt = getBudgetByIdAndUserId(id, userId);
        if (budgetOpt.isEmpty()) {
            throw new RuntimeException("Budget not found or access denied");
        }
        
        Budget budget = budgetOpt.get();
        budget.setIsArchived(true);
        budget.setArchivedAt(LocalDateTime.now());
        
        return budgetRepository.save(budget);
    }

    public Budget restoreBudget(Long id, Long userId) {
        Optional<Budget> budgetOpt = getBudgetByIdAndUserId(id, userId);
        if (budgetOpt.isEmpty()) {
            throw new RuntimeException("Budget not found or access denied");
        }
        
        Budget budget = budgetOpt.get();
        budget.setIsArchived(false);
        budget.setArchivedAt(null);
        budget.setRestoredAt(LocalDateTime.now());
        
        return budgetRepository.save(budget);
    }

    // Category management
    public List<Map<String, Object>> getAvailableCategories() {
        return CATEGORY_DEFINITIONS.entrySet().stream().map(entry -> {
            Map<String, Object> category = new HashMap<>();
            category.put("name", entry.getKey());
            category.put("icon", entry.getValue().get("icon"));
            category.put("color", entry.getValue().get("color"));
            category.put("description", entry.getValue().get("description"));
            return category;
        }).collect(Collectors.toList());
    }

    // Recurring budget generation
    public Map<String, Object> generateRecurringBudgets(Long userId, int months, boolean dryRun) {
        List<Budget> recurringBudgets = budgetRepository.findRecurringBudgetsByUserId(userId);
        List<Map<String, Object>> preview = new ArrayList<>();
        List<Budget> created = new ArrayList<>();
        
        for (Budget template : recurringBudgets) {
            List<Map<String, Object>> suggestedBudgets = new ArrayList<>();
            
            for (int i = 1; i <= months; i++) {
                LocalDate newStartDate = template.getEndDate().plusDays(1).plusMonths(i - 1);
                LocalDate newEndDate = newStartDate.withDayOfMonth(newStartDate.lengthOfMonth());
                
                Map<String, Object> suggested = new HashMap<>();
                suggested.put("name", template.getName() + " - " + newStartDate.getMonth() + " " + newStartDate.getYear());
                suggested.put("amount", template.getAmount());
                suggested.put("startDate", newStartDate);
                suggested.put("endDate", newEndDate);
                suggested.put("category", template.getCategory());
                
                suggestedBudgets.add(suggested);
                
                if (!dryRun) {
                    Budget newBudget = new Budget();
                    newBudget.setName((String) suggested.get("name"));
                    newBudget.setAmount(template.getAmount());
                    newBudget.setCategory(template.getCategory());
                    newBudget.setStartDate(newStartDate);
                    newBudget.setEndDate(newEndDate);
                    newBudget.setDescription(template.getDescription());
                    newBudget.setRecurring(template.getRecurring());
                    newBudget.setAlertLevel(template.getAlertLevel());
                    newBudget.setCategoryIcon(template.getCategoryIcon());
                    newBudget.setCategoryColor(template.getCategoryColor());
                    newBudget.setUserId(userId);
                    newBudget.setSourceBudgetId(template.getId());
                    
                    created.add(createBudget(newBudget));
                }
            }
            
            Map<String, Object> templatePreview = new HashMap<>();
            templatePreview.put("templateId", template.getId());
            templatePreview.put("templateName", template.getName());
            templatePreview.put("suggestedBudgets", suggestedBudgets);
            preview.add(templatePreview);
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("templatesFound", recurringBudgets.size());
        summary.put("budgetsToCreate", recurringBudgets.size() * months);
        summary.put("estimatedTotalAmount", recurringBudgets.stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .multiply(new BigDecimal(months)));
        
        Map<String, Object> response = new HashMap<>();
        response.put("preview", preview);
        response.put("created", created);
        response.put("summary", summary);
        
        return response;
    }

    // Batch operations
    public Map<String, Object> createBudgetsBatch(Long userId, List<Map<String, Object>> budgetRequests) {
        List<Map<String, Object>> created = new ArrayList<>();
        List<Map<String, Object>> failed = new ArrayList<>();
        
        for (Map<String, Object> budgetData : budgetRequests) {
            try {
                Budget budget = createBudgetFromMap(budgetData, userId);
                Budget savedBudget = createBudget(budget);
                
                Map<String, Object> createdInfo = new HashMap<>();
                createdInfo.put("id", savedBudget.getId());
                createdInfo.put("name", savedBudget.getName());
                createdInfo.put("amount", savedBudget.getAmount());
                createdInfo.put("category", savedBudget.getCategory());
                createdInfo.put("status", "created");
                created.add(createdInfo);
                
            } catch (Exception e) {
                Map<String, Object> failedInfo = new HashMap<>();
                failedInfo.put("name", budgetData.get("name"));
                failedInfo.put("error", e.getMessage());
                failed.add(failedInfo);
            }
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRequested", budgetRequests.size());
        summary.put("successfullyCreated", created.size());
        summary.put("failed", failed.size());
        
        Map<String, Object> response = new HashMap<>();
        response.put("created", created);
        response.put("failed", failed);
        response.put("summary", summary);
        
        return response;
    }

    // Helper methods
    private Budget createBudgetFromMap(Map<String, Object> data, Long userId) {
        Budget budget = new Budget();
        budget.setName((String) data.get("name"));
        budget.setDescription((String) data.get("description"));
        budget.setAmount(new BigDecimal(data.get("amount").toString()));
        budget.setCategory((String) data.get("category"));
        budget.setStartDate(LocalDate.parse((String) data.get("startDate")));
        budget.setEndDate(LocalDate.parse((String) data.get("endDate")));
        budget.setRecurring((String) data.get("recurring"));
        budget.setUserId(userId);
        
        if (data.containsKey("alertLevel")) {
            budget.setAlertLevel(Integer.parseInt(data.get("alertLevel").toString()));
        }
        
        setCategoryDefaults(budget);
        return budget;
    }

    private void setCategoryDefaults(Budget budget) {
        Map<String, String> categoryInfo = CATEGORY_DEFINITIONS.get(budget.getCategory());
        if (categoryInfo != null) {
            if (budget.getCategoryIcon() == null) {
                budget.setCategoryIcon(categoryInfo.get("icon"));
            }
            if (budget.getCategoryColor() == null) {
                budget.setCategoryColor(categoryInfo.get("color"));
            }
        }
    }

    private void updateBudgetSpending(Budget budget) {
        List<Transaction> transactions = transactionRepository
            .findByUserIdAndCategoryAndDateBetween(budget.getUserId(), budget.getCategory(), 
                budget.getStartDate(), budget.getEndDate());
        
        BigDecimal totalSpent = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        budget.setSpent(totalSpent);
    }

    private void checkAndTriggerAlerts(Budget budget) {
        double progress = budget.getProgress();
        boolean shouldTriggerAlert = progress >= budget.getAlertLevel() || budget.getIsOverBudget();
        
        if (shouldTriggerAlert && !budget.getAlertTriggered()) {
            budget.setAlertTriggered(true);
            budgetRepository.save(budget);
        } else if (!shouldTriggerAlert && budget.getAlertTriggered()) {
            budget.setAlertTriggered(false);
            budgetRepository.save(budget);
        }
    }

    // Make this method public so it can be called from the controller
    public Map<String, Object> enhanceBudgetWithDetails(Budget budget) {
        Map<String, Object> enhanced = new HashMap<>();
        enhanced.put("id", budget.getId());
        enhanced.put("name", budget.getName());
        enhanced.put("description", budget.getDescription());
        enhanced.put("amount", budget.getAmount());
        enhanced.put("spent", budget.getSpent());
        enhanced.put("remaining", budget.getRemaining());
        enhanced.put("category", budget.getCategory());
        enhanced.put("categoryIcon", budget.getCategoryIcon());
        enhanced.put("categoryColor", budget.getCategoryColor());
        enhanced.put("startDate", budget.getStartDate());
        enhanced.put("endDate", budget.getEndDate());
        enhanced.put("recurring", budget.getRecurring());
        enhanced.put("alertLevel", budget.getAlertLevel());
        enhanced.put("alertTriggered", budget.getAlertTriggered());
        enhanced.put("status", budget.getStatus());
        enhanced.put("progress", budget.getProgress());
        enhanced.put("daysRemaining", budget.getDaysRemaining());
        enhanced.put("averageDailySpend", budget.getAverageDailySpend());
        enhanced.put("projectedTotal", budget.getProjectedTotal());
        enhanced.put("isOverBudget", budget.getIsOverBudget());
        enhanced.put("tags", budget.getTagsList());
        enhanced.put("createdAt", budget.getCreatedAt());
        enhanced.put("updatedAt", budget.getUpdatedAt());
        
        return enhanced;
    }

    private Map<String, Object> calculateBudgetAnalytics(Budget budget, List<Transaction> transactions) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Weekly spending breakdown
        Map<String, BigDecimal> weeklySpending = new HashMap<>();
        for (Transaction transaction : transactions) {
            String weekKey = transaction.getDate().getYear() + "-W" + 
                transaction.getDate().get(java.time.temporal.WeekFields.ISO.weekOfYear());
            weeklySpending.merge(weekKey, transaction.getAmount(), BigDecimal::add);
        }
        
        List<Map<String, Object>> weeklyData = weeklySpending.entrySet().stream()
            .map(entry -> {
                Map<String, Object> week = new HashMap<>();
                week.put("week", entry.getKey());
                week.put("amount", entry.getValue());
                return week;
            })
            .sorted((a, b) -> ((String) a.get("week")).compareTo((String) b.get("week")))
            .collect(Collectors.toList());
        
        analytics.put("weeklySpending", weeklyData);
        analytics.put("dailyAverage", budget.getAverageDailySpend());
        analytics.put("spendingTrend", calculateSpendingTrend(transactions));
        analytics.put("daysToDepletion", calculateDaysToDepletion(budget));
        analytics.put("recommendedDailyLimit", calculateRecommendedDailyLimit(budget));
        
        return analytics;
    }

    private String calculateSpendingTrend(List<Transaction> transactions) {
        if (transactions.size() < 2) return "stable";
        
        // Simple trend calculation based on recent vs earlier transactions
        int midPoint = transactions.size() / 2;
        BigDecimal earlierSum = transactions.subList(0, midPoint).stream()
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal recentSum = transactions.subList(midPoint, transactions.size()).stream()
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (recentSum.compareTo(earlierSum) > 0) return "increasing";
        if (recentSum.compareTo(earlierSum) < 0) return "decreasing";
        return "stable";
    }

    private double calculateDaysToDepletion(Budget budget) {
        double averageDailySpend = budget.getAverageDailySpend();
        if (averageDailySpend <= 0) return Double.MAX_VALUE;
        
        return budget.getRemaining().doubleValue() / averageDailySpend;
    }

    private double calculateRecommendedDailyLimit(Budget budget) {
        long daysRemaining = budget.getDaysRemaining();
        if (daysRemaining <= 0) return 0.0;
        
        return budget.getRemaining().doubleValue() / daysRemaining;
    }

    // Public method to update budget spending when transactions change
    public void updateBudgetSpendingForCategory(Long userId, String category) {
        List<Budget> budgets = budgetRepository.findByUserIdAndCategory(userId, category);
        for (Budget budget : budgets) {
            updateBudgetSpending(budget);
            checkAndTriggerAlerts(budget);
            budgetRepository.save(budget);
        }
    }
}