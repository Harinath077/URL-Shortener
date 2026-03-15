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
    public UrlMapping shortenUrl(String originalUrl, User user, Integer expiryDays) {
        UrlMapping mapping = new UrlMapping();
        mapping.setOriginalUrl(originalUrl);
        mapping.setUser(user);
        mapping.setCreatedDate(LocalDateTime.now());
        mapping.setClickCount(0);

        // null expiryDays = no expiry (link lives forever)
        mapping.setExpiresAt(
            expiryDays != null ? LocalDateTime.now().plusDays(expiryDays) : null
        );

        UrlMapping saved = urlMappingRepository.save(mapping);

        // Encode the DB-generated ID with a 1B offset to ensure 6-char alphanumeric codes
        saved.setShortUrl(base62Encoder.encode(saved.getId() + 1_000_000_000L));
        return urlMappingRepository.save(saved);
    }

    // Backwards-compatible overload — used by tests / other callers
    @Transactional
    public UrlMapping shortenUrl(String originalUrl, User user) {
        return shortenUrl(originalUrl, user, null);
    }
}
