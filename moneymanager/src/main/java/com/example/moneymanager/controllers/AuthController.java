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
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (!user.getPassword().equals(user.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }

        User registeredUser = userService.registerUser(user);
        String accessToken = jwtService.generateAccessToken(registeredUser);
        String refreshToken = jwtService.generateRefreshToken(registeredUser);

        // Store the refresh token securely on the server side
        userService.storeRefreshToken(registeredUser.getEmail(), refreshToken);

        // Set HTTP-only cookies
        HttpHeaders headers = new HttpHeaders();
        headers.add("Set-Cookie", "accessToken=" + accessToken + "; HttpOnly; Max-Age=3600; Path=/");
        headers.add("Set-Cookie", "refreshToken=" + refreshToken + "; HttpOnly; Max-Age=604800; Path=/");

        return new ResponseEntity<>(headers, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        User user = userService.loginUser(email, password);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Store the refresh token securely on the server side
        userService.storeRefreshToken(user.getEmail(), refreshToken);

        // Set HTTP-only cookies
        HttpHeaders headers = new HttpHeaders();
        headers.add("Set-Cookie", "accessToken=" + accessToken + "; HttpOnly; Max-Age=3600; Path=/");
        headers.add("Set-Cookie", "refreshToken=" + refreshToken + "; HttpOnly; Max-Age=604800; Path=/");

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("name", user.getFullName());
        responseMap.put("email", user.getEmail());

        return new ResponseEntity<>(responseMap, headers, HttpStatus.OK);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@CookieValue("refreshToken") String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }

        String email = jwtService.validateRefreshToken(refreshToken);

        User user = userService.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }

        // Generate new tokens
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        // Update the refresh token securely on the server side
        userService.storeRefreshToken(user.getEmail(), newRefreshToken);

        // Set HTTP-only cookies
        HttpHeaders headers = new HttpHeaders();
        headers.add("Set-Cookie", "accessToken=" + newAccessToken + "; HttpOnly; Max-Age=3600; Path=/");
        headers.add("Set-Cookie", "refreshToken=" + newRefreshToken + "; HttpOnly; Max-Age=604800; Path=/");

        return new ResponseEntity<>(headers, HttpStatus.OK);
    }
}