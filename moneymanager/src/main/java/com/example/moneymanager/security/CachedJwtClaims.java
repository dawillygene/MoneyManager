package com.example.moneymanager.security;

import io.jsonwebtoken.Claims;

/**
 * Cached JWT claims to avoid repeated parsing of the same token
 */
public class CachedJwtClaims {
    
    private final String email;
    private final Long userId;
    private final String fullName;
    private final long expirationTime;
    private final String originalToken;
    
    public CachedJwtClaims(Claims claims, String originalToken) {
        this.email = claims.getSubject();
        this.userId = Long.parseLong(claims.get("userId", String.class));
        this.fullName = claims.get("name", String.class);
        this.expirationTime = claims.getExpiration().getTime();
        this.originalToken = originalToken;
    }
    
    public boolean isValid() {
        return System.currentTimeMillis() < expirationTime;
    }
    
    public String getEmail() {
        return email;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public String getOriginalToken() {
        return originalToken;
    }
    
    public long getExpirationTime() {
        return expirationTime;
    }
}
