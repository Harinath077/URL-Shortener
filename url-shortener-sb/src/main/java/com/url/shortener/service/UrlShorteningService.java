package com.url.shortener.service;

import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.UrlMappingRepository;
import com.url.shortener.util.Base62Encoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UrlShorteningService {

    private final UrlMappingRepository urlMappingRepository;
    private final Base62Encoder base62Encoder;

    @Transactional
    public UrlMapping shortenUrl(String originalUrl, User user) {
        // Create initial mapping to generate an ID
        UrlMapping mapping = new UrlMapping();
        mapping.setOriginalUrl(originalUrl);
        mapping.setUser(user);
        mapping.setCreatedDate(LocalDateTime.now());
        mapping.setExpiresAt(LocalDateTime.now().plusDays(90));
        mapping.setClickCount(0);

        UrlMapping savedMapping = urlMappingRepository.save(mapping);

        // Encode the generated ID to base62
        String shortCode = base62Encoder.encode(savedMapping.getId());
        savedMapping.setShortUrl(shortCode);

        // Update with the generated short URL
        return urlMappingRepository.save(savedMapping);
    }
}
