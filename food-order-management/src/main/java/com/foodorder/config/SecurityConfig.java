package com.foodorder.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.foodorder.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =====================================================
                // CORS
                // =====================================================

                .cors(cors -> {})

                // =====================================================
                // CSRF
                // =====================================================
                // Disabled because this application uses
                // JWT-based authentication instead of sessions.

                .csrf(csrf -> csrf.disable())

                // =====================================================
                // SESSION MANAGEMENT
                // =====================================================
                // JWT authentication is stateless.
                // Server does not maintain login sessions.

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =====================================================
                // AUTHORIZATION RULES
                // =====================================================

                .authorizeHttpRequests(auth -> auth

                        // -------------------------------------------------
                        // CORS PREFLIGHT
                        // -------------------------------------------------
                        // Browser sends OPTIONS before requests containing
                        // Authorization header.

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // AUTHENTICATION ENDPOINTS
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        // -------------------------------------------------
                        // SWAGGER
                        // -------------------------------------------------

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // CUSTOMER DELETE
                        // ADMIN ONLY
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/customers/**"
                        ).hasRole("ADMIN")

                        // -------------------------------------------------
                        // FOOD ITEM DELETE
                        // ADMIN ONLY
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/food-items/**"
                        ).hasRole("ADMIN")

                        // -------------------------------------------------
                        // ORDER DELETE
                        // ADMIN ONLY
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/orders/**"
                        ).hasRole("ADMIN")

                        // -------------------------------------------------
                        // ALL OTHER API REQUESTS
                        // LOGIN REQUIRED
                        // -------------------------------------------------

                        .anyRequest().authenticated()
                )

                // =====================================================
                // JWT FILTER
                // =====================================================
                // Run our JWT filter before Spring Security's
                // UsernamePasswordAuthenticationFilter.

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}