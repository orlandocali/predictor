package com.app.security;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    public String generateToken(String username) {
        // TODO: Implement token generation
        return "";
    }

    public boolean validateToken(String token) {
        // TODO: Implement token validation
        return false;
    }

    public String extractUsername(String token) {
        // TODO: Implement username extraction
        return "";
    }
}
