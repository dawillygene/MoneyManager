package com.example.moneymanager.repositories;

import com.example.moneymanager.models.Goal;
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
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    // Basic queries
    List<Goal> findByUserId(Long userId);
    Optional<Goal> findByIdAndUserId(Long id, Long userId);
    
    // Check for duplicate names per user
    Optional<Goal> findByNameAndUserId(String name, Long userId);
    Optional<Goal> findByNameAndUserIdAndIdNot(String name, Long userId, Long id);
    
    // Paginated queries with filtering
    @Query("SELECT g FROM Goal g WHERE g.userId = :userId " +
           "AND (:status IS NULL OR g.status = :status) " +
           "AND (:category IS NULL OR g.category = :category) " +
           "AND (:priority IS NULL OR g.priority = :priority) " +
           "AND (:search IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Goal> findFilteredGoals(@Param("userId") Long userId,
                                @Param("status") String status,
                                @Param("category") String category,
                                @Param("priority") String priority,
                                @Param("search") String search,
                                Pageable pageable);
    
    // Goals by status
    List<Goal> findByUserIdAndStatus(Long userId, String status);
    Long countByUserIdAndStatus(Long userId, String status);
    
    // Goals by category
    List<Goal> findByUserIdAndCategory(Long userId, String category);
    
    // Goals by priority
    List<Goal> findByUserIdAndPriority(Long userId, String priority);
    
    // Date-based queries
    @Query("SELECT g FROM Goal g WHERE g.userId = :userId AND g.targetDate < CURRENT_DATE AND g.status != 'completed'")
    List<Goal> findOverdueGoalsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT g FROM Goal g WHERE g.userId = :userId AND g.targetDate BETWEEN :startDate AND :endDate")
    List<Goal> findGoalsByTargetDateRange(@Param("userId") Long userId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
    
    // Statistics queries
    @Query("SELECT COUNT(g) FROM Goal g WHERE g.userId = :userId")
    Long countTotalGoalsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(g) FROM Goal g WHERE g.userId = :userId AND g.status = 'active'")
    Long countActiveGoalsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(g) FROM Goal g WHERE g.userId = :userId AND g.status = 'completed'")
    Long countCompletedGoalsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(g) FROM Goal g WHERE g.userId = :userId AND g.targetDate < CURRENT_DATE AND g.status != 'completed'")
    Long countOverdueGoalsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(g.targetAmount) FROM Goal g WHERE g.userId = :userId")
    java.math.BigDecimal sumTotalTargetAmountByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(g.currentAmount) FROM Goal g WHERE g.userId = :userId")
    java.math.BigDecimal sumTotalCurrentAmountByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(g.targetAmount - g.currentAmount) FROM Goal g WHERE g.userId = :userId AND g.currentAmount < g.targetAmount")
    java.math.BigDecimal sumTotalRemainingAmountByUserId(@Param("userId") Long userId);
    
    @Query("SELECT AVG((g.currentAmount / g.targetAmount) * 100) FROM Goal g WHERE g.userId = :userId AND g.targetAmount > 0")
    Double averageProgressByUserId(@Param("userId") Long userId);
    
    // Category statistics
    @Query("SELECT g.category, COUNT(g), SUM(g.targetAmount), SUM(g.currentAmount) " +
           "FROM Goal g WHERE g.userId = :userId " +
           "GROUP BY g.category")
    List<Object[]> getCategoryStatsByUserId(@Param("userId") Long userId);
    
    // Priority statistics
    @Query("SELECT g.priority, COUNT(g), SUM(g.targetAmount), SUM(g.currentAmount) " +
           "FROM Goal g WHERE g.userId = :userId " +
           "GROUP BY g.priority")
    List<Object[]> getPriorityStatsByUserId(@Param("userId") Long userId);
    
    // Goals on track / off track
    @Query("SELECT g FROM Goal g WHERE g.userId = :userId AND g.status = 'active' " +
           "AND g.targetDate >= CURRENT_DATE AND (g.currentAmount / g.targetAmount) >= " +
           "((DATEDIFF(CURRENT_DATE, g.createdAt) + 1.0) / DATEDIFF(g.targetDate, DATE(g.createdAt)))")
    List<Goal> findGoalsOnTrackByUserId(@Param("userId") Long userId);
    
    @Query("SELECT g FROM Goal g WHERE g.userId = :userId AND g.status = 'active' " +
           "AND g.targetDate >= CURRENT_DATE AND (g.currentAmount / g.targetAmount) < " +
           "((DATEDIFF(CURRENT_DATE, g.createdAt) + 1.0) / DATEDIFF(g.targetDate, DATE(g.createdAt)))")
    List<Goal> findGoalsOffTrackByUserId(@Param("userId") Long userId);
    
    // Recent goals
    @Query("SELECT g FROM Goal g WHERE g.userId = :userId ORDER BY g.createdAt DESC")
    List<Goal> findRecentGoalsByUserId(@Param("userId") Long userId, Pageable pageable);
    
    // Goals ending soon
    @Query("SELECT g FROM Goal g WHERE g.userId = :userId AND g.status = 'active' " +
           "AND g.targetDate BETWEEN CURRENT_DATE AND :endDate ORDER BY g.targetDate ASC")
    List<Goal> findGoalsEndingSoonByUserId(@Param("userId") Long userId, @Param("endDate") LocalDate endDate);
    
    // Goals by completion percentage range
    @Query("SELECT g FROM Goal g WHERE g.userId = :userId " +
           "AND (g.currentAmount / g.targetAmount * 100) BETWEEN :minPercent AND :maxPercent")
    List<Goal> findGoalsByProgressRange(@Param("userId") Long userId,
                                       @Param("minPercent") Double minPercent,
                                       @Param("maxPercent") Double maxPercent);
}