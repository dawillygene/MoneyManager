package com.example.moneymanager.repositories;

import com.example.moneymanager.models.LoginHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    Page<LoginHistory> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
    
    @Query("SELECT lh FROM LoginHistory lh WHERE lh.userId = :userId AND lh.timestamp BETWEEN :startDate AND :endDate ORDER BY lh.timestamp DESC")
    Page<LoginHistory> findByUserIdAndTimestampBetween(@Param("userId") Long userId, 
                                                      @Param("startDate") LocalDateTime startDate, 
                                                      @Param("endDate") LocalDateTime endDate, 
                                                      Pageable pageable);
    
    @Query("SELECT COUNT(lh) FROM LoginHistory lh WHERE lh.userId = :userId AND lh.success = false AND lh.timestamp > :since")
    long countFailedLoginsSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    @Query("DELETE FROM LoginHistory lh WHERE lh.timestamp < :cutoffTime")
    void deleteOldLoginHistory(@Param("cutoffTime") LocalDateTime cutoffTime);
}