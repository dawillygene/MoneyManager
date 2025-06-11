package com.example.moneymanager.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(length = 500)
    private String description;

    @Column
    private String recurring;

    @Column
    private Integer alertLevel = 80; // Default to 80%

    @Column(nullable = false)
    private Long userId;

    // Enhanced fields for comprehensive budget management
    @Column
    private String categoryIcon;

    @Column
    private String categoryColor;

    @Column(precision = 12, scale = 2)
    private BigDecimal spent = BigDecimal.ZERO;

    @Column
    private Boolean alertTriggered = false;

    @Column
    private Boolean isArchived = false;

    @Column
    private LocalDateTime archivedAt;

    @Column
    private LocalDateTime restoredAt;

    @Column
    private Long sourceBudgetId; // For duplicated budgets

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Tags stored as comma-separated string for simplicity
    @Column(length = 1000)
    private String tags;

    // Constructors
    public Budget() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Budget(String name, BigDecimal amount, String category, LocalDate startDate, LocalDate endDate, Long userId) {
        this.name = name;
        this.amount = amount;
        this.category = category;
        this.startDate = startDate;
        this.endDate = endDate;
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Computed properties methods
    public BigDecimal getRemaining() {
        return amount.subtract(spent);
    }

    public Double getProgress() {
        if (amount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return spent.divide(amount, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue();
    }

    public Boolean getIsOverBudget() {
        return spent.compareTo(amount) > 0;
    }

    public String getStatus() {
        LocalDate now = LocalDate.now();
        if (isArchived) {
            return "archived";
        } else if (now.isBefore(startDate)) {
            return "upcoming";
        } else if (now.isAfter(endDate)) {
            return "expired";
        } else {
            return "active";
        }
    }

    public Long getDaysRemaining() {
        LocalDate now = LocalDate.now();
        if (now.isAfter(endDate)) {
            return 0L;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(now, endDate);
    }

    public Double getAverageDailySpend() {
        LocalDate now = LocalDate.now();
        LocalDate effectiveStartDate = startDate.isBefore(now) ? startDate : now;
        long daysPassed = java.time.temporal.ChronoUnit.DAYS.between(effectiveStartDate, now) + 1;
        
        if (daysPassed <= 0) {
            return 0.0;
        }
        
        return spent.divide(new BigDecimal(daysPassed), 2, RoundingMode.HALF_UP).doubleValue();
    }

    public BigDecimal getProjectedTotal() {
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        long daysPassed = java.time.temporal.ChronoUnit.DAYS.between(startDate, LocalDate.now()) + 1;
        
        if (daysPassed <= 0 || totalDays <= 0) {
            return BigDecimal.ZERO;
        }
        
        double averageDailySpend = getAverageDailySpend();
        return new BigDecimal(averageDailySpend * totalDays);
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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRecurring() {
        return recurring;
    }

    public void setRecurring(String recurring) {
        this.recurring = recurring;
    }

    public Integer getAlertLevel() {
        return alertLevel;
    }

    public void setAlertLevel(Integer alertLevel) {
        this.alertLevel = alertLevel;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCategoryIcon() {
        return categoryIcon;
    }

    public void setCategoryIcon(String categoryIcon) {
        this.categoryIcon = categoryIcon;
    }

    public String getCategoryColor() {
        return categoryColor;
    }

    public void setCategoryColor(String categoryColor) {
        this.categoryColor = categoryColor;
    }

    public BigDecimal getSpent() {
        return spent;
    }

    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }

    public Boolean getAlertTriggered() {
        return alertTriggered;
    }

    public void setAlertTriggered(Boolean alertTriggered) {
        this.alertTriggered = alertTriggered;
    }

    public Boolean getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Boolean isArchived) {
        this.isArchived = isArchived;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }

    public LocalDateTime getRestoredAt() {
        return restoredAt;
    }

    public void setRestoredAt(LocalDateTime restoredAt) {
        this.restoredAt = restoredAt;
    }

    public Long getSourceBudgetId() {
        return sourceBudgetId;
    }

    public void setSourceBudgetId(Long sourceBudgetId) {
        this.sourceBudgetId = sourceBudgetId;
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

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    // Helper methods for tags
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
}