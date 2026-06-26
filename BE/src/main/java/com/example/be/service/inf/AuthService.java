package com.example.be.service.inf;

import com.example.be.dto.request.LoginRequest;
import com.example.be.dto.request.RegisterRequest;
import com.example.be.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(String refreshToken);
}
