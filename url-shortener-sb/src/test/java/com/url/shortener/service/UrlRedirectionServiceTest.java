package com.url.shortener.service;

import com.url.shortener.exception.UrlNotFoundException;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.repository.UrlMappingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UrlRedirectionServiceTest {

    @Mock
    private UrlMappingRepository urlMappingRepository;

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private UrlRedirectionService urlRedirectionService;

    // ── fetchOriginalUrl (cached method) ─────────────────────────

    @Test
    @DisplayName("fetchOriginalUrl: cache miss → hits DB and returns URL")
    void fetchOriginalUrl_cacheMiss_returnsUrl() {
        UrlMapping mapping = new UrlMapping();
        mapping.setShortUrl("1");
        mapping.setOriginalUrl("https://www.google.com");

        when(urlMappingRepository.findByShortUrl("1")).thenReturn(Optional.of(mapping));

        String result = urlRedirectionService.fetchOriginalUrl("1");

        assertEquals("https://www.google.com", result);
        verify(urlMappingRepository).findByShortUrl("1");
    }

    @Test
    @DisplayName("fetchOriginalUrl: short code not found → throws UrlNotFoundException")
    void fetchOriginalUrl_notFound_throwsUrlNotFoundException() {
        when(urlMappingRepository.findByShortUrl("xyz")).thenReturn(Optional.empty());

        assertThrows(UrlNotFoundException.class,
                () -> urlRedirectionService.fetchOriginalUrl("xyz"));
    }

    // ── getOriginalUrl (public method, always calls analytics) ───

    @Test
    @DisplayName("getOriginalUrl: calls analytics on every redirect")
    void getOriginalUrl_alwaysCallsAnalytics() {
        UrlMapping mapping = new UrlMapping();
        mapping.setShortUrl("1");
        mapping.setOriginalUrl("https://www.google.com");
        mapping.setClickCount(0);

        when(urlMappingRepository.findByShortUrl("1")).thenReturn(Optional.of(mapping));
        doNothing().when(analyticsService).logClickEvent(any(UrlMapping.class));

        urlRedirectionService.getOriginalUrl("1");

        // Analytics must always be called — even if URL came from cache
        verify(analyticsService).logClickEvent(mapping);
    }

    @Test
    @DisplayName("getOriginalUrl: short code not found → throws UrlNotFoundException")
    void getOriginalUrl_notFound_throwsUrlNotFoundException() {
        when(urlMappingRepository.findByShortUrl("missing")).thenReturn(Optional.empty());

        assertThrows(UrlNotFoundException.class,
                () -> urlRedirectionService.getOriginalUrl("missing"));
    }

    @Test
    @DisplayName("getOriginalUrl: returns the correct original URL")
    void getOriginalUrl_returnsOriginalUrl() {
        UrlMapping mapping = new UrlMapping();
        mapping.setShortUrl("abc");
        mapping.setOriginalUrl("https://leetcode.com/u/Harinath_E07/");

        when(urlMappingRepository.findByShortUrl("abc")).thenReturn(Optional.of(mapping));

        String result = urlRedirectionService.getOriginalUrl("abc");

        assertEquals("https://leetcode.com/u/Harinath_E07/", result);
    }
}
