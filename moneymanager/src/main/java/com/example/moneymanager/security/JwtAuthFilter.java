package com.example.moneymanager.security;

import com.example.moneymanager.services.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationCacheService cacheService;

    public JwtAuthFilter(JwtService jwtService, CustomUserDetailsService userDetailsService, 
                         AuthenticationCacheService cacheService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.cacheService = cacheService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;


        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Try to get cached JWT claims first
                CachedJwtClaims cachedClaims = cacheService.getCachedJwtClaims(token);
                String email;
                
                if (cachedClaims != null) {
                    // Use cached claims
                    email = cachedClaims.getEmail();
                } else {
                    // Parse JWT and cache the claims
                    Claims claims = jwtService.extractClaims(token);
                    email = claims.getSubject();
                    
                    // Cache the claims for future use
                    cachedClaims = new CachedJwtClaims(claims, token);
                    cacheService.cacheJwtClaims(token, cachedClaims);
                }

                // Load user details (this will use the user cache we implemented earlier)
                var userDetails = userDetailsService.loadUserByUsername(email);

                var authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (Exception e) {
                // Invalid token: skip setting security context
                // Also remove any cached data for this token
                cacheService.invalidateTokenCache(token);
            }
        }

        filterChain.doFilter(request, response);
    }
}
