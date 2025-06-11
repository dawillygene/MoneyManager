package com.example.moneymanager.repositories;

import com.example.moneymanager.models.Budget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    // Basic queries
    List<Budget> findByUserId(Long userId);
    List<Budget> findByUserIdAndCategory(Long userId, String category);
    Optional<Budget> findByIdAndUserId(Long id, Long userId);
    
    // Paginated queries with filtering
    Page<Budget> findByUserIdAndIsArchivedFalse(Long userId, Pageable pageable);
    List<Budget> findByUserIdAndIsArchivedFalse(Long userId); // Add this overload
    
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND (:category IS NULL OR b.category = :category) " +
           "AND (:recurring IS NULL OR b.recurring = :recurring) " +
           "AND (:search IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(b.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Budget> findBudgetsWithFilters(@Param("userId") Long userId,
                                      @Param("category") String category,
                                      @Param("recurring") String recurring,
                                      @Param("search") String search,
                                      Pageable pageable);
    
    // Status-based queries
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND CURRENT_DATE BETWEEN b.startDate AND b.endDate")
    List<Budget> findActiveBudgetsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND CURRENT_DATE < b.startDate")
    List<Budget> findUpcomingBudgetsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND CURRENT_DATE > b.endDate")
    List<Budget> findExpiredBudgetsByUserId(@Param("userId") Long userId);
    
    // Alert-related queries
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.alertTriggered = true AND b.isArchived = false")
    List<Budget> findBudgetsWithAlerts(@Param("userId") Long userId);
    
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND b.spent > b.amount")
    List<Budget> findOverBudgetsByUserId(@Param("userId") Long userId);
    
    // Summary and analytics queries
    @Query("SELECT COUNT(b) FROM Budget b WHERE b.userId = :userId AND b.isArchived = false")
    Long countActiveBudgetsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(b) FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND CURRENT_DATE BETWEEN b.startDate AND b.endDate")
    Long countCurrentActiveBudgetsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(b) FROM Budget b WHERE b.userId = :userId AND b.alertTriggered = true AND b.isArchived = false")
    Long countBudgetsWithAlertsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(b) FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND b.spent > b.amount")
    Long countOverBudgetsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(b.amount) FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND CURRENT_DATE BETWEEN b.startDate AND b.endDate")
    Double sumTotalBudgetAmountByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(b.spent) FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND CURRENT_DATE BETWEEN b.startDate AND b.endDate")
    Double sumTotalSpentByUserId(@Param("userId") Long userId);
    
    // Recurring budget queries
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.recurring IS NOT NULL " +
           "AND b.recurring != 'none' AND b.isArchived = false")
    List<Budget> findRecurringBudgetsByUserId(@Param("userId") Long userId);
    
    // Category-based analytics
    @Query("SELECT b.category, SUM(b.amount), SUM(b.spent) FROM Budget b " +
           "WHERE b.userId = :userId AND b.isArchived = false " +
           "AND CURRENT_DATE BETWEEN b.startDate AND b.endDate " +
           "GROUP BY b.category")
    List<Object[]> findCategoryBreakdownByUserId(@Param("userId") Long userId);
    
    // Date range queries
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.isArchived = false " +
           "AND ((b.startDate <= :endDate AND b.endDate >= :startDate))")
    List<Budget> findBudgetsByUserIdAndDateRange(@Param("userId") Long userId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);
    
    // Archive-related queries
    List<Budget> findByUserIdAndIsArchivedTrue(Long userId);
    
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.isArchived = true " +
           "ORDER BY b.archivedAt DESC")
    List<Budget> findArchivedBudgetsByUserIdOrderByArchivedAtDesc(@Param("userId") Long userId);
    
    // Duplicate source queries
    List<Budget> findBySourceBudgetIdAndUserId(Long sourceBudgetId, Long userId);
}