package com.example.moneymanager.services;

import com.example.moneymanager.models.Goal;
import com.example.moneymanager.models.GoalContribution;
import com.example.moneymanager.repositories.GoalRepository;
import com.example.moneymanager.repositories.GoalContributionRepository;
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
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.*;

@Service
@Transactional
public class GoalService {
    @Autowired
    private GoalRepository goalRepository;
    
    @Autowired
    private GoalContributionRepository goalContributionRepository;

    // Basic CRUD operations
    public List<Goal> getAllGoalsByUserId(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    public Optional<Goal> getGoalByIdAndUserId(Long id, Long userId) {
        return goalRepository.findByIdAndUserId(id, userId);
    }

    public Goal createGoal(Goal goal) {
        // Validate unique name per user
        Optional<Goal> existingGoal = goalRepository.findByNameAndUserId(goal.getName(), goal.getUserId());
        if (existingGoal.isPresent()) {
            throw new RuntimeException("Goal name already exists");
        }
        
        // Set defaults
        if (goal.getCurrentAmount() == null) {
            goal.setCurrentAmount(BigDecimal.ZERO);
        }
        if (goal.getIcon() == null || goal.getIcon().trim().isEmpty()) {
            goal.setIcon("fa-bullseye");
        }
        if (goal.getPriority() == null || goal.getPriority().trim().isEmpty()) {
            goal.setPriority("medium");
        }
        if (goal.getCategory() == null || goal.getCategory().trim().isEmpty()) {
            goal.setCategory("other");
        }
        if (goal.getStatus() == null || goal.getStatus().trim().isEmpty()) {
            goal.setStatus("active");
        }
        
        // Validate target date is in the future
        if (goal.getTargetDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Target date must be in the future");
        }
        
        // Validate amounts
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Target amount must be positive");
        }
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) > 0) {
            throw new RuntimeException("Current amount cannot exceed target amount");
        }
        
        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, Goal updatedGoal, Long userId) {
        Optional<Goal> existingGoalOpt = goalRepository.findByIdAndUserId(id, userId);
        if (existingGoalOpt.isEmpty()) {
            throw new RuntimeException("Goal not found");
        }
        
        Goal existingGoal = existingGoalOpt.get();
        
        // Check if completed goal is being modified
        if ("completed".equals(existingGoal.getStatus()) && !"completed".equals(updatedGoal.getStatus())) {
            throw new RuntimeException("Cannot modify completed goal");
        }
        
        // Validate unique name (excluding current goal)
        if (!existingGoal.getName().equals(updatedGoal.getName())) {
            Optional<Goal> duplicateGoal = goalRepository.findByNameAndUserIdAndIdNot(
                updatedGoal.getName(), userId, id);
            if (duplicateGoal.isPresent()) {
                throw new RuntimeException("Goal name already exists");
            }
        }
        
        // Update fields
        existingGoal.setName(updatedGoal.getName());
        existingGoal.setDescription(updatedGoal.getDescription());
        existingGoal.setTargetAmount(updatedGoal.getTargetAmount());
        existingGoal.setTargetDate(updatedGoal.getTargetDate());
        existingGoal.setIcon(updatedGoal.getIcon());
        existingGoal.setPriority(updatedGoal.getPriority());
        existingGoal.setCategory(updatedGoal.getCategory());
        
        if (updatedGoal.getTags() != null) {
            existingGoal.setTags(updatedGoal.getTags());
        }
        
        return goalRepository.save(existingGoal);
    }

    public void deleteGoal(Long id, Long userId) {
        Optional<Goal> goalOpt = goalRepository.findByIdAndUserId(id, userId);
        if (goalOpt.isEmpty()) {
            throw new RuntimeException("Goal not found");
        }
        
        Goal goal = goalOpt.get();
        goalRepository.delete(goal);
    }

    // Filtered and paginated goals
    public Page<Goal> getFilteredGoals(Long userId, String status, String category, String priority, 
                                      String search, String sortBy, String sortOrder, int page, int limit) {
        // Validate and set defaults
        if (limit > 100) limit = 100;
        if (limit < 1) limit = 10;
        if (page < 1) page = 1;
        
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortField = getSortField(sortBy);
        
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(direction, sortField));
        
        return goalRepository.findFilteredGoals(userId, status, category, priority, search, pageable);
    }
    
    private String getSortField(String sortBy) {
        return switch (sortBy != null ? sortBy.toLowerCase() : "createdat") {
            case "name" -> "name";
            case "targetamount" -> "targetAmount";
            case "targetdate" -> "targetDate";
            case "progress" -> "currentAmount"; // Approximation
            case "createdat" -> "createdAt";
            default -> "createdAt";
        };
    }

    // Goal contributions
    @Transactional
    public GoalContribution addContribution(Long goalId, BigDecimal amount, String source, 
                                          String notes, LocalDate date, Long userId) {
        Optional<Goal> goalOpt = goalRepository.findByIdAndUserId(goalId, userId);
        if (goalOpt.isEmpty()) {
            throw new RuntimeException("Goal not found");
        }
        
        Goal goal = goalOpt.get();
        
        // Validate goal is not completed
        if ("completed".equals(goal.getStatus())) {
            throw new RuntimeException("Cannot add contributions to completed goal");
        }
        
        // Validate contribution doesn't exceed target
        BigDecimal newTotal = goal.getCurrentAmount().add(amount);
        if (newTotal.compareTo(goal.getTargetAmount()) > 0) {
            BigDecimal maxAllowed = goal.getTargetAmount().subtract(goal.getCurrentAmount());
            throw new RuntimeException("Contribution exceeds target amount. Maximum allowed: " + maxAllowed);
        }
        
        // Validate date is not in future
        if (date.isAfter(LocalDate.now())) {
            throw new RuntimeException("Contribution date cannot be in the future");
        }
        
        // Create contribution
        GoalContribution contribution = new GoalContribution();
        contribution.setGoal(goal);
        contribution.setAmount(amount);
        contribution.setSource(source);
        contribution.setNotes(notes);
        contribution.setDate(date);
        
        contribution = goalContributionRepository.save(contribution);
        
        // Update goal current amount
        goal.setCurrentAmount(newTotal);
        
        // Check if goal is now completed
        if (newTotal.compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("completed");
            goal.setCompletedAt(LocalDateTime.now());
        }
        
        goalRepository.save(goal);
        
        return contribution;
    }
    
    public Page<GoalContribution> getGoalContributions(Long goalId, Long userId, String source,
                                                      LocalDate startDate, LocalDate endDate,
                                                      BigDecimal minAmount, BigDecimal maxAmount,
                                                      String sortBy, String sortOrder, int page, int limit) {
        // Verify goal ownership
        Optional<Goal> goalOpt = goalRepository.findByIdAndUserId(goalId, userId);
        if (goalOpt.isEmpty()) {
            throw new RuntimeException("Goal not found");
        }
        
        if (limit > 100) limit = 100;
        if (limit < 1) limit = 20;
        if (page < 1) page = 1;
        
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortField = getContributionSortField(sortBy);
        
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(direction, sortField));
        
        return goalContributionRepository.findFilteredContributions(
            goalId, source, startDate, endDate, minAmount, maxAmount, pageable);
    }
    
    private String getContributionSortField(String sortBy) {
        return switch (sortBy != null ? sortBy.toLowerCase() : "date") {
            case "amount" -> "amount";
            case "date" -> "date";
            case "createdat" -> "createdAt";
            default -> "date";
        };
    }
    
    public GoalContribution updateContribution(Long goalId, Long contributionId, String source, 
                                             String notes, Long userId) {
        // Verify goal ownership
        Optional<Goal> goalOpt = goalRepository.findByIdAndUserId(goalId, userId);
        if (goalOpt.isEmpty()) {
            throw new RuntimeException("Goal not found");
        }
        
        Optional<GoalContribution> contributionOpt = goalContributionRepository.findByIdAndGoalId(contributionId, goalId);
        if (contributionOpt.isEmpty()) {
            throw new RuntimeException("Contribution not found");
        }
        
        GoalContribution contribution = contributionOpt.get();
        
        // Only allow updating source and notes
        if (source != null) contribution.setSource(source);
        if (notes != null) contribution.setNotes(notes);
        
        return goalContributionRepository.save(contribution);
    }
    
    @Transactional
    public void deleteContribution(Long goalId, Long contributionId, Long userId) {
        // Verify goal ownership
        Optional<Goal> goalOpt = goalRepository.findByIdAndUserId(goalId, userId);
        if (goalOpt.isEmpty()) {
            throw new RuntimeException("Goal not found");
        }
        
        Goal goal = goalOpt.get();
        
        Optional<GoalContribution> contributionOpt = goalContributionRepository.findByIdAndGoalId(contributionId, goalId);
        if (contributionOpt.isEmpty()) {
            throw new RuntimeException("Contribution not found");
        }
        
        GoalContribution contribution = contributionOpt.get();
        
        // Update goal current amount
        goal.setCurrentAmount(goal.getCurrentAmount().subtract(contribution.getAmount()));
        
        // Update goal status if it was completed
        if ("completed".equals(goal.getStatus()) && goal.getCurrentAmount().compareTo(goal.getTargetAmount()) < 0) {
            goal.setStatus("active");
            goal.setCompletedAt(null);
        }
        
        goalRepository.save(goal);
        goalContributionRepository.delete(contribution);
    }

    // Bulk contribution
    @Transactional
    public Map<String, Object> addBulkContribution(Long userId, BigDecimal totalAmount, String source,
                                                   LocalDate date, String notes, 
                                                   List<Map<String, Object>> distributions) {
        // Validate total matches distribution sum
        BigDecimal distributionSum = distributions.stream()
            .map(d -> new BigDecimal(d.get("amount").toString()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        if (totalAmount.compareTo(distributionSum) != 0) {
            throw new RuntimeException("Total amount doesn't match distribution sum");
        }
        
        List<Map<String, Object>> contributionsCreated = new ArrayList<>();
        List<Map<String, Object>> goalsUpdated = new ArrayList<>();
        int successfulContributions = 0;
        
        for (Map<String, Object> distribution : distributions) {
            try {
                Long goalId = Long.valueOf(distribution.get("goalId").toString());
                BigDecimal amount = new BigDecimal(distribution.get("amount").toString());
                String contributionNotes = distribution.get("notes") != null ? 
                    distribution.get("notes").toString() : notes;
                
                GoalContribution contribution = addContribution(goalId, amount, source, contributionNotes, date, userId);
                Goal updatedGoal = contribution.getGoal();
                
                Map<String, Object> contributionInfo = new HashMap<>();
                contributionInfo.put("goalId", goalId);
                contributionInfo.put("goalName", updatedGoal.getName());
                contributionInfo.put("contributionId", contribution.getId());
                contributionInfo.put("amount", amount);
                contributionsCreated.add(contributionInfo);
                
                Map<String, Object> goalInfo = new HashMap<>();
                goalInfo.put("id", updatedGoal.getId());
                goalInfo.put("name", updatedGoal.getName());
                goalInfo.put("newCurrentAmount", updatedGoal.getCurrentAmount());
                goalInfo.put("newProgress", updatedGoal.getProgress());
                goalsUpdated.add(goalInfo);
                
                successfulContributions++;
            } catch (Exception e) {
                // Log error but continue with other contributions
                System.err.println("Failed to add contribution: " + e.getMessage());
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAmount", totalAmount);
        summary.put("distributedAmount", distributionSum);
        summary.put("successfulContributions", successfulContributions);
        summary.put("failedContributions", distributions.size() - successfulContributions);
        summary.put("contributionsCreated", contributionsCreated);
        
        result.put("summary", summary);
        result.put("goalsUpdated", goalsUpdated);
        
        return result;
    }

    // Statistics and analytics
    public Map<String, Object> getGoalSummary(Long userId, String period, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> summary = new HashMap<>();
        
        // Set date range based on period
        LocalDate start = startDate;
        LocalDate end = endDate;
        
        if ("current_year".equals(period)) {
            start = LocalDate.of(LocalDate.now().getYear(), 1, 1);
            end = LocalDate.of(LocalDate.now().getYear(), 12, 31);
        } else if ("current_month".equals(period)) {
            start = LocalDate.now().withDayOfMonth(1);
            end = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        }
        
        // Basic counts
        Long totalGoals = goalRepository.countTotalGoalsByUserId(userId);
        Long activeGoals = goalRepository.countActiveGoalsByUserId(userId);
        Long completedGoals = goalRepository.countCompletedGoalsByUserId(userId);
        Long overdueGoals = goalRepository.countOverdueGoalsByUserId(userId);
        
        // Financial summary
        BigDecimal totalTargetAmount = goalRepository.sumTotalTargetAmountByUserId(userId);
        BigDecimal totalCurrentAmount = goalRepository.sumTotalCurrentAmountByUserId(userId);
        BigDecimal totalRemainingAmount = goalRepository.sumTotalRemainingAmountByUserId(userId);
        Double averageProgress = goalRepository.averageProgressByUserId(userId);
        
        // Build response
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalGoals", totalGoals != null ? totalGoals : 0);
        overview.put("activeGoals", activeGoals != null ? activeGoals : 0);
        overview.put("completedGoals", completedGoals != null ? completedGoals : 0);
        overview.put("overdueGoals", overdueGoals != null ? overdueGoals : 0);
        
        Map<String, Object> financial = new HashMap<>();
        financial.put("totalTargetAmount", totalTargetAmount != null ? totalTargetAmount : BigDecimal.ZERO);
        financial.put("totalCurrentAmount", totalCurrentAmount != null ? totalCurrentAmount : BigDecimal.ZERO);
        financial.put("totalRemainingAmount", totalRemainingAmount != null ? totalRemainingAmount : BigDecimal.ZERO);
        financial.put("overallProgress", averageProgress != null ? averageProgress : 0.0);
        
        summary.put("overview", overview);
        summary.put("financial", financial);
        summary.put("period", period);
        
        if (start != null && end != null) {
            Map<String, String> dateRange = new HashMap<>();
            dateRange.put("startDate", start.toString());
            dateRange.put("endDate", end.toString());
            summary.put("dateRange", dateRange);
        }
        
        return summary;
    }
    
    public List<Map<String, Object>> getGoalCategories() {
        List<Map<String, Object>> categories = new ArrayList<>();
        
        // Define available categories with their metadata
        String[][] categoryData = {
            {"travel", "Travel & Vacation", "fa-plane-departure", "#3B82F6", "Trips, vacations, and travel experiences"},
            {"emergency", "Emergency Fund", "fa-shield-alt", "#EF4444", "Emergency savings and financial security"},
            {"transportation", "Transportation", "fa-car", "#F59E0B", "Vehicle purchases, maintenance, and transport"},
            {"home", "Home & Property", "fa-home", "#8B5CF6", "House down payment, furniture, home improvements"},
            {"education", "Education", "fa-graduation-cap", "#6366F1", "Courses, degrees, certifications, and learning"},
            {"technology", "Technology", "fa-laptop", "#10B981", "Gadgets, computers, and tech equipment"},
            {"health", "Health & Wellness", "fa-heartbeat", "#EC4899", "Medical expenses, fitness, and wellness"},
            {"business", "Business & Investment", "fa-briefcase", "#6B7280", "Business ventures, investments, and entrepreneurship"},
            {"entertainment", "Entertainment", "fa-film", "#F59E0B", "Hobbies, entertainment, and leisure activities"},
            {"gifts", "Gifts & Special Events", "fa-gift", "#EC4899", "Presents, celebrations, and special occasions"},
            {"other", "Other Goals", "fa-bullseye", "#9CA3AF", "Custom goals and miscellaneous savings"}
        };
        
        for (String[] data : categoryData) {
            Map<String, Object> category = new HashMap<>();
            category.put("name", data[0]);
            category.put("displayName", data[1]);
            category.put("icon", data[2]);
            category.put("color", data[3]);
            category.put("description", data[4]);
            categories.add(category);
        }
        
        return categories;
    }
    
    /**
     * Get advanced analytics for goals including trends, projections, and insights
     */
    public Map<String, Object> getGoalAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Monthly savings trend
        List<Map<String, Object>> monthlySavings = calculateMonthlySavings(userId, startDate, endDate);
        analytics.put("monthlySavings", monthlySavings);
        
        // Category distribution
        List<Map<String, Object>> categoryDistribution = calculateCategoryDistribution(userId);
        analytics.put("categoryDistribution", categoryDistribution);
        
        // Completion rate statistics
        Map<String, Object> completionRate = calculateCompletionRate(userId);
        analytics.put("completionRate", completionRate);
        
        // Average progress across all goals
        Double averageProgress = goalRepository.averageProgressByUserId(userId);
        analytics.put("averageProgress", averageProgress != null ? averageProgress : 0.0);
        
        // Projected completions by month
        List<Map<String, Object>> projectedCompletions = calculateProjectedCompletions(userId);
        analytics.put("projectedCompletions", projectedCompletions);
        
        // Performance insights
        Map<String, Object> insights = generateInsights(userId);
        analytics.put("insights", insights);
        
        return analytics;
    }
    
    /**
     * Update goal status with reason tracking
     */
    @Transactional
    public Goal updateGoalStatus(Long goalId, String newStatus, String reason, Long userId) {
        Optional<Goal> goalOpt = goalRepository.findByIdAndUserId(goalId, userId);
        if (goalOpt.isEmpty()) {
            throw new RuntimeException("Goal not found");
        }
        
        Goal goal = goalOpt.get();
        
        // Validate status
        List<String> validStatuses = Arrays.asList("active", "completed", "paused", "cancelled", "pending");
        if (!validStatuses.contains(newStatus)) {
            throw new RuntimeException("Invalid status. Valid statuses: " + String.join(", ", validStatuses));
        }
        
        String previousStatus = goal.getStatus();
        goal.setStatus(newStatus);
        
        // Set appropriate timestamps based on status
        LocalDateTime now = LocalDateTime.now();
        switch (newStatus) {
            case "completed":
                goal.setCompletedAt(now);
                break;
            case "paused":
                goal.setPausedAt(now);
                break;
            case "cancelled":
                goal.setCancelledAt(now);
                break;
            case "active":
                // Clear pause/cancel timestamps when reactivating
                goal.setPausedAt(null);
                goal.setCancelledAt(null);
                break;
        }
        
        // Log the status change if reason is provided
        if (reason != null && !reason.trim().isEmpty()) {
            // You could implement a status change log here
            // For now, we'll just update the goal
        }
        
        return goalRepository.save(goal);
    }
    
    // Helper methods for analytics
    
    private List<Map<String, Object>> calculateMonthlySavings(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> monthlySavings = new ArrayList<>();
        
        // Get all contributions in date range grouped by month
        List<GoalContribution> contributions = goalContributionRepository.findByGoal_UserIdAndDateBetween(
            userId, startDate, endDate);
        
        // Group by month and calculate totals
        Map<String, BigDecimal> monthlyTotals = contributions.stream()
            .collect(groupingBy(
                contribution -> contribution.getDate().toString().substring(0, 7), // YYYY-MM format
                reducing(BigDecimal.ZERO, GoalContribution::getAmount, BigDecimal::add)
            ));
        
        // Convert to response format
        monthlyTotals.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> {
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", entry.getKey());
                monthData.put("amount", entry.getValue());
                monthlySavings.add(monthData);
            });
        
        return monthlySavings;
    }
    
    private List<Map<String, Object>> calculateCategoryDistribution(Long userId) {
        List<Object[]> categoryStats = goalRepository.getCategoryStatsByUserId(userId);
        BigDecimal totalTargetAmount = goalRepository.sumTotalTargetAmountByUserId(userId);
        
        List<Map<String, Object>> distribution = new ArrayList<>();
        
        for (Object[] stats : categoryStats) {
            String category = (String) stats[0];
            Long count = (Long) stats[1];
            BigDecimal targetAmount = (BigDecimal) stats[2];
            BigDecimal currentAmount = (BigDecimal) stats[3];
            
            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("category", category);
            categoryData.put("count", count);
            categoryData.put("targetAmount", targetAmount);
            categoryData.put("currentAmount", currentAmount);
            
            // Calculate percentage of total
            double percentage = totalTargetAmount.compareTo(BigDecimal.ZERO) > 0 
                ? targetAmount.divide(totalTargetAmount, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
            categoryData.put("percentage", percentage);
            
            distribution.add(categoryData);
        }
        
        return distribution;
    }
    
    private Map<String, Object> calculateCompletionRate(Long userId) {
        Long totalGoals = goalRepository.countTotalGoalsByUserId(userId);
        Long completedGoals = goalRepository.countCompletedGoalsByUserId(userId);
        
        Map<String, Object> completionRate = new HashMap<>();
        completionRate.put("completed", completedGoals);
        completionRate.put("total", totalGoals);
        completionRate.put("percentage", totalGoals > 0 
            ? (completedGoals.doubleValue() / totalGoals.doubleValue()) * 100 
            : 0.0);
        
        return completionRate;
    }
    
    private List<Map<String, Object>> calculateProjectedCompletions(Long userId) {
        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, "active");
        List<Map<String, Object>> projections = new ArrayList<>();
        
        // Group goals by projected completion month
        Map<String, Long> monthlyCompletions = activeGoals.stream()
            .filter(goal -> goal.getProjectedCompletionDate() != null)
            .collect(groupingBy(
                goal -> goal.getProjectedCompletionDate().toString().substring(0, 7), // YYYY-MM
                counting()
            ));
        
        // Convert to response format and sort by month
        monthlyCompletions.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> {
                Map<String, Object> projection = new HashMap<>();
                projection.put("month", entry.getKey());
                projection.put("count", entry.getValue());
                projections.add(projection);
            });
        
        return projections;
    }
    
    private Map<String, Object> generateInsights(Long userId) {
        Map<String, Object> insights = new HashMap<>();
        
        // Count goals that are on track vs off track
        List<Goal> onTrackGoals = goalRepository.findGoalsOnTrackByUserId(userId);
        List<Goal> allActiveGoals = goalRepository.findByUserIdAndStatus(userId, "active");
        
        int onTrackCount = onTrackGoals.size();
        int totalActiveCount = allActiveGoals.size();
        int offTrackCount = totalActiveCount - onTrackCount;
        
        insights.put("goalsOnTrack", onTrackCount);
        insights.put("goalsOffTrack", offTrackCount);
        insights.put("totalActiveGoals", totalActiveCount);
        
        // Calculate average days to completion for completed goals
        List<Goal> completedGoals = goalRepository.findByUserIdAndStatus(userId, "completed");
        if (!completedGoals.isEmpty()) {
            double avgDaysToCompletion = completedGoals.stream()
                .filter(goal -> goal.getCreatedAt() != null && goal.getCompletedAt() != null)
                .mapToLong(goal -> ChronoUnit.DAYS.between(
                    goal.getCreatedAt().toLocalDate(), 
                    goal.getCompletedAt().toLocalDate()))
                .average()
                .orElse(0.0);
            insights.put("averageDaysToCompletion", avgDaysToCompletion);
        }
        
        // Most successful category (highest completion rate)
        List<Object[]> categoryStats = goalRepository.getCategoryStatsByUserId(userId);
        String mostSuccessfulCategory = null;
        double highestCompletionRate = 0.0;
        
        for (Object[] stats : categoryStats) {
            String category = (String) stats[0];
            Long categoryCompleted = goalRepository.countByUserIdAndStatus(userId, "completed");
            Long categoryTotal = (Long) stats[1];
            
            if (categoryTotal > 0) {
                double completionRate = (categoryCompleted.doubleValue() / categoryTotal.doubleValue()) * 100;
                if (completionRate > highestCompletionRate) {
                    highestCompletionRate = completionRate;
                    mostSuccessfulCategory = category;
                }
            }
        }
        
        insights.put("mostSuccessfulCategory", mostSuccessfulCategory);
        insights.put("mostSuccessfulCategoryRate", highestCompletionRate);
        
        return insights;
    }
}