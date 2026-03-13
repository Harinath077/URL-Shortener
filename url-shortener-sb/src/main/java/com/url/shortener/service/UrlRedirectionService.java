package com.url.shortener.service;

import com.url.shortener.exception.UrlNotFoundException;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UrlRedirectionService {

    private final UrlMappingRepository urlMappingRepository;
    private final AnalyticsService analyticsService;

    @Cacheable(value = "urls", key = "#shortUrl")
    public String getOriginalUrl(String shortUrl) {
        Optional<UrlMapping> mappingOptional = urlMappingRepository.findByShortUrl(shortUrl);
        
        if (mappingOptional.isPresent()) {
            UrlMapping mapping = mappingOptional.get();
            analyticsService.logClickEvent(mapping);
            return mapping.getOriginalUrl();
        }
        
        throw new UrlNotFoundException(shortUrl);
    }
}

