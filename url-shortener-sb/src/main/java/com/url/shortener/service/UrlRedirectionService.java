package com.url.shortener.service;

import com.url.shortener.exception.UrlNotFoundException;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UrlRedirectionService {

    private final UrlMappingRepository urlMappingRepository;
    private final AnalyticsService analyticsService;

    /**
     * Public entry point — always logs analytics regardless of cache.
     * Separating analytics from the cache ensures every redirect is counted,
     * even when the URL is returned from Redis cache.
     */
    public String getOriginalUrl(String shortUrl) {
        // Step 1: URL lookup (cached in Redis)
        String originalUrl = fetchOriginalUrl(shortUrl);

        // Step 2: Analytics always runs — never skipped by cache
        UrlMapping mapping = urlMappingRepository.findByShortUrl(shortUrl)
                .orElseThrow(() -> new UrlNotFoundException(shortUrl));
        analyticsService.logClickEvent(mapping);

        return originalUrl;
    }

    /**
     * Cached URL lookup — only hits the DB on a cache miss.
     * Analytics is deliberately NOT called here so it isn't skipped on cache hits.
     */
    @Cacheable(value = "urls", key = "#shortUrl")
    public String fetchOriginalUrl(String shortUrl) {
        return urlMappingRepository.findByShortUrl(shortUrl)
                .map(UrlMapping::getOriginalUrl)
                .orElseThrow(() -> new UrlNotFoundException(shortUrl));
    }
}
