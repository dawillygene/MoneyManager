package com.example.moneymanager.security;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Simple in-memory cache for JWT claims and user details to avoid repeated parsing and DB queries.
 * In production, consider using Redis or another distributed cache.
 */
@Service
public class AuthenticationCacheService {
    
    // Cache for JWT claims by token
    private final ConcurrentMap<String, CachedJwtClaims> jwtClaimsCache = new ConcurrentHashMap<>();
    
    // Cache for user details by email
    private final ConcurrentMap<String, CachedUserDetails> userDetailsCache = new ConcurrentHashMap<>();
    
    // Cache expiration time in milliseconds (5 minutes)
    private static final long CACHE_EXPIRATION_TIME = 5 * 60 * 1000;
    
    // Last cleanup time
    private volatile long lastCleanupTime = System.currentTimeMillis();
    
    /**
     * Get cached JWT claims for a token
     */
    public CachedJwtClaims getCachedJwtClaims(String token) {
        cleanupExpiredEntries();
        CachedJwtClaims claims = jwtClaimsCache.get(token);
        
        // Check if claims are still valid
        if (claims != null && !claims.isValid()) {
            jwtClaimsCache.remove(token);
            return null;
        }
        
        return claims;
    }
    
    /**
     * Cache JWT claims for a token
     */
    public void cacheJwtClaims(String token, CachedJwtClaims claims) {
        if (claims.isValid()) {
            jwtClaimsCache.put(token, claims);
        }
    }
    
    /**
     * Get cached user details by email
     */
    public CachedUserDetails getCachedUserDetails(String email) {
        cleanupExpiredEntries();
        return userDetailsCache.get(email);
    }
    
    /**
     * Cache user details by email
     */
    public void cacheUserDetails(String email, CachedUserDetails userDetails) {
        userDetailsCache.put(email, userDetails);
    }
    
    /**
     * Invalidate cache for a specific user (useful when user data changes)
     */
    public void invalidateUserCache(String email) {
        userDetailsCache.remove(email);
        
        // Also remove JWT claims for this user
        jwtClaimsCache.entrySet().removeIf(entry -> {
            CachedJwtClaims claims = entry.getValue();
            return claims.getEmail().equals(email);
        });
    }
    
    /**
     * Invalidate cache for a specific token
     */
    public void invalidateTokenCache(String token) {
        jwtClaimsCache.remove(token);
    }
    
    /**
     * Clear all caches
     */
    public void clearAllCaches() {
        jwtClaimsCache.clear();
        userDetailsCache.clear();
    }
    
    /**
     * Get cache statistics
     */
    public CacheStats getCacheStats() {
        return new CacheStats(jwtClaimsCache.size(), userDetailsCache.size());
    }
    
    /**
     * Cleanup expired entries periodically
     */
    private void cleanupExpiredEntries() {
        long currentTime = System.currentTimeMillis();
        
        // Only cleanup every minute to avoid excessive overhead
        if (currentTime - lastCleanupTime < 60_000) {
            return;
        }
        
        lastCleanupTime = currentTime;
        
        // Remove expired JWT claims
        jwtClaimsCache.entrySet().removeIf(entry -> !entry.getValue().isValid());
        
        // For user details, we'll keep them longer since they don't have expiration
        // You could implement a last-accessed timestamp if needed
    }
    
    /**
     * Cache statistics holder
     */
    public static class CacheStats {
        private final int jwtClaimsCacheSize;
        private final int userDetailsCacheSize;
        
        public CacheStats(int jwtClaimsCacheSize, int userDetailsCacheSize) {
            this.jwtClaimsCacheSize = jwtClaimsCacheSize;
            this.userDetailsCacheSize = userDetailsCacheSize;
        }
        
        public int getJwtClaimsCacheSize() {
            return jwtClaimsCacheSize;
        }
        
        public int getUserDetailsCacheSize() {
            return userDetailsCacheSize;
        }
        
        @Override
        public String toString() {
            return "CacheStats{" +
                    "jwtClaimsCacheSize=" + jwtClaimsCacheSize +
                    ", userDetailsCacheSize=" + userDetailsCacheSize +
                    '}';
        }
    }
}
