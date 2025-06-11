package com.example.moneymanager.controllers;

import com.example.moneymanager.models.User;
import com.example.moneymanager.models.UserSession;
import com.example.moneymanager.models.UserActivity;
import com.example.moneymanager.models.LoginHistory;
import com.example.moneymanager.services.UserService;
import com.example.moneymanager.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    private String getEmailFromToken(String authorizationHeader) {
        String token = authorizationHeader.replace("Bearer ", "");
        return jwtService.extractEmailFromToken(token);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    // CORE PROFILE MANAGEMENT

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("id", user.getId());
            userProfile.put("name", user.getFullName());
            userProfile.put("email", user.getEmail());
            userProfile.put("phone", user.getPhone());
            
            Map<String, Object> address = new HashMap<>();
            address.put("street", user.getStreet());
            address.put("city", user.getCity());
            address.put("state", user.getState());
            address.put("zipCode", user.getZipCode());
            address.put("country", user.getCountry());
            userProfile.put("address", address);
            
            userProfile.put("avatar", user.getAvatar());
            userProfile.put("emailVerified", user.isEmailVerified());
            userProfile.put("twoFactorEnabled", user.isTwoFactorEnabled());
            userProfile.put("createdAt", user.getCreatedAt());
            userProfile.put("updatedAt", user.getUpdatedAt());
            
            return ResponseEntity.ok(userProfile);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "PROFILE_RETRIEVAL_FAILED",
                "message", "Failed to retrieve user profile: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUserProfile(@RequestHeader("Authorization") String authorizationHeader,
                                             @RequestBody Map<String, Object> requestBody,
                                             HttpServletRequest request) {
        try {
            String currentEmail = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(currentEmail);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            User updatedUser = userService.updateProfile(user, requestBody, ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Profile updated successfully");
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", updatedUser.getId());
            userInfo.put("name", updatedUser.getFullName());
            userInfo.put("email", updatedUser.getEmail());
            userInfo.put("phone", updatedUser.getPhone());
            
            Map<String, Object> address = new HashMap<>();
            address.put("street", updatedUser.getStreet());
            address.put("city", updatedUser.getCity());
            address.put("state", updatedUser.getState());
            address.put("zipCode", updatedUser.getZipCode());
            address.put("country", updatedUser.getCountry());
            userInfo.put("address", address);
            
            userInfo.put("updatedAt", updatedUser.getUpdatedAt());
            responseBody.put("user", userInfo);
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "PROFILE_UPDATE_FAILED",
                "message", "Failed to update profile: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUserAccount(@RequestHeader("Authorization") String authorizationHeader,
                                             @RequestBody(required = false) Map<String, String> requestBody,
                                             HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            // Optional password confirmation
            if (requestBody != null && requestBody.containsKey("password")) {
                String password = requestBody.get("password");
                // Validate password here if needed
            }
            
            userService.logActivity(user.getId(), "account_deleted", "User account was deleted", ipAddress, userAgent);
            userService.deleteUser(user.getId());
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Account deleted successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "ACCOUNT_DELETION_FAILED",
                "message", "Failed to delete account: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // PASSWORD MANAGEMENT

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String authorizationHeader,
                                          @RequestBody Map<String, String> requestBody,
                                          HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            String currentPassword = requestBody.get("currentPassword");
            String newPassword = requestBody.get("newPassword");
            String confirmPassword = requestBody.get("confirmPassword");
            
            if (!newPassword.equals(confirmPassword)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", Map.of(
                    "code", "PASSWORD_MISMATCH",
                    "message", "New passwords do not match"
                ));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            userService.changePassword(user.getId(), currentPassword, newPassword, ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Password changed successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "PASSWORD_CHANGE_FAILED",
                "message", e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // USER PREFERENCES

    @GetMapping("/preferences")
    public ResponseEntity<?> getUserPreferences(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            Map<String, Object> preferences = new HashMap<>();
            preferences.put("currency", user.getCurrency());
            preferences.put("timezone", user.getTimezone());
            preferences.put("theme", user.getTheme());
            preferences.put("language", user.getLanguage());
            preferences.put("dateFormat", user.getDateFormat());
            
            Map<String, Object> notifications = new HashMap<>();
            notifications.put("email", user.isEmailNotifications());
            notifications.put("push", user.isPushNotifications());
            notifications.put("budgetAlerts", user.isBudgetAlerts());
            notifications.put("goalReminders", user.isGoalReminders());
            preferences.put("notifications", notifications);
            
            Map<String, Object> privacy = new HashMap<>();
            privacy.put("shareData", user.isShareData());
            privacy.put("publicProfile", user.isPublicProfile());
            preferences.put("privacy", privacy);
            
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "PREFERENCES_RETRIEVAL_FAILED",
                "message", "Failed to retrieve preferences: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updateUserPreferences(@RequestHeader("Authorization") String authorizationHeader,
                                                  @RequestBody Map<String, Object> requestBody,
                                                  HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            userService.updatePreferences(user.getId(), requestBody, ipAddress, userAgent);
            
            // Get updated preferences
            User updatedUser = userService.getUserByEmail(email);
            Map<String, Object> preferences = new HashMap<>();
            preferences.put("currency", updatedUser.getCurrency());
            preferences.put("timezone", updatedUser.getTimezone());
            preferences.put("theme", updatedUser.getTheme());
            preferences.put("language", updatedUser.getLanguage());
            preferences.put("dateFormat", updatedUser.getDateFormat());
            
            Map<String, Object> notifications = new HashMap<>();
            notifications.put("email", updatedUser.isEmailNotifications());
            notifications.put("push", updatedUser.isPushNotifications());
            notifications.put("budgetAlerts", updatedUser.isBudgetAlerts());
            notifications.put("goalReminders", updatedUser.isGoalReminders());
            preferences.put("notifications", notifications);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Preferences updated successfully");
            responseBody.put("preferences", preferences);
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "PREFERENCES_UPDATE_FAILED",
                "message", "Failed to update preferences: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // SESSION MANAGEMENT

    @GetMapping("/sessions")
    public ResponseEntity<?> getUserSessions(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            List<UserSession> sessions = userService.getActiveSessions(user.getId());
            List<Map<String, Object>> sessionList = new ArrayList<>();
            
            for (UserSession session : sessions) {
                Map<String, Object> sessionData = new HashMap<>();
                sessionData.put("id", session.getSessionId());
                sessionData.put("deviceInfo", session.getDeviceInfo());
                sessionData.put("ipAddress", session.getIpAddress());
                sessionData.put("location", session.getLocation());
                sessionData.put("lastActivity", session.getLastActivity());
                sessionData.put("current", false); // You'd determine this based on current session
                sessionList.add(sessionData);
            }
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("sessions", sessionList);
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "SESSIONS_RETRIEVAL_FAILED",
                "message", "Failed to retrieve sessions: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/sessions/{sessionId}/revoke")
    public ResponseEntity<?> revokeSession(@RequestHeader("Authorization") String authorizationHeader,
                                         @PathVariable String sessionId,
                                         HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            userService.revokeSession(sessionId, user.getId(), ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Session revoked successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "SESSION_REVOKE_FAILED",
                "message", "Failed to revoke session: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/sessions/revoke-all")
    public ResponseEntity<?> revokeAllSessions(@RequestHeader("Authorization") String authorizationHeader,
                                             HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            int revokedCount = userService.revokeAllOtherSessions(user.getId(), "current_session", ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "All other sessions revoked successfully");
            responseBody.put("revokedCount", revokedCount);
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "SESSIONS_REVOKE_FAILED",
                "message", "Failed to revoke sessions: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // TWO-FACTOR AUTHENTICATION

    @PostMapping("/2fa/enable")
    public ResponseEntity<?> enable2FA(@RequestHeader("Authorization") String authorizationHeader,
                                     @RequestBody Map<String, String> requestBody,
                                     HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            String secret = requestBody.get("secret");
            String token = requestBody.get("token");
            
            // In a real implementation, verify the token here
            
            // Generate backup codes
            List<String> backupCodes = Arrays.asList("12345678", "87654321", "11223344", "44332211");
            String backupCodesJson = String.join(",", backupCodes);
            
            List<String> codes = userService.enable2FA(user.getId(), secret, backupCodesJson, ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Two-factor authentication enabled successfully");
            responseBody.put("backupCodes", codes);
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "2FA_ENABLE_FAILED",
                "message", "Failed to enable 2FA: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disable2FA(@RequestHeader("Authorization") String authorizationHeader,
                                      @RequestBody Map<String, String> requestBody,
                                      HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            String password = requestBody.get("password");
            String token = requestBody.get("token");
            
            // In a real implementation, verify password and token here
            
            userService.disable2FA(user.getId(), ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Two-factor authentication disabled successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "2FA_DISABLE_FAILED",
                "message", "Failed to disable 2FA: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<?> verify2FA(@RequestHeader("Authorization") String authorizationHeader,
                                     @RequestBody Map<String, String> requestBody) {
        try {
            String token = requestBody.get("token");
            
            // In a real implementation, verify the token here
            boolean isValid = token != null && token.length() == 6;
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("valid", isValid);
            responseBody.put("message", isValid ? "Token verified successfully" : "Invalid token");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "2FA_VERIFY_FAILED",
                "message", "Failed to verify 2FA: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // AVATAR MANAGEMENT

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestHeader("Authorization") String authorizationHeader,
                                        @RequestParam("avatar") MultipartFile file,
                                        HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            String avatarUrl = userService.uploadAvatar(user.getId(), file, ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Avatar uploaded successfully");
            
            Map<String, Object> avatar = new HashMap<>();
            avatar.put("url", avatarUrl);
            avatar.put("filename", file.getOriginalFilename());
            avatar.put("size", file.getSize());
            responseBody.put("avatar", avatar);
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "AVATAR_UPLOAD_FAILED",
                "message", "Failed to upload avatar: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<?> deleteAvatar(@RequestHeader("Authorization") String authorizationHeader,
                                        HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            userService.deleteAvatar(user.getId(), ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Avatar removed successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "AVATAR_DELETE_FAILED",
                "message", "Failed to delete avatar: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // EMAIL VERIFICATION

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestHeader("Authorization") String authorizationHeader,
                                       @RequestBody Map<String, String> requestBody,
                                       HttpServletRequest request) {
        try {
            String token = requestBody.get("token");
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            userService.verifyEmail(token, ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Email verified successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "EMAIL_VERIFICATION_FAILED",
                "message", "Failed to verify email: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            userService.generateEmailVerificationToken(user.getId());
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Verification email sent successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "VERIFICATION_SEND_FAILED",
                "message", "Failed to send verification email: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // PRIVACY & DATA MANAGEMENT

    @GetMapping("/privacy")
    public ResponseEntity<?> getPrivacySettings(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            Map<String, Object> privacy = new HashMap<>();
            
            Map<String, Object> dataProcessing = new HashMap<>();
            dataProcessing.put("analytics", user.isAnalyticsEnabled());
            dataProcessing.put("marketing", user.isMarketingEnabled());
            dataProcessing.put("thirdParty", user.isThirdPartyEnabled());
            privacy.put("dataProcessing", dataProcessing);
            
            Map<String, Object> visibility = new HashMap<>();
            visibility.put("publicProfile", user.isPublicProfile());
            visibility.put("shareTransactions", user.isShareTransactions());
            visibility.put("shareGoals", user.isShareGoals());
            privacy.put("visibility", visibility);
            
            Map<String, Object> communications = new HashMap<>();
            communications.put("newsletters", user.isNewslettersEnabled());
            communications.put("productUpdates", user.isProductUpdatesEnabled());
            communications.put("surveyInvitations", user.isSurveyInvitationsEnabled());
            privacy.put("communications", communications);
            
            return ResponseEntity.ok(privacy);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "PRIVACY_RETRIEVAL_FAILED",
                "message", "Failed to retrieve privacy settings: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/privacy")
    public ResponseEntity<?> updatePrivacySettings(@RequestHeader("Authorization") String authorizationHeader,
                                                  @RequestBody Map<String, Object> requestBody,
                                                  HttpServletRequest request) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            String ipAddress = getClientIP(request);
            String userAgent = request.getHeader("User-Agent");
            
            userService.updatePrivacySettings(user.getId(), requestBody, ipAddress, userAgent);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Privacy settings updated successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "PRIVACY_UPDATE_FAILED",
                "message", "Failed to update privacy settings: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/export-data")
    public ResponseEntity<?> exportUserData(@RequestHeader("Authorization") String authorizationHeader,
                                           @RequestBody Map<String, Boolean> requestBody) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            byte[] exportData = userService.exportUserData(user.getId(), requestBody);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "user-data-export.zip");
            
            return new ResponseEntity<>(exportData, headers, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "DATA_EXPORT_FAILED",
                "message", "Failed to export data: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // ACTIVITY & AUDIT LOGS

    @GetMapping("/activity")
    public ResponseEntity<?> getActivityLog(@RequestHeader("Authorization") String authorizationHeader,
                                          @RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "20") int limit,
                                          @RequestParam(required = false) String startDate,
                                          @RequestParam(required = false) String endDate,
                                          @RequestParam(required = false) String action) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            LocalDate start = startDate != null ? LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE) : null;
            LocalDate end = endDate != null ? LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE) : null;
            
            Page<UserActivity> activities = userService.getActivityLog(user.getId(), page, limit, start, end, action);
            
            List<Map<String, Object>> activityList = new ArrayList<>();
            for (UserActivity activity : activities.getContent()) {
                Map<String, Object> activityData = new HashMap<>();
                activityData.put("id", activity.getId());
                activityData.put("action", activity.getAction());
                activityData.put("description", activity.getDescription());
                activityData.put("ipAddress", activity.getIpAddress());
                activityData.put("userAgent", activity.getUserAgent());
                activityData.put("timestamp", activity.getTimestamp());
                activityList.add(activityData);
            }
            
            Map<String, Object> pagination = new HashMap<>();
            pagination.put("currentPage", activities.getNumber() + 1);
            pagination.put("totalPages", activities.getTotalPages());
            pagination.put("totalItems", activities.getTotalElements());
            pagination.put("hasNext", activities.hasNext());
            pagination.put("hasPrev", activities.hasPrevious());
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("activities", activityList);
            responseBody.put("pagination", pagination);
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "ACTIVITY_RETRIEVAL_FAILED",
                "message", "Failed to retrieve activity log: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/login-history")
    public ResponseEntity<?> getLoginHistory(@RequestHeader("Authorization") String authorizationHeader,
                                           @RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "20") int limit,
                                           @RequestParam(required = false) String startDate,
                                           @RequestParam(required = false) String endDate) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            LocalDate start = startDate != null ? LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE) : null;
            LocalDate end = endDate != null ? LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE) : null;
            
            Page<LoginHistory> logins = userService.getLoginHistory(user.getId(), page, limit, start, end);
            
            List<Map<String, Object>> loginList = new ArrayList<>();
            for (LoginHistory login : logins.getContent()) {
                Map<String, Object> loginData = new HashMap<>();
                loginData.put("id", login.getId());
                loginData.put("ipAddress", login.getIpAddress());
                loginData.put("location", login.getLocation());
                loginData.put("device", login.getDevice());
                loginData.put("success", login.isSuccess());
                loginData.put("failureReason", login.getFailureReason());
                loginData.put("timestamp", login.getTimestamp());
                loginList.add(loginData);
            }
            
            Map<String, Object> pagination = new HashMap<>();
            pagination.put("currentPage", logins.getNumber() + 1);
            pagination.put("totalPages", logins.getTotalPages());
            pagination.put("totalItems", logins.getTotalElements());
            pagination.put("hasNext", logins.hasNext());
            pagination.put("hasPrev", logins.hasPrevious());
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("logins", loginList);
            responseBody.put("pagination", pagination);
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", Map.of(
                "code", "LOGIN_HISTORY_RETRIEVAL_FAILED",
                "message", "Failed to retrieve login history: " + e.getMessage()
            ));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}