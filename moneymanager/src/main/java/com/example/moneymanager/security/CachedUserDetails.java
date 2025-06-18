package com.example.moneymanager.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Enhanced UserDetails implementation that includes cached user information
 * to avoid repeated database queries
 */
public class CachedUserDetails implements UserDetails {
    
    private final String email;
    private final String password;
    private final Long userId;
    private final String fullName;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean enabled;
    
    public CachedUserDetails(String email, String password, Long userId, String fullName) {
        this.email = email;
        this.password = password;
        this.userId = userId;
        this.fullName = fullName;
        this.authorities = Collections.emptyList(); // Can be expanded later
        this.enabled = true;
    }
    
    public CachedUserDetails(String email, String password, Long userId, String fullName,
                           Collection<? extends GrantedAuthority> authorities) {
        this.email = email;
        this.password = password;
        this.userId = userId;
        this.fullName = fullName;
        this.authorities = authorities;
        this.enabled = true;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    // Additional getters for cached information
    public String getEmail() {
        return email;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public String getFullName() {
        return fullName;
    }
}
