package com.example.moneymanager.controllers;

import com.example.moneymanager.models.Goal;
import com.example.moneymanager.services.GoalService;
import com.example.moneymanager.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class GoalController {
    @Autowired
    private GoalService goalService;

    @Autowired
    private JwtService jwtService;

    private Long getUserIdFromToken(String authorizationHeader) {
        String token = authorizationHeader.replace("Bearer ", "");
        return Long.parseLong(jwtService.extractClaims(token).get("userId").toString());
    }

    @GetMapping
    public ResponseEntity<?> getAllGoals(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            List<Goal> goals = goalService.getAllGoalsByUserId(userId);
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve goals");
            errorResponse.put("code", "GOALS_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createGoal(@RequestHeader("Authorization") String authorizationHeader, 
                                      @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Goal goal = new Goal();
            goal.setName((String) requestBody.get("name"));
            goal.setTargetAmount(new BigDecimal(requestBody.get("targetAmount").toString()));
            goal.setCurrentAmount(new BigDecimal(requestBody.get("currentAmount").toString()));
            goal.setTargetDate(LocalDate.parse((String) requestBody.get("targetDate")));
            goal.setDescription((String) requestBody.get("description"));
            goal.setIcon((String) requestBody.get("icon"));
            goal.setUserId(userId);
            
            Goal createdGoal = goalService.createGoal(goal);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdGoal);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to create goal: " + e.getMessage());
            errorResponse.put("code", "GOAL_CREATION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGoalById(@RequestHeader("Authorization") String authorizationHeader, 
                                       @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Optional<Goal> goal = goalService.getGoalByIdAndUserId(id, userId);
            
            if (goal.isPresent()) {
                return ResponseEntity.ok(goal.get());
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Goal not found");
                errorResponse.put("code", "GOAL_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve goal");
            errorResponse.put("code", "GOAL_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@RequestHeader("Authorization") String authorizationHeader, 
                                      @PathVariable Long id, 
                                      @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Goal updatedGoal = new Goal();
            updatedGoal.setName((String) requestBody.get("name"));
            updatedGoal.setTargetAmount(new BigDecimal(requestBody.get("targetAmount").toString()));
            updatedGoal.setCurrentAmount(new BigDecimal(requestBody.get("currentAmount").toString()));
            updatedGoal.setTargetDate(LocalDate.parse((String) requestBody.get("targetDate")));
            updatedGoal.setDescription((String) requestBody.get("description"));
            updatedGoal.setIcon((String) requestBody.get("icon"));
            
            Goal goal = goalService.updateGoal(id, updatedGoal, userId);
            return ResponseEntity.ok(goal);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to update goal: " + e.getMessage());
            errorResponse.put("code", "GOAL_UPDATE_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@RequestHeader("Authorization") String authorizationHeader, 
                                      @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            goalService.deleteGoal(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to delete goal: " + e.getMessage());
            errorResponse.put("code", "GOAL_DELETION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}