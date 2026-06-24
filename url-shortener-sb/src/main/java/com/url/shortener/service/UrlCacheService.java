package com.url.shortener.service;

import com.url.shortener.dto.CachedUrlData;
import com.url.shortener.exception.UrlNotFoundException;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UrlCacheService {
    private final UrlMappingRepository urlMappingRepository;

    /**
     * Fetch URL data from Redis
     * If cache miss ---> query DB and populate cache
     */

    @Cacheable(value = "urls", key = "#shortUrl")
    public CachedUrlData fetchCachedData(String shortUrl){

        return urlMappingRepository.findByShortUrl(shortUrl)
                .map(mapping -> new CachedUrlData(
                        mapping.getId(),
                        mapping.getOriginalUrl(),
                        mapping.getExpiresAt()
                ))
                .orElseThrow(() -> new UrlNotFoundException(shortUrl));

    }

    /**
     * Remove cache entry
     */
    @CacheEvict(value = "urls", key = "#shortUrl")
    public void evictCache(String shortUrl){
        // Spring handles cache removal automaticalyy
    }
}
