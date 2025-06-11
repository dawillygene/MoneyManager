package com.example.moneymanager.repositories;

import com.example.moneymanager.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Basic queries
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<Transaction> findByUserIdAndCategory(Long userId, String category);
    
    // Enhanced filtering methods
    List<Transaction> findByUserIdAndType(Long userId, String type);
    List<Transaction> findByUserIdAndTypeAndCategory(Long userId, String type, String category);
    List<Transaction> findByUserIdAndTypeAndDateBetween(Long userId, String type, LocalDate startDate, LocalDate endDate);
    List<Transaction> findByUserIdAndCategoryAndDateBetween(Long userId, String category, LocalDate startDate, LocalDate endDate);
    List<Transaction> findByUserIdAndTypeAndCategoryAndDateBetween(Long userId, String type, String category, LocalDate startDate, LocalDate endDate);
    
    // Order by date (newest first)
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);
    List<Transaction> findByUserIdAndTypeOrderByDateDesc(Long userId, String type);
    List<Transaction> findByUserIdAndCategoryOrderByDateDesc(Long userId, String category);
    
    // Custom query for flexible filtering
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:startDate IS NULL OR t.date >= :startDate) " +
           "AND (:endDate IS NULL OR t.date <= :endDate) " +
           "ORDER BY t.date DESC")
    List<Transaction> findTransactionsWithFilters(
        @Param("userId") Long userId,
        @Param("type") String type,
        @Param("category") String category,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Count transactions by type
    Long countByUserIdAndType(Long userId, String type);
    
    // Get transactions by month and year
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
           "AND YEAR(t.date) = :year AND MONTH(t.date) = :month " +
           "ORDER BY t.date DESC")
    List<Transaction> findByUserIdAndYearAndMonth(
        @Param("userId") Long userId,
        @Param("year") int year,
        @Param("month") int month
    );
}