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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

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
}