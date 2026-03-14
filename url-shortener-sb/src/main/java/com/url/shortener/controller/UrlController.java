package com.url.shortener.controller;

import com.url.shortener.dto.AnalyticsResponse;
import com.url.shortener.dto.DailyClickDto;
import com.url.shortener.dto.UrlRequest;
import com.url.shortener.dto.UrlResponse;
import com.url.shortener.dto.UrlSummaryResponse;
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
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UrlController {

    private final UrlShorteningService urlShorteningService;
    private final UrlMappingRepository urlMappingRepository;
    private final UserRepository       userRepository;
    private final AnalyticsService     analyticsService;

    // ── POST /api/shorten ───────────────────────────────────────────────────────
    @PostMapping("/shorten")
    public ResponseEntity<UrlResponse> shortenUrl(
            @Valid @RequestBody UrlRequest request,
            Principal principal) {

        User user = null;
        if (principal != null) {
            user = userRepository.findByUsername(principal.getName()).orElse(null);
        }

        UrlMapping mapping = urlShorteningService.shortenUrl(
                request.getOriginalUrl(),
                user,
                request.getExpiryDays()   // null = no expiry
        );

        return ResponseEntity.ok(new UrlResponse(
                mapping.getOriginalUrl(),
                mapping.getShortUrl(),
                mapping.getCreatedDate(),
                mapping.getExpiresAt()
        ));
    }

    // ── GET /api/urls ───────────────────────────────────────────────────────────
    // Returns all URLs belonging to the authenticated user, newest first.
    // Never returns raw UrlMapping — always mapped to UrlSummaryResponse DTO
    // to prevent leaking the User entity (and hashed password) in the JSON.
    @GetMapping("/urls")
    public ResponseEntity<List<UrlSummaryResponse>> getUserUrls(Principal principal) {
        if (principal == null) return ResponseEntity.ok(List.of());

        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.ok(List.of());

        List<UrlSummaryResponse> urls = urlMappingRepository
                .findByUserOrderByCreatedDateDesc(user)
                .stream()
                .map(this::toSummary)
                .toList();

        return ResponseEntity.ok(urls);
    }

    // ── DELETE /api/urls/{shortCode} ────────────────────────────────────────────
    @DeleteMapping("/urls/{shortCode}")
    public ResponseEntity<Void> deleteUrl(@PathVariable String shortCode, Principal principal) {
        UrlMapping mapping = urlMappingRepository.findByShortUrl(shortCode)
                .orElseThrow(() -> new UrlNotFoundException(shortCode));

        // Only the owner may delete their own link
        if (principal != null && mapping.getUser() != null
                && mapping.getUser().getUsername().equals(principal.getName())) {
            urlMappingRepository.delete(mapping);
        }
        return ResponseEntity.noContent().build();
    }

    // ── GET /api/analytics/{shortCode}?days=7 ──────────────────────────────────
    @GetMapping("/analytics/{shortCode}")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable String shortCode,
            @RequestParam(defaultValue = "7") int days) {

        UrlMapping mapping = urlMappingRepository.findByShortUrl(shortCode)
                .orElseThrow(() -> new UrlNotFoundException(shortCode));

        List<DailyClickDto> dailyClicks = analyticsService.getDailyStats(shortCode, days);

        return ResponseEntity.ok(new AnalyticsResponse(
                mapping.getOriginalUrl(),
                mapping.getShortUrl(),
                mapping.getClickCount(),
                mapping.getCreatedDate(),
                dailyClicks
        ));
    }

    // ── private mapper ──────────────────────────────────────────────────────────
    private UrlSummaryResponse toSummary(UrlMapping m) {
        boolean expired = m.getExpiresAt() != null
                && m.getExpiresAt().isBefore(LocalDateTime.now());

        return new UrlSummaryResponse(
                m.getShortUrl(),
                m.getOriginalUrl(),
                m.getClickCount(),
                m.getCreatedDate(),
                m.getExpiresAt(),
                expired
        );
    }
}
