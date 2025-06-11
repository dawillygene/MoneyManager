package com.example.moneymanager.controllers;

import com.example.moneymanager.models.User;
import com.example.moneymanager.services.UserService;
import com.example.moneymanager.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("id", user.getId());
            userProfile.put("name", user.getFullName());
            userProfile.put("email", user.getEmail());
            
            return ResponseEntity.ok(userProfile);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to retrieve user profile");
            errorResponse.put("code", "PROFILE_RETRIEVAL_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUserProfile(@RequestHeader("Authorization") String authorizationHeader,
                                             @RequestBody Map<String, String> requestBody) {
        try {
            String currentEmail = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(currentEmail);
            
            String newName = requestBody.get("name");
            String newEmail = requestBody.get("email");
            
            if (newName != null && !newName.trim().isEmpty()) {
                user.setFullName(newName.trim());
            }
            
            if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equals(currentEmail)) {
                // Check if new email already exists
                try {
                    userService.getUserByEmail(newEmail);
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", true);
                    errorResponse.put("message", "Email already exists");
                    errorResponse.put("code", "EMAIL_ALREADY_EXISTS");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                } catch (RuntimeException e) {
                    // Email doesn't exist, safe to update
                    user.setEmail(newEmail.trim());
                }
            }
            
            User updatedUser = userService.updateUser(user);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("id", updatedUser.getId());
            responseBody.put("name", updatedUser.getFullName());
            responseBody.put("email", updatedUser.getEmail());
            responseBody.put("message", "Profile updated successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to update profile: " + e.getMessage());
            errorResponse.put("code", "PROFILE_UPDATE_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUserAccount(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String email = getEmailFromToken(authorizationHeader);
            User user = userService.getUserByEmail(email);
            
            userService.deleteUser(user.getId());
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("message", "Account deleted successfully");
            
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to delete account: " + e.getMessage());
            errorResponse.put("code", "ACCOUNT_DELETION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}