package com.ecomapi.controller;

import com.ecomapi.dto.LoginRequest;
import com.ecomapi.dto.LoginResponse;
import com.ecomapi.dto.RegisterRequest;
import com.ecomapi.dto.UserResponse;
import com.ecomapi.model.User;
import com.ecomapi.model.UserRole;
import com.ecomapi.repository.UserRepository;
import com.ecomapi.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        var user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("detail", "Invalid credentials"));
        }
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "_id", user.getId(),
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name()
            )
        ));
    }

    // POST /api/auth/admin/login
    // Matches original .NET AdminLoginAsync: finds user by email, checks role == ADMIN, verifies BCrypt password
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }

        var user = userRepository.findByEmail(request.getEmail().trim().toLowerCase()).orElse(null);

        // Must exist AND have ADMIN role AND have a password — mirrors .NET check exactly
        if (user == null || user.getRole() != UserRole.ADMIN || user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.status(401).body(Map.of("error", "Admin user not found or invalid credentials"));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Admin user not found or invalid credentials"));
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "_id", user.getId(),
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName() != null ? user.getName() : "",
                "role", user.getRole().name()
            )
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("detail", "Email already registered"));
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "_id", user.getId(),
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole().name()
            )
        ));
    }
}
