package com.app.service;

import com.app.dto.LoginRequest;
import com.app.dto.LoginResponse;
import com.app.dto.UserResponse;
import com.app.model.RefreshToken;
import com.app.model.User;
import com.app.repository.RefreshTokenRepository;
import com.app.repository.UserRepository;
import com.app.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String accessToken = jwtUtil.generateAccessToken(username, user.getRole().name());
        String refreshTokenValue = createRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpirationMs() / 1000)
                .user(UserResponse.from(user))
                .build();
    }

    public LoginResponse refresh(String refreshTokenValue) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (storedToken.isRevoked()) {
            throw new IllegalArgumentException("Refresh token has been revoked");
        }

        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new IllegalArgumentException("Refresh token has expired");
        }

        User user = userRepository.findByUsername(storedToken.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new IllegalArgumentException("User account is disabled");
        }

        refreshTokenRepository.delete(storedToken);
        String newRefreshTokenValue = createRefreshToken(user);
        String newAccessToken = jwtUtil.generateAccessToken(user.getUsername(), user.getRole().name());

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenValue)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpirationMs() / 1000)
                .user(UserResponse.from(user))
                .build();
    }

    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return UserResponse.from(user);
    }

    private String createRefreshToken(User user) {
        String tokenValue = jwtUtil.generateRefreshTokenValue();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .userId(user.getId())
                .username(user.getUsername())
                .expiresAt(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }
}