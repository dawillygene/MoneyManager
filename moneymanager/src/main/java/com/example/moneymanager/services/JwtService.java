package com.example.moneymanager.services;

import com.example.moneymanager.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    @Value("${app.jwt.secret}")
    private String secretKey;

    private long accessTokenValidity = 900000; // 15 minutes (15 * 60 * 1000)
    private long refreshTokenValidity = 604800000; // 7 days

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        String token = Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId().toString())
                .claim("name", user.getFullName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenValidity))
                .signWith(getSigningKey())
                .compact();
        System.out.println("Generated Access Token: " + token);
        return token;
    }

    public String generateRefreshToken(User user) {
        String token = Jwts.builder()
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
                .signWith(getSigningKey())
                .compact();
        System.out.println("Generated Refresh Token: " + token);
        return token;
    }

    public Claims extractClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            System.out.println("Parsed Claims: " + claims);
            return claims;
        } catch (Exception e) {
            System.out.println("Error parsing token: " + e.getMessage());
            throw new RuntimeException("Invalid token", e);
        }
    }

    public String validateRefreshToken(String refreshToken) {
        try {
            Claims claims = extractClaims(refreshToken);
            String email = claims.getSubject();
            System.out.println("Validated Refresh Token for Email: " + email);
            return email;
        } catch (Exception e) {
            System.out.println("Error validating refresh token: " + e.getMessage());
            throw new RuntimeException("Invalid refresh token", e);
        }
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmailFromToken(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Invalid token", e);
        }
    }
}