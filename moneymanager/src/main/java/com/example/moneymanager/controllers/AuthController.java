package com.example.moneymanager.controllers;

import com.example.moneymanager.models.User;
import com.example.moneymanager.services.JwtService;
import com.example.moneymanager.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> requestBody) {
        try {
            // Extract fields from request body
            String name = requestBody.get("name");
            String email = requestBody.get("email");
            String password = requestBody.get("password");
            String confirmPassword = requestBody.get("confirmPassword");

            if (!password.equals(confirmPassword)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Passwords do not match");
                errorResponse.put("code", "PASSWORD_MISMATCH");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Create User object
            User user = new User();
            user.setFullName(name);
            user.setEmail(email);
            user.setPassword(password);
            user.setConfirmPassword(confirmPassword);
            user.setAgreeToTerms(true);

            User registeredUser = userService.registerUser(user);
            String accessToken = jwtService.generateAccessToken(registeredUser);
            String refreshToken = jwtService.generateRefreshToken(registeredUser);

            // Store the refresh token securely on the server side
            userService.storeRefreshToken(registeredUser.getEmail(), refreshToken);

            // Set HTTP-only cookies
            HttpHeaders headers = new HttpHeaders();
            headers.add("Set-Cookie", "accessToken=" + accessToken + "; HttpOnly; Max-Age=900; Path=/; SameSite=Lax");
            headers.add("Set-Cookie", "refreshToken=" + refreshToken + "; HttpOnly; Max-Age=604800; Path=/; SameSite=Lax");

            // Prepare response body
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("accessToken", accessToken);
            responseBody.put("refreshToken", refreshToken);
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", registeredUser.getId());
            userInfo.put("email", registeredUser.getEmail());
            userInfo.put("name", registeredUser.getFullName());
            responseBody.put("user", userInfo);

            return new ResponseEntity<>(responseBody, headers, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("code", "REGISTRATION_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            User user = userService.loginUser(email, password);

            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Store the refresh token securely on the server side
            userService.storeRefreshToken(user.getEmail(), refreshToken);

            // Set HTTP-only cookies
            HttpHeaders headers = new HttpHeaders();
            headers.add("Set-Cookie", "accessToken=" + accessToken + "; HttpOnly; Max-Age=900; Path=/; SameSite=Lax");
            headers.add("Set-Cookie", "refreshToken=" + refreshToken + "; HttpOnly; Max-Age=604800; Path=/; SameSite=Lax");

            // Prepare response body
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("accessToken", accessToken);
            responseBody.put("refreshToken", refreshToken);
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("email", user.getEmail());
            userInfo.put("name", user.getFullName());
            responseBody.put("user", userInfo);

            return new ResponseEntity<>(responseBody, headers, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Invalid credentials");
            errorResponse.put("code", "INVALID_CREDENTIALS");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> requestBody) {
        try {
            String refreshToken = requestBody.get("refreshToken");
            
            if (refreshToken == null || refreshToken.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Refresh token is required");
                errorResponse.put("code", "MISSING_REFRESH_TOKEN");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String email = jwtService.validateRefreshToken(refreshToken);
            
            // Verify refresh token matches stored token
            String storedRefreshToken = userService.getRefreshToken(email);
            if (!refreshToken.equals(storedRefreshToken)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Invalid refresh token");
                errorResponse.put("code", "INVALID_REFRESH_TOKEN");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            User user = userService.getUserByEmail(email);

            // Generate new tokens
            String newAccessToken = jwtService.generateAccessToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            // Update the refresh token securely on the server side
            userService.storeRefreshToken(user.getEmail(), newRefreshToken);

            // Set HTTP-only cookies
            HttpHeaders headers = new HttpHeaders();
            headers.add("Set-Cookie", "accessToken=" + newAccessToken + "; HttpOnly; Max-Age=900; Path=/; SameSite=Lax");
            headers.add("Set-Cookie", "refreshToken=" + newRefreshToken + "; HttpOnly; Max-Age=604800; Path=/; SameSite=Lax");

            // Prepare response body
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("accessToken", newAccessToken);
            responseBody.put("refreshToken", newRefreshToken);

            return new ResponseEntity<>(responseBody, headers, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Invalid refresh token");
            errorResponse.put("code", "INVALID_REFRESH_TOKEN");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String accessToken = authorizationHeader.replace("Bearer ", "");
            String email = jwtService.extractEmailFromToken(accessToken);
            
            // Invalidate refresh token
            userService.invalidateRefreshToken(email);

            // Clear cookies
            HttpHeaders headers = new HttpHeaders();
            headers.add("Set-Cookie", "accessToken=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax");
            headers.add("Set-Cookie", "refreshToken=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax");

            return new ResponseEntity<>(headers, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Logout failed");
            errorResponse.put("code", "LOGOUT_FAILED");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        try {
            // Check if refresh token exists in cookies
            if (refreshToken == null || refreshToken.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "No refresh token found in cookies");
                errorResponse.put("code", "MISSING_REFRESH_TOKEN");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // Validate refresh token
            String email = jwtService.validateRefreshToken(refreshToken);
            
            // Verify refresh token matches stored token
            String storedRefreshToken = userService.getRefreshToken(email);
            if (!refreshToken.equals(storedRefreshToken)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", true);
                errorResponse.put("message", "Invalid refresh token");
                errorResponse.put("code", "INVALID_REFRESH_TOKEN");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            User user = userService.getUserByEmail(email);

            // Generate new access token
            String newAccessToken = jwtService.generateAccessToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            // Update the refresh token securely on the server side
            userService.storeRefreshToken(user.getEmail(), newRefreshToken);

            // Set new tokens in HTTP-only cookies
            HttpHeaders headers = new HttpHeaders();
            headers.add("Set-Cookie", "accessToken=" + newAccessToken + "; HttpOnly; Max-Age=900; Path=/; SameSite=Lax");
            headers.add("Set-Cookie", "refreshToken=" + newRefreshToken + "; HttpOnly; Max-Age=604800; Path=/; SameSite=Lax");

            // Prepare response body with new access token and user info
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("valid", true);
            responseBody.put("accessToken", newAccessToken);
            responseBody.put("refreshToken", newRefreshToken);
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("email", user.getEmail());
            userInfo.put("name", user.getFullName());
            responseBody.put("user", userInfo);

            return new ResponseEntity<>(responseBody, headers, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Token verification failed: " + e.getMessage());
            errorResponse.put("code", "VERIFICATION_FAILED");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
}