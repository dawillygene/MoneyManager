package com.example.moneymanager.controllers;

import com.example.moneymanager.models.Goal;
import com.example.moneymanager.models.GoalContribution;
import com.example.moneymanager.services.GoalService;
import com.example.moneymanager.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
    public ResponseEntity<?> getAllGoals(@RequestHeader("Authorization") String authorizationHeader,
                                       @RequestParam(required = false, defaultValue = "1") int page,
                                       @RequestParam(required = false, defaultValue = "10") int limit,
                                       @RequestParam(required = false) String sortBy,
                                       @RequestParam(required = false, defaultValue = "asc") String sortOrder,
                                       @RequestParam(required = false) String status,
                                       @RequestParam(required = false) String search,
                                       @RequestParam(required = false) String category,
                                       @RequestParam(required = false) String priority) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            Page<Goal> goalsPage = goalService.getFilteredGoals(userId, status, category, priority, 
                search, sortBy, sortOrder, page, limit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("goals", goalsPage.getContent());
            
            // Pagination info
            Map<String, Object> pagination = new HashMap<>();
            pagination.put("currentPage", goalsPage.getNumber() + 1);
            pagination.put("totalPages", goalsPage.getTotalPages());
            pagination.put("totalItems", goalsPage.getTotalElements());
            pagination.put("itemsPerPage", goalsPage.getSize());
            pagination.put("hasNextPage", goalsPage.hasNext());
            pagination.put("hasPrevPage", goalsPage.hasPrevious());
            response.put("pagination", pagination);
            
            // Summary statistics
            Map<String, Object> summary = goalService.getGoalSummary(userId, "all", null, null);
            response.put("summary", summary);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve goals: " + e.getMessage());
            errorResponse.put("code", "GOALS_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createGoal(@RequestHeader("Authorization") String authorizationHeader,
                                      @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            // Validate required fields
            if (!requestBody.containsKey("name") || !requestBody.containsKey("targetAmount") ||
                !requestBody.containsKey("targetDate")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Missing required fields: name, targetAmount, targetDate");
                errorResponse.put("code", "MISSING_REQUIRED_FIELDS");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            Goal goal = new Goal();
            goal.setName((String) requestBody.get("name"));
            goal.setTargetAmount(new BigDecimal(requestBody.get("targetAmount").toString()));
            goal.setTargetDate(LocalDate.parse((String) requestBody.get("targetDate")));
            goal.setUserId(userId);
            
            // Optional fields
            if (requestBody.containsKey("description")) {
                goal.setDescription((String) requestBody.get("description"));
            }
            if (requestBody.containsKey("currentAmount")) {
                goal.setCurrentAmount(new BigDecimal(requestBody.get("currentAmount").toString()));
            }
            if (requestBody.containsKey("icon")) {
                goal.setIcon((String) requestBody.get("icon"));
            }
            if (requestBody.containsKey("priority")) {
                goal.setPriority((String) requestBody.get("priority"));
            }
            if (requestBody.containsKey("category")) {
                goal.setCategory((String) requestBody.get("category"));
            }
            if (requestBody.containsKey("tags")) {
                @SuppressWarnings("unchecked")
                List<String> tags = (List<String>) requestBody.get("tags");
                goal.setTagsList(tags);
            }
            
            Goal createdGoal = goalService.createGoal(goal);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdGoal);
            
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            
            if (e.getMessage().contains("already exists")) {
                errorResponse.put("code", "GOAL_DUPLICATE_NAME");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
            } else if (e.getMessage().contains("future")) {
                errorResponse.put("code", "GOAL_INVALID_TARGET_DATE");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            } else if (e.getMessage().contains("positive")) {
                errorResponse.put("code", "GOAL_INVALID_AMOUNT");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            errorResponse.put("code", "GOAL_CREATION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
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
                                       @PathVariable Long id,
                                       @RequestParam(required = false, defaultValue = "true") boolean includeContributions,
                                       @RequestParam(required = false, defaultValue = "20") int contributionLimit) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Optional<Goal> goalOpt = goalService.getGoalByIdAndUserId(id, userId);
            
            if (goalOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Goal not found");
                errorResponse.put("code", "GOAL_NOT_FOUND");
                Map<String, Object> details = new HashMap<>();
                details.put("goalId", id);
                details.put("userId", userId);
                errorResponse.put("details", details);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            Goal goal = goalOpt.get();
            
            // Convert goal to map with computed properties
            Map<String, Object> goalMap = buildGoalResponse(goal);
            
            if (includeContributions) {
                Page<GoalContribution> contributions = goalService.getGoalContributions(
                    id, userId, null, null, null, null, null, "date", "desc", 1, contributionLimit);
                goalMap.put("contributions", contributions.getContent());
            }
            
            return ResponseEntity.ok(goalMap);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve goal: " + e.getMessage());
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
            updatedGoal.setTargetDate(LocalDate.parse((String) requestBody.get("targetDate")));
            updatedGoal.setDescription((String) requestBody.get("description"));
            updatedGoal.setIcon((String) requestBody.get("icon"));
            updatedGoal.setPriority((String) requestBody.get("priority"));
            updatedGoal.setCategory((String) requestBody.get("category"));
            
            if (requestBody.containsKey("tags")) {
                @SuppressWarnings("unchecked")
                List<String> tags = (List<String>) requestBody.get("tags");
                updatedGoal.setTagsList(tags);
            }
            
            Goal goal = goalService.updateGoal(id, updatedGoal, userId);
            return ResponseEntity.ok(goal);
            
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            
            if (e.getMessage().contains("not found")) {
                errorResponse.put("code", "GOAL_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            } else if (e.getMessage().contains("completed")) {
                errorResponse.put("code", "GOAL_ALREADY_COMPLETED");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            } else if (e.getMessage().contains("already exists")) {
                errorResponse.put("code", "GOAL_DUPLICATE_NAME");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
            }
            
            errorResponse.put("code", "GOAL_UPDATE_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
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
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Goal deleted successfully");
            response.put("deletedGoalId", id);
            response.put("deletedAt", java.time.LocalDateTime.now());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            
            if (e.getMessage().contains("not found")) {
                errorResponse.put("code", "GOAL_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            errorResponse.put("code", "GOAL_DELETION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to delete goal: " + e.getMessage());
            errorResponse.put("code", "GOAL_DELETION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<?> addContribution(@RequestHeader("Authorization") String authorizationHeader,
                                           @PathVariable Long id,
                                           @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            // Validate required fields
            if (!requestBody.containsKey("amount") || !requestBody.containsKey("source")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Missing required fields: amount, source");
                errorResponse.put("code", "MISSING_REQUIRED_FIELDS");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            BigDecimal amount = new BigDecimal(requestBody.get("amount").toString());
            String source = (String) requestBody.get("source");
            String notes = (String) requestBody.get("notes");
            LocalDate date = requestBody.containsKey("date") ? 
                LocalDate.parse((String) requestBody.get("date")) : LocalDate.now();
            
            GoalContribution contribution = goalService.addContribution(id, amount, source, notes, date, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("contribution", contribution);
            
            // Include updated goal information
            Optional<Goal> updatedGoalOpt = goalService.getGoalByIdAndUserId(id, userId);
            if (updatedGoalOpt.isPresent()) {
                Goal updatedGoal = updatedGoalOpt.get();
                Map<String, Object> goalInfo = new HashMap<>();
                goalInfo.put("id", updatedGoal.getId());
                goalInfo.put("name", updatedGoal.getName());
                goalInfo.put("currentAmount", updatedGoal.getCurrentAmount());
                goalInfo.put("targetAmount", updatedGoal.getTargetAmount());
                goalInfo.put("progress", updatedGoal.getProgress());
                goalInfo.put("remainingAmount", updatedGoal.getRemainingAmount());
                goalInfo.put("status", updatedGoal.getStatus());
                goalInfo.put("projectedCompletionDate", updatedGoal.getProjectedCompletionDate());
                goalInfo.put("daysRemaining", updatedGoal.getDaysRemaining());
                response.put("goal", goalInfo);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            
            if (e.getMessage().contains("not found")) {
                errorResponse.put("code", "GOAL_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            } else if (e.getMessage().contains("completed")) {
                errorResponse.put("code", "GOAL_ALREADY_COMPLETED");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            } else if (e.getMessage().contains("exceeds target")) {
                errorResponse.put("code", "GOAL_CONTRIBUTION_EXCEEDS_TARGET");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            errorResponse.put("code", "CONTRIBUTION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to add contribution: " + e.getMessage());
            errorResponse.put("code", "CONTRIBUTION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/{id}/contributions")
    public ResponseEntity<?> getGoalContributions(@RequestHeader("Authorization") String authorizationHeader,
                                                 @PathVariable Long id,
                                                 @RequestParam(required = false, defaultValue = "1") int page,
                                                 @RequestParam(required = false, defaultValue = "20") int limit,
                                                 @RequestParam(required = false) String sortBy,
                                                 @RequestParam(required = false, defaultValue = "desc") String sortOrder,
                                                 @RequestParam(required = false) String source,
                                                 @RequestParam(required = false) String startDate,
                                                 @RequestParam(required = false) String endDate,
                                                 @RequestParam(required = false) String minAmount,
                                                 @RequestParam(required = false) String maxAmount) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;
            BigDecimal min = minAmount != null ? new BigDecimal(minAmount) : null;
            BigDecimal max = maxAmount != null ? new BigDecimal(maxAmount) : null;
            
            Page<GoalContribution> contributionsPage = goalService.getGoalContributions(
                id, userId, source, start, end, min, max, sortBy, sortOrder, page, limit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("contributions", contributionsPage.getContent());
            
            // Pagination info
            Map<String, Object> pagination = new HashMap<>();
            pagination.put("currentPage", contributionsPage.getNumber() + 1);
            pagination.put("totalPages", contributionsPage.getTotalPages());
            pagination.put("totalItems", contributionsPage.getTotalElements());
            pagination.put("itemsPerPage", contributionsPage.getSize());
            pagination.put("hasNextPage", contributionsPage.hasNext());
            pagination.put("hasPrevPage", contributionsPage.hasPrevious());
            response.put("pagination", pagination);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve contributions: " + e.getMessage());
            errorResponse.put("code", "CONTRIBUTIONS_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}/contributions/{contributionId}")
    public ResponseEntity<?> updateContribution(@RequestHeader("Authorization") String authorizationHeader,
                                               @PathVariable Long id,
                                               @PathVariable Long contributionId,
                                               @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            String source = (String) requestBody.get("source");
            String notes = (String) requestBody.get("notes");
            
            GoalContribution contribution = goalService.updateContribution(id, contributionId, source, notes, userId);
            return ResponseEntity.ok(contribution);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            
            if (e.getMessage().contains("not found")) {
                errorResponse.put("code", "CONTRIBUTION_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            errorResponse.put("code", "CONTRIBUTION_UPDATE_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to update contribution: " + e.getMessage());
            errorResponse.put("code", "CONTRIBUTION_UPDATE_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}/contributions/{contributionId}")
    public ResponseEntity<?> deleteContribution(@RequestHeader("Authorization") String authorizationHeader,
                                               @PathVariable Long id,
                                               @PathVariable Long contributionId) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            goalService.deleteContribution(id, contributionId, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Contribution removed successfully");
            
            // Include updated goal information
            Optional<Goal> updatedGoalOpt = goalService.getGoalByIdAndUserId(id, userId);
            if (updatedGoalOpt.isPresent()) {
                Goal updatedGoal = updatedGoalOpt.get();
                Map<String, Object> goalInfo = new HashMap<>();
                goalInfo.put("id", updatedGoal.getId());
                goalInfo.put("name", updatedGoal.getName());
                goalInfo.put("currentAmount", updatedGoal.getCurrentAmount());
                goalInfo.put("targetAmount", updatedGoal.getTargetAmount());
                goalInfo.put("progress", updatedGoal.getProgress());
                goalInfo.put("remainingAmount", updatedGoal.getRemainingAmount());
                goalInfo.put("updatedAt", updatedGoal.getUpdatedAt());
                response.put("goal", goalInfo);
            }
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            
            if (e.getMessage().contains("not found")) {
                errorResponse.put("code", "CONTRIBUTION_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            errorResponse.put("code", "CONTRIBUTION_DELETION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to delete contribution: " + e.getMessage());
            errorResponse.put("code", "CONTRIBUTION_DELETION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getGoalSummary(@RequestHeader("Authorization") String authorizationHeader,
                                          @RequestParam(required = false, defaultValue = "all") String period,
                                          @RequestParam(required = false) String startDate,
                                          @RequestParam(required = false) String endDate,
                                          @RequestParam(required = false, defaultValue = "true") boolean includeCompleted) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;
            
            Map<String, Object> summary = goalService.getGoalSummary(userId, period, start, end);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve goal summary: " + e.getMessage());
            errorResponse.put("code", "SUMMARY_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getGoalCategories() {
        try {
            List<Map<String, Object>> categories = goalService.getGoalCategories();
            Map<String, Object> response = new HashMap<>();
            response.put("categories", categories);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve categories: " + e.getMessage());
            errorResponse.put("code", "CATEGORIES_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/bulk-contribute")
    public ResponseEntity<?> addBulkContribution(@RequestHeader("Authorization") String authorizationHeader,
                                                @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            // Validate required fields
            if (!requestBody.containsKey("totalAmount") || !requestBody.containsKey("source") ||
                !requestBody.containsKey("distributions")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Missing required fields: totalAmount, source, distributions");
                errorResponse.put("code", "MISSING_REQUIRED_FIELDS");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            BigDecimal totalAmount = new BigDecimal(requestBody.get("totalAmount").toString());
            String source = (String) requestBody.get("source");
            LocalDate date = requestBody.containsKey("date") ? 
                LocalDate.parse((String) requestBody.get("date")) : LocalDate.now();
            String notes = (String) requestBody.get("notes");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> distributions = (List<Map<String, Object>>) requestBody.get("distributions");
            
            Map<String, Object> result = goalService.addBulkContribution(userId, totalAmount, source, date, notes, distributions);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            
            if (e.getMessage().contains("doesn't match")) {
                errorResponse.put("code", "BULK_CONTRIBUTION_MISMATCH");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            errorResponse.put("code", "BULK_CONTRIBUTION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to process bulk contribution: " + e.getMessage());
            errorResponse.put("code", "BULK_CONTRIBUTION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getGoalAnalytics(@RequestHeader("Authorization") String authorizationHeader,
                                             @RequestParam(required = false) String startDate,
                                             @RequestParam(required = false) String endDate) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusYears(1);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
            
            Map<String, Object> analytics = goalService.getGoalAnalytics(userId, start, end);
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve analytics: " + e.getMessage());
            errorResponse.put("code", "ANALYTICS_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateGoalStatus(@RequestHeader("Authorization") String authorizationHeader,
                                             @PathVariable Long id,
                                             @RequestBody Map<String, Object> requestBody) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            if (!requestBody.containsKey("status")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Status field is required");
                errorResponse.put("code", "MISSING_STATUS_FIELD");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            String newStatus = (String) requestBody.get("status");
            String reason = (String) requestBody.get("reason");
            
            Goal updatedGoal = goalService.updateGoalStatus(id, newStatus, reason, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Goal status updated successfully");
            response.put("goal", buildGoalResponse(updatedGoal));
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            
            if (e.getMessage().contains("not found")) {
                errorResponse.put("code", "GOAL_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            } else if (e.getMessage().contains("Invalid status")) {
                errorResponse.put("code", "INVALID_STATUS");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            errorResponse.put("code", "STATUS_UPDATE_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to update goal status: " + e.getMessage());
            errorResponse.put("code", "STATUS_UPDATE_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Helper method to build goal response with computed properties
    private Map<String, Object> buildGoalResponse(Goal goal) {
        Map<String, Object> goalMap = new HashMap<>();
        goalMap.put("id", goal.getId());
        goalMap.put("name", goal.getName());
        goalMap.put("description", goal.getDescription());
        goalMap.put("targetAmount", goal.getTargetAmount());
        goalMap.put("currentAmount", goal.getCurrentAmount());
        goalMap.put("targetDate", goal.getTargetDate());
        goalMap.put("icon", goal.getIcon());
        goalMap.put("status", goal.getStatus());
        goalMap.put("priority", goal.getPriority());
        goalMap.put("category", goal.getCategory());
        goalMap.put("tags", goal.getTagsList());
        goalMap.put("createdAt", goal.getCreatedAt());
        goalMap.put("updatedAt", goal.getUpdatedAt());
        
        // Computed properties
        goalMap.put("progress", goal.getProgress());
        goalMap.put("remainingAmount", goal.getRemainingAmount());
        goalMap.put("daysRemaining", goal.getDaysRemaining());
        goalMap.put("dailyTargetAmount", goal.getDailyTargetAmount());
        goalMap.put("weeklyTargetAmount", goal.getWeeklyTargetAmount());
        goalMap.put("monthlyTargetAmount", goal.getMonthlyTargetAmount());
        goalMap.put("isOverdue", goal.getIsOverdue());
        goalMap.put("isCompleted", goal.getIsCompleted());
        goalMap.put("projectedCompletionDate", goal.getProjectedCompletionDate());
        goalMap.put("onTrack", goal.getOnTrack());
        
        return goalMap;
    }
}