package com.url.shortener.service;

import com.url.shortener.controller.UrlController;
import com.url.shortener.dto.CachedUrlData;
import com.url.shortener.exception.UrlExpiredException;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.UrlMappingRepository;
import com.url.shortener.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.cache.CacheManager;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.boot.test.mock.mockito.MockBean;

import java.security.Principal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {
        "spring.cache.type=simple"
})
@Transactional
class UrlCacheIntegrationTest {

    @Autowired
    private UrlRedirectionService urlRedirectionService;

    @Autowired
    private UrlController urlController;

    @Autowired
    private CacheManager cacheManager;

    @SpyBean
    private UrlMappingRepository urlMappingRepository;

    @MockBean
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Ensure cache is completely cleared before each test
        if (cacheManager.getCache("urls") != null) {
            cacheManager.getCache("urls").clear();
        }

        // Setup test user
        testUser = userRepository.findByUsername("testuser").orElseGet(() -> {
            User user = new User();
            user.setUsername("testuser");
            user.setEmail("testuser@example.com");
            user.setPassword("password");
            user.setRole("ROLE_USER");
            return userRepository.save(user);
        });
    }

    @Test
    @DisplayName("Cache Miss: First lookup queries the database and caches the result")
    void testCacheMiss() {
        UrlMapping mapping = new UrlMapping();
        mapping.setOriginalUrl("https://example.com");
        mapping.setShortUrl("missCode");
        mapping.setUser(testUser);
        mapping.setCreatedDate(LocalDateTime.now());
        urlMappingRepository.save(mapping);

        // Reset invocation counters on the spy bean
        reset(urlMappingRepository);

        // Lookup: Expect database query (cache miss)
        String originalUrl = urlRedirectionService.getOriginalUrl("missCode");
        assertEquals("https://example.com", originalUrl);
        verify(urlMappingRepository, times(1)).findByShortUrl("missCode");
    }

    @Test
    @DisplayName("Cache Hit: Subsequent lookup fetches from cache with zero database queries")
    void testCacheHit() {
        UrlMapping mapping = new UrlMapping();
        mapping.setOriginalUrl("https://example.com");
        mapping.setShortUrl("hitCode");
        mapping.setUser(testUser);
        mapping.setCreatedDate(LocalDateTime.now());
        urlMappingRepository.save(mapping);

        // Populate cache
        urlRedirectionService.getOriginalUrl("hitCode");

        // Reset invocation counters on the spy bean
        reset(urlMappingRepository);

        // Lookup again: Expect cache hit (no database query)
        String originalUrl = urlRedirectionService.getOriginalUrl("hitCode");
        assertEquals("https://example.com", originalUrl);
        verify(urlMappingRepository, never()).findByShortUrl("hitCode");
    }

    @Test
    @DisplayName("Cache Eviction on Delete: Deleting a URL via controller evicts it from the cache")
    void testCacheEvictionOnDelete() {
        UrlMapping mapping = new UrlMapping();
        mapping.setOriginalUrl("https://example.com");
        mapping.setShortUrl("deleteCode");
        mapping.setUser(testUser);
        mapping.setCreatedDate(LocalDateTime.now());
        urlMappingRepository.save(mapping);

        // Warm up cache
        urlRedirectionService.getOriginalUrl("deleteCode");
        assertNotNull(cacheManager.getCache("urls").get("deleteCode"));

        // Delete the URL via controller
        Principal principal = () -> "testuser";
        urlController.deleteUrl("deleteCode", principal);

        // Verify cache entry is evicted
        assertNull(cacheManager.getCache("urls").get("deleteCode"));
    }

    @Test
    @DisplayName("Cache Eviction on Expiry: Fetching an expired URL throws exception and evicts the entry")
    void testCacheEvictionOnExpiry() {
        UrlMapping mapping = new UrlMapping();
        mapping.setOriginalUrl("https://example.com");
        mapping.setShortUrl("expiredCode");
        mapping.setUser(testUser);
        mapping.setCreatedDate(LocalDateTime.now());
        mapping.setExpiresAt(LocalDateTime.now().minusDays(1)); // Expired yesterday
        urlMappingRepository.save(mapping);

        // Expect UrlExpiredException to be thrown
        assertThrows(UrlExpiredException.class, () -> urlRedirectionService.getOriginalUrl("expiredCode"));

        // Verify key is evicted
        assertNull(cacheManager.getCache("urls").get("expiredCode"));
    }
}
