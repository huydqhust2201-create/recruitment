package com.example.be.service.impl;

import com.example.be.dto.request.LoginRequest;
import com.example.be.dto.request.RegisterRequest;
import com.example.be.dto.response.AuthResponse;
import com.example.be.entity.User;
import com.example.be.entity.enums.Role;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        // 1. Kiá»ƒm tra email Ä‘Ã£ tá»“n táº¡i chÆ°a
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng");
        }
        // 2. Táº¡o user má»›i
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : Role.CANDIDATE)
                .isVerified(false)
                .isActive(true)
                .build();

        // 3. LÆ°u vÃ o DB
        userRepository.save(user);

        // 4. Load UserDetails Ä‘á»ƒ táº¡o token
        UserDetails userDetails = userDetailsService
                .loadUserByUsername(user.getEmail());
        // 5. Táº¡o token
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // 6. Tráº£ vá» response
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // 1. XÃ¡c thá»±c email + password
        // Náº¿u sai â†’ AuthenticationManager tá»± throw exception
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Load user tá»« DB
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User khÃ´ng tá»“n táº¡i"));

        // 3. Load UserDetails Ä‘á»ƒ táº¡o token
        UserDetails userDetails = userDetailsService
                .loadUserByUsername(user.getEmail());

        // 4. Táº¡o token
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // 5. Tráº£ vá» response
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .build();
    }

    @Override
    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Refresh token không hợp lệ");
        }

        String email = jwtService.extractEmail(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Refresh token đã hết hạn hoặc không hợp lệ");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!user.isActive()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }

        String newAccessToken = jwtService.generateAccessToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .build();
    }
}
