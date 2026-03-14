package com.url.shortener.controller;

import com.url.shortener.dto.AnalyticsResponse;
import com.url.shortener.dto.DailyClickDto;
import com.url.shortener.dto.UrlRequest;
import com.url.shortener.dto.UrlResponse;
import com.url.shortener.exception.UrlNotFoundException;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.UrlMappingRepository;
import com.url.shortener.repository.UserRepository;
import com.url.shortener.service.AnalyticsService;
import com.url.shortener.service.UrlShorteningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UrlController {

    private final UrlShorteningService urlShorteningService;
    private final UrlMappingRepository urlMappingRepository;
    private final UserRepository       userRepository;
    private final AnalyticsService     analyticsService;

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
                mapping.getClickCount(),
                mapping.getCreatedDate()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/urls")
    public ResponseEntity<List<UrlResponse>> getUserUrls(Principal principal) {
        if (principal == null) return ResponseEntity.ok(List.of());
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.ok(List.of());
        List<UrlResponse> responses = urlMappingRepository.findByUser(user).stream()
                .map(m -> new UrlResponse(m.getOriginalUrl(), m.getShortUrl(),
                        m.getClickCount(), m.getCreatedDate()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/urls/{shortCode}")
    public ResponseEntity<Void> deleteUrl(@PathVariable String shortCode, Principal principal) {
        UrlMapping mapping = urlMappingRepository.findByShortUrl(shortCode)
                .orElseThrow(() -> new UrlNotFoundException(shortCode));
        // Only allow owner to delete
        if (principal != null && mapping.getUser() != null
                && mapping.getUser().getUsername().equals(principal.getName())) {
            urlMappingRepository.delete(mapping);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/analytics/{shortCode}")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable String shortCode,
            @RequestParam(defaultValue = "7") int days) {

        UrlMapping mapping = urlMappingRepository.findByShortUrl(shortCode)
                .orElseThrow(() -> new UrlNotFoundException(shortCode));

        // Gap-filled daily breakdown (every day present, zeros included)
        List<DailyClickDto> dailyClicks = analyticsService.getDailyStats(shortCode, days);

        AnalyticsResponse response = new AnalyticsResponse(
                mapping.getOriginalUrl(),
                mapping.getShortUrl(),
                mapping.getClickCount(),
                mapping.getCreatedDate(),
                dailyClicks
        );
        return ResponseEntity.ok(response);
    }
}
