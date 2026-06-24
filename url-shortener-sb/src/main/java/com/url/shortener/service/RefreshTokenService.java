package com.url.shortener.service;

import com.url.shortener.models.RefreshToken;
import com.url.shortener.models.User;
import com.url.shortener.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public record RotationResult(String newRawToken, User user) {}

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    @Transactional
    public String createRefreshToken(User user) {
        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashToken(rawToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashedToken);
        refreshToken.setCreatedAt(Instant.now());
        refreshToken.setExpiryDate(Instant.now().plus(Duration.ofDays(7)));

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    @Transactional
    public RotationResult rotateToken(String rawToken) {
        String hashedToken = hashToken(rawToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token expired");
        }

        User user = token.getUser();

        // Delete the old token
        refreshTokenRepository.deleteByTokenHash(hashedToken);

        // Generate a new token
        String newRawToken = createRefreshToken(user);

        return new RotationResult(newRawToken, user);
    }

    @Transactional
    public void revokeToken(String rawToken) {
        String hashedToken = hashToken(rawToken);
        refreshTokenRepository.deleteByTokenHash(hashedToken);
    }

    @Transactional
    public void revokeAllForUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
