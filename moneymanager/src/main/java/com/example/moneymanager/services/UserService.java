package com.example.moneymanager.services;

import com.example.moneymanager.models.User;
import com.example.moneymanager.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
}