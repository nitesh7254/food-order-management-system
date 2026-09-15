package com.foodorder.service;

import com.foodorder.dto.AuthResponse;
import com.foodorder.dto.LoginRequest;
import com.foodorder.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}