package com.example.moneymanager.services;

import com.example.moneymanager.models.User;
import com.example.moneymanager.models.UserSession;
import com.example.moneymanager.models.UserActivity;
import com.example.moneymanager.models.LoginHistory;
import com.example.moneymanager.repositories.UserRepository;
import com.example.moneymanager.repositories.UserSessionRepository;
import com.example.moneymanager.repositories.UserActivityRepository;
import com.example.moneymanager.repositories.LoginHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private UserActivityRepository userActivityRepository;

    @Autowired
    private LoginHistoryRepository loginHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Email validation pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRefreshToken(null); // Initialize refresh token as null

        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }

    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user;
    }

    public void storeRefreshToken(String email, String refreshToken) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.setRefreshToken(refreshToken);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public String getRefreshToken(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            return user.getRefreshToken();
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public void invalidateRefreshToken(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.setRefreshToken(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    // New Profile Management Methods
    
    @Transactional
    public User updateProfile(User user, Map<String, Object> updates, String ipAddress, String userAgent) {
        boolean profileUpdated = false;
        StringBuilder changes = new StringBuilder();

        if (updates.containsKey("name") && updates.get("name") != null) {
            String newName = updates.get("name").toString().trim();
            if (!newName.isEmpty() && !newName.equals(user.getFullName())) {
                user.setFullName(newName);
                changes.append("name, ");
                profileUpdated = true;
            }
        }

        if (updates.containsKey("email") && updates.get("email") != null) {
            String newEmail = updates.get("email").toString().trim().toLowerCase();
            if (!newEmail.equals(user.getEmail())) {
                if (!validateEmail(newEmail)) {
                    throw new RuntimeException("Invalid email format");
                }
                if (userRepository.findByEmail(newEmail) != null) {
                    throw new RuntimeException("Email already exists");
                }
                user.setEmail(newEmail);
                user.setEmailVerified(false); // Reset verification status
                changes.append("email, ");
                profileUpdated = true;
            }
        }

        if (updates.containsKey("phone")) {
            String newPhone = updates.get("phone") != null ? updates.get("phone").toString().trim() : null;
            if (!Objects.equals(newPhone, user.getPhone())) {
                user.setPhone(newPhone);
                changes.append("phone, ");
                profileUpdated = true;
            }
        }

        // Address updates
        Map<String, Object> address = (Map<String, Object>) updates.get("address");
        if (address != null) {
            if (updateAddressField(user, address, "street", user::getStreet, user::setStreet)) {
                changes.append("address, ");
                profileUpdated = true;
            }
            if (updateAddressField(user, address, "city", user::getCity, user::setCity)) {
                changes.append("city, ");
                profileUpdated = true;
            }
            if (updateAddressField(user, address, "state", user::getState, user::setState)) {
                changes.append("state, ");
                profileUpdated = true;
            }
            if (updateAddressField(user, address, "zipCode", user::getZipCode, user::setZipCode)) {
                changes.append("zipCode, ");
                profileUpdated = true;
            }
            if (updateAddressField(user, address, "country", user::getCountry, user::setCountry)) {
                changes.append("country, ");
                profileUpdated = true;
            }
        }

        if (profileUpdated) {
            User updatedUser = userRepository.save(user);
            
            // Log activity
            logActivity(user.getId(), "profile_updated", 
                "Updated profile information: " + changes.toString().replaceAll(", $", ""), 
                ipAddress, userAgent);
            
            return updatedUser;
        }

        return user;
    }

    private boolean updateAddressField(User user, Map<String, Object> address, String field, 
                                     java.util.function.Supplier<String> getter, 
                                     java.util.function.Consumer<String> setter) {
        if (address.containsKey(field)) {
            String newValue = address.get(field) != null ? address.get(field).toString().trim() : null;
            if (!Objects.equals(newValue, getter.get())) {
                setter.accept(newValue);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        Map<String, Object> validation = validatePasswordStrength(newPassword);
        if (!(Boolean) validation.get("valid")) {
            throw new RuntimeException("Password does not meet security requirements");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Log activity
        logActivity(userId, "password_changed", "Password was changed", ipAddress, userAgent);

        // Invalidate all sessions except current one
        userSessionRepository.deactivateOtherSessions(userId, "current_session");
    }

    @Transactional
    public void updatePreferences(Long userId, Map<String, Object> preferences, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        boolean updated = false;
        StringBuilder changes = new StringBuilder();

        if (preferences.containsKey("currency") && preferences.get("currency") != null) {
            String currency = preferences.get("currency").toString();
            if (!currency.equals(user.getCurrency())) {
                user.setCurrency(currency);
                changes.append("currency, ");
                updated = true;
            }
        }

        if (preferences.containsKey("timezone") && preferences.get("timezone") != null) {
            String timezone = preferences.get("timezone").toString();
            if (!timezone.equals(user.getTimezone())) {
                user.setTimezone(timezone);
                changes.append("timezone, ");
                updated = true;
            }
        }

        if (preferences.containsKey("theme") && preferences.get("theme") != null) {
            String theme = preferences.get("theme").toString();
            if (!theme.equals(user.getTheme())) {
                user.setTheme(theme);
                changes.append("theme, ");
                updated = true;
            }
        }

        if (preferences.containsKey("language") && preferences.get("language") != null) {
            String language = preferences.get("language").toString();
            if (!language.equals(user.getLanguage())) {
                user.setLanguage(language);
                changes.append("language, ");
                updated = true;
            }
        }

        if (preferences.containsKey("dateFormat") && preferences.get("dateFormat") != null) {
            String dateFormat = preferences.get("dateFormat").toString();
            if (!dateFormat.equals(user.getDateFormat())) {
                user.setDateFormat(dateFormat);
                changes.append("dateFormat, ");
                updated = true;
            }
        }

        // Notification preferences
        Map<String, Object> notifications = (Map<String, Object>) preferences.get("notifications");
        if (notifications != null) {
            if (updateBooleanPreference(notifications, "email", user.isEmailNotifications(), user::setEmailNotifications)) {
                changes.append("email notifications, ");
                updated = true;
            }
            if (updateBooleanPreference(notifications, "push", user.isPushNotifications(), user::setPushNotifications)) {
                changes.append("push notifications, ");
                updated = true;
            }
            if (updateBooleanPreference(notifications, "budgetAlerts", user.isBudgetAlerts(), user::setBudgetAlerts)) {
                changes.append("budget alerts, ");
                updated = true;
            }
            if (updateBooleanPreference(notifications, "goalReminders", user.isGoalReminders(), user::setGoalReminders)) {
                changes.append("goal reminders, ");
                updated = true;
            }
        }

        if (updated) {
            userRepository.save(user);
            logActivity(userId, "preferences_updated", 
                "Updated preferences: " + changes.toString().replaceAll(", $", ""), 
                ipAddress, userAgent);
        }
    }

    private boolean updateBooleanPreference(Map<String, Object> preferences, String key, 
                                          boolean currentValue, java.util.function.Consumer<Boolean> setter) {
        if (preferences.containsKey(key)) {
            boolean newValue = Boolean.parseBoolean(preferences.get(key).toString());
            if (newValue != currentValue) {
                setter.accept(newValue);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public void updatePrivacySettings(Long userId, Map<String, Object> privacy, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        boolean updated = false;
        StringBuilder changes = new StringBuilder();

        Map<String, Object> dataProcessing = (Map<String, Object>) privacy.get("dataProcessing");
        if (dataProcessing != null) {
            if (updateBooleanPreference(dataProcessing, "analytics", user.isAnalyticsEnabled(), user::setAnalyticsEnabled)) {
                changes.append("analytics, ");
                updated = true;
            }
            if (updateBooleanPreference(dataProcessing, "marketing", user.isMarketingEnabled(), user::setMarketingEnabled)) {
                changes.append("marketing, ");
                updated = true;
            }
            if (updateBooleanPreference(dataProcessing, "thirdParty", user.isThirdPartyEnabled(), user::setThirdPartyEnabled)) {
                changes.append("third party, ");
                updated = true;
            }
        }

        Map<String, Object> visibility = (Map<String, Object>) privacy.get("visibility");
        if (visibility != null) {
            if (updateBooleanPreference(visibility, "publicProfile", user.isPublicProfile(), user::setPublicProfile)) {
                changes.append("public profile, ");
                updated = true;
            }
            if (updateBooleanPreference(visibility, "shareTransactions", user.isShareTransactions(), user::setShareTransactions)) {
                changes.append("share transactions, ");
                updated = true;
            }
            if (updateBooleanPreference(visibility, "shareGoals", user.isShareGoals(), user::setShareGoals)) {
                changes.append("share goals, ");
                updated = true;
            }
        }

        Map<String, Object> communications = (Map<String, Object>) privacy.get("communications");
        if (communications != null) {
            if (updateBooleanPreference(communications, "newsletters", user.isNewslettersEnabled(), user::setNewslettersEnabled)) {
                changes.append("newsletters, ");
                updated = true;
            }
            if (updateBooleanPreference(communications, "productUpdates", user.isProductUpdatesEnabled(), user::setProductUpdatesEnabled)) {
                changes.append("product updates, ");
                updated = true;
            }
            if (updateBooleanPreference(communications, "surveyInvitations", user.isSurveyInvitationsEnabled(), user::setSurveyInvitationsEnabled)) {
                changes.append("survey invitations, ");
                updated = true;
            }
        }

        if (updated) {
            userRepository.save(user);
            logActivity(userId, "privacy_updated", 
                "Updated privacy settings: " + changes.toString().replaceAll(", $", ""), 
                ipAddress, userAgent);
        }
    }

    // Session management
    public UserSession createSession(Long userId, String sessionId, String deviceInfo, String ipAddress, String location) {
        UserSession session = new UserSession(sessionId, userId, deviceInfo, ipAddress, location);
        return userSessionRepository.save(session);
    }

    public List<UserSession> getActiveSessions(Long userId) {
        return userSessionRepository.findByUserIdAndActiveTrue(userId);
    }

    @Transactional
    public void revokeSession(String sessionId, Long userId, String ipAddress, String userAgent) {
        userSessionRepository.deactivateSession(sessionId);
        logActivity(userId, "session_revoked", "Session revoked: " + sessionId, ipAddress, userAgent);
    }

    @Transactional
    public int revokeAllOtherSessions(Long userId, String currentSessionId, String ipAddress, String userAgent) {
        List<UserSession> sessions = userSessionRepository.findByUserIdAndActiveTrue(userId);
        int revokedCount = 0;
        
        for (UserSession session : sessions) {
            if (!session.getSessionId().equals(currentSessionId)) {
                revokedCount++;
            }
        }
        
        userSessionRepository.deactivateOtherSessions(userId, currentSessionId);
        logActivity(userId, "all_sessions_revoked", "All other sessions revoked (" + revokedCount + " sessions)", ipAddress, userAgent);
        
        return revokedCount;
    }

    // Activity logging
    public void logActivity(Long userId, String action, String description, String ipAddress, String userAgent) {
        UserActivity activity = new UserActivity(userId, action, description, ipAddress, userAgent);
        userActivityRepository.save(activity);
    }

    public Page<UserActivity> getActivityLog(Long userId, int page, int limit, LocalDate startDate, LocalDate endDate, String action) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        
        if (startDate != null && endDate != null) {
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.atTime(23, 59, 59);
            return userActivityRepository.findByUserIdAndTimestampBetween(userId, start, end, pageable);
        } else if (action != null && !action.isEmpty()) {
            return userActivityRepository.findByUserIdAndAction(userId, action, pageable);
        } else {
            return userActivityRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        }
    }

    // Login history
    public void logLoginAttempt(Long userId, String ipAddress, String location, String device, boolean success, String failureReason) {
        LoginHistory loginHistory = new LoginHistory(userId, ipAddress, location, device, success, failureReason);
        loginHistoryRepository.save(loginHistory);
    }

    public Page<LoginHistory> getLoginHistory(Long userId, int page, int limit, LocalDate startDate, LocalDate endDate) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        
        if (startDate != null && endDate != null) {
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.atTime(23, 59, 59);
            return loginHistoryRepository.findByUserIdAndTimestampBetween(userId, start, end, pageable);
        } else {
            return loginHistoryRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        }
    }

    // 2FA methods
    @Transactional
    public List<String> enable2FA(Long userId, String secret, String backupCodesJson, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setTwoFactorEnabled(true);
        user.setTwoFactorSecret(secret);
        user.setBackupCodes(backupCodesJson);
        userRepository.save(user);

        logActivity(userId, "2fa_enabled", "Two-factor authentication enabled", ipAddress, userAgent);

        // Parse and return backup codes
        return Arrays.asList(backupCodesJson.split(","));
    }

    @Transactional
    public void disable2FA(Long userId, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setBackupCodes(null);
        userRepository.save(user);

        logActivity(userId, "2fa_disabled", "Two-factor authentication disabled", ipAddress, userAgent);
    }

    // Email verification
    @Transactional
    public void generateEmailVerificationToken(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        userRepository.save(user);

        // In a real application, send email here
    }

    @Transactional
    public void verifyEmail(String token, String ipAddress, String userAgent) {
        User user = userRepository.findByEmail(getCurrentUserEmail()); // You'll need to implement this
        if (user == null || !token.equals(user.getEmailVerificationToken())) {
            throw new RuntimeException("Invalid verification token");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);

        logActivity(user.getId(), "email_verified", "Email address verified", ipAddress, userAgent);
    }

    // Avatar management
    public String uploadAvatar(Long userId, MultipartFile file, String ipAddress, String userAgent) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/jpeg") && 
                                   !contentType.startsWith("image/png") && 
                                   !contentType.startsWith("image/gif"))) {
            throw new RuntimeException("Only JPEG, PNG, and GIF images are allowed");
        }

        // Validate file size (5MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size must be less than 5MB");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = "avatar_" + userId + "_" + System.currentTimeMillis() + extension;

        // Save file (in a real application, use cloud storage)
        Path uploadPath = Paths.get("uploads/avatars/");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        // Update user avatar
        String avatarUrl = "/uploads/avatars/" + filename;
        user.setAvatar(avatarUrl);
        userRepository.save(user);

        logActivity(userId, "avatar_uploaded", "Profile picture uploaded", ipAddress, userAgent);

        return avatarUrl;
    }

    @Transactional
    public void deleteAvatar(Long userId, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAvatar() != null) {
            // Delete file (in a real application, delete from cloud storage)
            try {
                Path filePath = Paths.get("." + user.getAvatar());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log error but don't fail the operation
            }

            user.setAvatar(null);
            userRepository.save(user);

            logActivity(userId, "avatar_deleted", "Profile picture removed", ipAddress, userAgent);
        }
    }

    // Validation methods
    public boolean validateEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public Map<String, Object> validatePasswordStrength(String password) {
        Map<String, Object> result = new HashMap<>();
        
        boolean hasLength = password != null && password.length() >= 8;
        boolean hasUpperCase = password != null && password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowerCase = password != null && password.chars().anyMatch(Character::isLowerCase);
        boolean hasNumbers = password != null && password.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = password != null && password.chars().anyMatch(ch -> "@$!%*?&".indexOf(ch) >= 0);
        
        boolean valid = hasLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
        
        result.put("valid", valid);
        result.put("length", hasLength);
        result.put("hasUpperCase", hasUpperCase);
        result.put("hasLowerCase", hasLowerCase);
        result.put("hasNumbers", hasNumbers);
        result.put("hasSpecialChar", hasSpecialChar);
        
        return result;
    }

    // Helper method (you'll need to implement this based on your JWT service)
    private String getCurrentUserEmail() {
        // This should extract email from current JWT token
        return "current_user@example.com"; // Placeholder
    }

    // Data export (simplified implementation)
    public byte[] exportUserData(Long userId, Map<String, Boolean> options) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // In a real implementation, you would:
        // 1. Gather all user data based on options
        // 2. Create JSON/CSV export
        // 3. Create ZIP file
        // 4. Return as byte array

        logActivity(userId, "data_exported", "User data exported", "system", "system");

        return "User data export placeholder".getBytes();
    }
}