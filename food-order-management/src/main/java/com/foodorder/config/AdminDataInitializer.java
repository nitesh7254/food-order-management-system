package com.foodorder.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.foodorder.entity.Role;
import com.foodorder.entity.User;
import com.foodorder.repository.UserRepository;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        String adminEmail = "admin@foodorder.com";
        String adminPassword = "Admin@123";

        // Check whether admin already exists
        if (userRepository.existsByEmail(adminEmail)) {
            System.out.println("Admin user already exists.");
            return;
        }

        // Create admin user
        User admin = new User();

        admin.setEmail(adminEmail);

        // Store encrypted password
        admin.setPassword(
                passwordEncoder.encode(adminPassword)
        );

        // Set ADMIN role
        admin.setRole(Role.ADMIN);

        // Save to database
        userRepository.save(admin);

        System.out.println("======================================");
        System.out.println("Initial ADMIN user created");
        System.out.println("Email: " + adminEmail);
        System.out.println("======================================");
    }
}