package com.url.shortener.controller;

import com.url.shortener.dto.AnalyticsResponse;
import com.url.shortener.dto.UrlRequest;
import com.url.shortener.dto.UrlResponse;
import com.url.shortener.exception.UrlNotFoundException;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.UrlMappingRepository;
import com.url.shortener.repository.UserRepository;
import com.url.shortener.service.UrlShorteningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UrlController {

    private final UrlShorteningService urlShorteningService;
    private final UrlMappingRepository urlMappingRepository;
    private final UserRepository userRepository;

    @PostMapping("/shorten")
    public ResponseEntity<UrlResponse> shortenUrl(@Valid @RequestBody UrlRequest request, Principal principal) {
        User user = null;
        if (principal != null) {
            user = userRepository.findByUsername(principal.getName()).orElse(null);
        }
        
        UrlMapping mapping = urlShorteningService.shortenUrl(request.getOriginalUrl(), user);
        
        UrlResponse response = new UrlResponse(
                mapping.getOriginalUrl(),
                mapping.getShortUrl(),
                mapping.getCreatedDate()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/{shortCode}")
    public ResponseEntity<AnalyticsResponse> getAnalytics(@PathVariable String shortCode) {
        UrlMapping mapping = urlMappingRepository.findByShortUrl(shortCode)
                .orElseThrow(() -> new UrlNotFoundException(shortCode));

        AnalyticsResponse response = new AnalyticsResponse(
                mapping.getOriginalUrl(),
                mapping.getShortUrl(),
                mapping.getClickCount(),
                mapping.getCreatedDate()
        );
        return ResponseEntity.ok(response);
    }
}
