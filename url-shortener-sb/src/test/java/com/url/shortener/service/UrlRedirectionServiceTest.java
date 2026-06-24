package com.url.shortener.service;

import com.url.shortener.dto.CachedUrlData;
import com.url.shortener.exception.UrlExpiredException;
import com.url.shortener.exception.UrlNotFoundException;
import com.url.shortener.models.UrlMapping;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UrlRedirectionServiceTest {

    @Mock
    private UrlCacheService urlCacheService;

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private UrlRedirectionService urlRedirectionService;

    // ── getOriginalUrl ────────────────────────────────────────────

    @Test
    @DisplayName("getOriginalUrl: returns the correct original URL")
    void getOriginalUrl_returnsOriginalUrl() {
        CachedUrlData cached = new CachedUrlData(
                1L,
                "https://google.com",
                null
        );

        when(urlCacheService.fetchCachedData("abc")).thenReturn(cached);

        String result = urlRedirectionService.getOriginalUrl("abc");

        assertEquals("https://google.com", result);
    }

    @Test
    @DisplayName("getOriginalUrl: expired URL → throws UrlExpiredException and evicts cache")
    void getOriginalUrl_expiredUrl_throwsUrlExpiredException() {
        CachedUrlData cached = new CachedUrlData(
                1L,
                "https://google.com",
                LocalDateTime.now().minusDays(1)
        );

        when(urlCacheService.fetchCachedData("abc")).thenReturn(cached);

        assertThrows(UrlExpiredException.class,
                () -> urlRedirectionService.getOriginalUrl("abc"));

        verify(urlCacheService).evictCache("abc");
    }

    @Test
    @DisplayName("getOriginalUrl: URL not found → throws UrlNotFoundException")
    void getOriginalUrl_notFound_throwsUrlNotFoundException() {
        when(urlCacheService.fetchCachedData("missing"))
                .thenThrow(new UrlNotFoundException("missing"));

        assertThrows(UrlNotFoundException.class,
                () -> urlRedirectionService.getOriginalUrl("missing"));
    }

    @Test
    @DisplayName("getOriginalUrl: analytics is always called on every redirect")
    void getOriginalUrl_alwaysCallsAnalytics() {
        CachedUrlData cached = new CachedUrlData(
                1L,
                "https://www.google.com",
                null
        );

        when(urlCacheService.fetchCachedData("1")).thenReturn(cached);
        doNothing().when(analyticsService).logClickEvent(any(UrlMapping.class));

        urlRedirectionService.getOriginalUrl("1");

        verify(analyticsService).logClickEvent(any(UrlMapping.class));
    }

    @Test
    @DisplayName("getOriginalUrl: URL with future expiry is not treated as expired")
    void getOriginalUrl_futureExpiry_doesNotThrow() {
        CachedUrlData cached = new CachedUrlData(
                1L,
                "https://example.com",
                LocalDateTime.now().plusDays(7)
        );

        when(urlCacheService.fetchCachedData("xyz")).thenReturn(cached);

        assertDoesNotThrow(() -> urlRedirectionService.getOriginalUrl("xyz"));
    }
}
