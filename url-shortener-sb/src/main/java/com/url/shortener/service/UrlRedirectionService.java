package com.url.shortener.service;

import com.url.shortener.dto.CachedUrlData;
import com.url.shortener.exception.UrlExpiredException;
import com.url.shortener.models.UrlMapping;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class UrlRedirectionService {

    private final UrlCacheService urlCacheService;
    private final AnalyticsService analyticsService;

    /**
     * Public entry point — always logs analytics regardless of cache.
     * Separating analytics from the cache ensures every redirect is counted,
     * even when the URL is returned from Redis cache.
     */
    public String getOriginalUrl(String shortUrl) {
        CachedUrlData cached = urlCacheService.fetchCachedData(shortUrl);

        if( cached.expireAt() != null && cached.expireAt().isBefore(LocalDateTime.now())){
            urlCacheService.evictCache(shortUrl);

            throw new UrlExpiredException(shortUrl);
        }
        UrlMapping shell = new UrlMapping();
        shell.setId(cached.id());

        analyticsService.logClickEvent(shell);

        return cached.originalUrl();
    }


}
