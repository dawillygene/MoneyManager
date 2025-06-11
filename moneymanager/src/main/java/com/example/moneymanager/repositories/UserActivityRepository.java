package com.example.moneymanager.repositories;

import com.example.moneymanager.models.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    Page<UserActivity> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
    
    @Query("SELECT ua FROM UserActivity ua WHERE ua.userId = :userId AND ua.timestamp BETWEEN :startDate AND :endDate ORDER BY ua.timestamp DESC")
    Page<UserActivity> findByUserIdAndTimestampBetween(@Param("userId") Long userId, 
                                                      @Param("startDate") LocalDateTime startDate, 
                                                      @Param("endDate") LocalDateTime endDate, 
                                                      Pageable pageable);
    
    @Query("SELECT ua FROM UserActivity ua WHERE ua.userId = :userId AND ua.action = :action ORDER BY ua.timestamp DESC")
    Page<UserActivity> findByUserIdAndAction(@Param("userId") Long userId, 
                                           @Param("action") String action, 
                                           Pageable pageable);
    
    @Query("DELETE FROM UserActivity ua WHERE ua.timestamp < :cutoffTime")
    void deleteOldActivities(@Param("cutoffTime") LocalDateTime cutoffTime);
}