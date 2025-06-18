package com.example.moneymanager.security;

import com.example.moneymanager.models.User;
import com.example.moneymanager.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AuthenticationCacheService cacheService;

    public CustomUserDetailsService(UserRepository userRepository, AuthenticationCacheService cacheService) {
        this.userRepository = userRepository;
        this.cacheService = cacheService;
    }

    // This method will be called automatically during login or token validation
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // First check cache
        CachedUserDetails cachedUserDetails = cacheService.getCachedUserDetails(email);
        if (cachedUserDetails != null) {
            return cachedUserDetails;
        }

        // If not in cache, load from database
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        // Create cached user details
        CachedUserDetails userDetails = new CachedUserDetails(
                user.getEmail(),
                user.getPassword(),
                user.getId(),
                user.getFullName(),
                Collections.emptyList() // No roles/authorities yet
        );

        // Cache the user details
        cacheService.cacheUserDetails(email, userDetails);

        return userDetails;
    }
}
