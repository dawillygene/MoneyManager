package com.example.moneymanager.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Entity
@Table(name = "goals")
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal targetAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate targetDate;

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String icon = "fa-bullseye";

    @Column(nullable = false)
    private Long userId;

    // Enhanced fields for comprehensive goal management
    @Column(length = 20)
    private String priority = "medium"; // low, medium, high

    @Column(length = 50)
    private String category = "other"; // travel, emergency, transportation, etc.

    @Column(length = 20)
    private String status = "active"; // active, completed, paused, overdue, cancelled

    @Column(length = 1000)
    private String tags; // Comma-separated tags

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime completedAt;

    @Column
    private LocalDateTime pausedAt;

    @Column
    private LocalDateTime cancelledAt;

    // One-to-many relationship with contributions
    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<GoalContribution> contributions;

    // Constructors
    public Goal() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Goal(String name, BigDecimal targetAmount, BigDecimal currentAmount, LocalDate targetDate, Long userId) {
        this.name = name;
        this.targetAmount = targetAmount;
        this.currentAmount = currentAmount != null ? currentAmount : BigDecimal.ZERO;
        this.targetDate = targetDate;
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        
        // Auto-update status based on progress and dates
        if (this.currentAmount.compareTo(this.targetAmount) >= 0 && !"completed".equals(this.status)) {
            this.status = "completed";
            this.completedAt = LocalDateTime.now();
        } else if (LocalDate.now().isAfter(this.targetDate) && !"completed".equals(this.status) && !"overdue".equals(this.status)) {
            this.status = "overdue";
        }
    }

    // Computed properties methods
    public Double getProgress() {
        if (targetAmount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return currentAmount.divide(targetAmount, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue();
    }

    public BigDecimal getRemainingAmount() {
        return targetAmount.subtract(currentAmount).max(BigDecimal.ZERO);
    }

    public Long getDaysRemaining() {
        LocalDate now = LocalDate.now();
        if (now.isAfter(targetDate)) {
            return 0L;
        }
        return ChronoUnit.DAYS.between(now, targetDate);
    }

    public Boolean getIsOverdue() {
        return LocalDate.now().isAfter(targetDate) && !"completed".equals(status);
    }

    public Boolean getIsCompleted() {
        return "completed".equals(status) || currentAmount.compareTo(targetAmount) >= 0;
    }

    public Boolean getOnTrack() {
        if (getIsCompleted()) return true;
        
        long totalDays = ChronoUnit.DAYS.between(LocalDate.now(), targetDate);
        if (totalDays <= 0) return false;
        
        BigDecimal dailyTargetAmount = getDailyTargetAmount();
        BigDecimal currentDailyRate = getCurrentDailyRate();
        
        return currentDailyRate.compareTo(dailyTargetAmount) >= 0;
    }

    public BigDecimal getDailyTargetAmount() {
        long daysRemaining = getDaysRemaining();
        if (daysRemaining <= 0) return BigDecimal.ZERO;
        
        return getRemainingAmount().divide(BigDecimal.valueOf(daysRemaining), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal getWeeklyTargetAmount() {
        return getDailyTargetAmount().multiply(BigDecimal.valueOf(7));
    }

    public BigDecimal getMonthlyTargetAmount() {
        return getDailyTargetAmount().multiply(BigDecimal.valueOf(30));
    }

    private BigDecimal getCurrentDailyRate() {
        // Calculate based on contributions over the last 30 days
        // This would require accessing contributions, simplified for now
        return BigDecimal.ZERO;
    }

    public LocalDate getProjectedCompletionDate() {
        BigDecimal dailyRate = getCurrentDailyRate();
        if (dailyRate.compareTo(BigDecimal.ZERO) <= 0) {
            return targetDate.plusDays(30); // Conservative estimate
        }
        
        BigDecimal remaining = getRemainingAmount();
        long daysNeeded = remaining.divide(dailyRate, 0, RoundingMode.CEILING).longValue();
        
        return LocalDate.now().plusDays(daysNeeded);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(BigDecimal currentAmount) {
        this.currentAmount = currentAmount;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public List<String> getTagsList() {
        if (tags == null || tags.trim().isEmpty()) {
            return List.of();
        }
        return List.of(tags.split(","));
    }

    public void setTagsList(List<String> tagsList) {
        if (tagsList == null || tagsList.isEmpty()) {
            this.tags = null;
        } else {
            this.tags = String.join(",", tagsList);
        }
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getPausedAt() {
        return pausedAt;
    }

    public void setPausedAt(LocalDateTime pausedAt) {
        this.pausedAt = pausedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public List<GoalContribution> getContributions() {
        return contributions;
    }

    public void setContributions(List<GoalContribution> contributions) {
        this.contributions = contributions;
    }
}