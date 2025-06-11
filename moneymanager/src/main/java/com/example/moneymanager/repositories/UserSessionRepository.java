package com.example.moneymanager.repositories;

import com.example.moneymanager.models.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    List<UserSession> findByUserIdAndActiveTrue(Long userId);
    
    Optional<UserSession> findBySessionIdAndActiveTrue(String sessionId);
    
    @Query("UPDATE UserSession s SET s.active = false WHERE s.userId = :userId AND s.sessionId != :currentSessionId")
    void deactivateOtherSessions(@Param("userId") Long userId, @Param("currentSessionId") String currentSessionId);
    
    @Query("UPDATE UserSession s SET s.active = false WHERE s.sessionId = :sessionId")
    void deactivateSession(@Param("sessionId") String sessionId);
    
    @Query("DELETE FROM UserSession s WHERE s.lastActivity < :cutoffTime")
    void deleteInactiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);
}