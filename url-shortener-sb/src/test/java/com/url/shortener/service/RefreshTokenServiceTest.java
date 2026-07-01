package com.url.shortener.service;

import com.url.shortener.models.RefreshToken;
import com.url.shortener.models.User;
import com.url.shortener.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@gmail.com");
    }

    @Test
    @DisplayName("createRefreshToken should save token with hash and return raw token")
    void createRefreshToken_success() {
        String rawToken = refreshTokenService.createRefreshToken(user);

        assertNotNull(rawToken);
        assertFalse(rawToken.isBlank());

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());

        RefreshToken savedToken = captor.getValue();
        assertEquals(user, savedToken.getUser());
        assertEquals(refreshTokenService.hashToken(rawToken), savedToken.getTokenHash());
        assertTrue(savedToken.getExpiryDate().isAfter(Instant.now()));
    }

    @Test
    @DisplayName("rotateToken should return new token and user, and delete old token")
    void rotateToken_success() {
        String oldRawToken = "old-raw-uuid-token";
        String oldHashedToken = refreshTokenService.hashToken(oldRawToken);

        RefreshToken oldToken = new RefreshToken();
        oldToken.setUser(user);
        oldToken.setTokenHash(oldHashedToken);
        oldToken.setExpiryDate(Instant.now().plusSeconds(60));

        when(refreshTokenRepository.findByTokenHash(oldHashedToken)).thenReturn(Optional.of(oldToken));

        RefreshTokenService.RotationResult result = refreshTokenService.rotateToken(oldRawToken);

        assertNotNull(result);
        assertEquals(user, result.user());
        assertNotNull(result.newRawToken());
        assertNotEquals(oldRawToken, result.newRawToken());

        verify(refreshTokenRepository).deleteByTokenHash(oldHashedToken);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("rotateToken should throw exception if token is expired")
    void rotateToken_expired() {
        String oldRawToken = "expired-token";
        String oldHashedToken = refreshTokenService.hashToken(oldRawToken);

        RefreshToken oldToken = new RefreshToken();
        oldToken.setUser(user);
        oldToken.setTokenHash(oldHashedToken);
        oldToken.setExpiryDate(Instant.now().minusSeconds(10));

        when(refreshTokenRepository.findByTokenHash(oldHashedToken)).thenReturn(Optional.of(oldToken));

        assertThrows(RuntimeException.class, () -> refreshTokenService.rotateToken(oldRawToken));
        verify(refreshTokenRepository).delete(oldToken);
        verify(refreshTokenRepository, never()).deleteByTokenHash(anyString());
    }

    @Test
    @DisplayName("rotateToken should throw exception if token is invalid")
    void rotateToken_invalid() {
        String invalidRawToken = "invalid-token";
        String invalidHashedToken = refreshTokenService.hashToken(invalidRawToken);

        when(refreshTokenRepository.findByTokenHash(invalidHashedToken)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> refreshTokenService.rotateToken(invalidRawToken));
        verify(refreshTokenRepository, never()).delete(any(RefreshToken.class));
        verify(refreshTokenRepository, never()).deleteByTokenHash(anyString());
    }

    @Test
    @DisplayName("revokeToken should delete token by hash")
    void revokeToken_success() {
        String rawToken = "revoke-me";
        String hashed = refreshTokenService.hashToken(rawToken);

        refreshTokenService.revokeToken(rawToken);

        verify(refreshTokenRepository).deleteByTokenHash(hashed);
    }

    @Test
    @DisplayName("revokeAllForUser should delete all tokens of user")
    void revokeAllForUser_success() {
        refreshTokenService.revokeAllForUser(user);

        verify(refreshTokenRepository).deleteByUser(user);
    }
}
