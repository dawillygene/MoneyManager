package com.example.moneymanager.repositories;

import com.example.moneymanager.models.GoalContribution;
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
public interface GoalContributionRepository extends JpaRepository<GoalContribution, Long> {
    
    // Basic queries
    List<GoalContribution> findByGoalId(Long goalId);
    Page<GoalContribution> findByGoalId(Long goalId, Pageable pageable);
    Optional<GoalContribution> findByIdAndGoalId(Long id, Long goalId);
    
    // Contributions with filtering
    @Query("SELECT gc FROM GoalContribution gc WHERE gc.goal.id = :goalId " +
           "AND (:source IS NULL OR gc.source = :source) " +
           "AND (:startDate IS NULL OR gc.date >= :startDate) " +
           "AND (:endDate IS NULL OR gc.date <= :endDate) " +
           "AND (:minAmount IS NULL OR gc.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR gc.amount <= :maxAmount)")
    Page<GoalContribution> findFilteredContributions(@Param("goalId") Long goalId,
                                                    @Param("source") String source,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate,
                                                    @Param("minAmount") java.math.BigDecimal minAmount,
                                                    @Param("maxAmount") java.math.BigDecimal maxAmount,
                                                    Pageable pageable);
    
    // Statistics queries
    @Query("SELECT COUNT(gc) FROM GoalContribution gc WHERE gc.goal.id = :goalId")
    Long countByGoalId(@Param("goalId") Long goalId);
    
    @Query("SELECT SUM(gc.amount) FROM GoalContribution gc WHERE gc.goal.id = :goalId")
    java.math.BigDecimal sumAmountByGoalId(@Param("goalId") Long goalId);
    
    @Query("SELECT AVG(gc.amount) FROM GoalContribution gc WHERE gc.goal.id = :goalId")
    Double averageAmountByGoalId(@Param("goalId") Long goalId);
    
    @Query("SELECT MAX(gc.amount) FROM GoalContribution gc WHERE gc.goal.id = :goalId")
    java.math.BigDecimal maxAmountByGoalId(@Param("goalId") Long goalId);
    
    @Query("SELECT MIN(gc.amount) FROM GoalContribution gc WHERE gc.goal.id = :goalId")
    java.math.BigDecimal minAmountByGoalId(@Param("goalId") Long goalId);
    
    // Contributions by source
    @Query("SELECT COUNT(gc) FROM GoalContribution gc WHERE gc.goal.id = :goalId AND gc.source = :source")
    Long countByGoalIdAndSource(@Param("goalId") Long goalId, @Param("source") String source);
    
    @Query("SELECT SUM(gc.amount) FROM GoalContribution gc WHERE gc.goal.id = :goalId AND gc.source = :source")
    java.math.BigDecimal sumAmountByGoalIdAndSource(@Param("goalId") Long goalId, @Param("source") String source);
    
    // Recent contributions
    @Query("SELECT gc FROM GoalContribution gc WHERE gc.goal.id = :goalId ORDER BY gc.date DESC, gc.createdAt DESC")
    List<GoalContribution> findRecentContributionsByGoalId(@Param("goalId") Long goalId, Pageable pageable);
    
    // Contributions by date range
    @Query("SELECT gc FROM GoalContribution gc WHERE gc.goal.id = :goalId " +
           "AND gc.date >= :startDate AND gc.date <= :endDate")
    List<GoalContribution> findByGoalIdAndDateBetween(@Param("goalId") Long goalId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);
    
    // Monthly breakdown
    @Query("SELECT YEAR(gc.date), MONTH(gc.date), SUM(gc.amount), COUNT(gc) " +
           "FROM GoalContribution gc WHERE gc.goal.id = :goalId " +
           "GROUP BY YEAR(gc.date), MONTH(gc.date) " +
           "ORDER BY YEAR(gc.date) DESC, MONTH(gc.date) DESC")
    List<Object[]> getMonthlyBreakdownByGoalId(@Param("goalId") Long goalId);
    
    // User-level contribution queries
    @Query("SELECT gc FROM GoalContribution gc WHERE gc.goal.userId = :userId")
    List<GoalContribution> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(gc.amount) FROM GoalContribution gc WHERE gc.goal.userId = :userId " +
           "AND gc.date >= :startDate AND gc.date <= :endDate")
    java.math.BigDecimal sumContributionsByUserIdAndDateRange(@Param("userId") Long userId,
                                                             @Param("startDate") LocalDate startDate,
                                                             @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(gc) FROM GoalContribution gc WHERE gc.goal.userId = :userId " +
           "AND gc.date >= :startDate AND gc.date <= :endDate")
    Long countContributionsByUserIdAndDateRange(@Param("userId") Long userId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);
}