package com.url.shortener.controller;

import com.url.shortener.service.UrlRedirectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class RedirectController {

    private final UrlRedirectionService urlRedirectionService;

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirectUrl(@PathVariable String shortCode) {
        String originalUrl = urlRedirectionService.getOriginalUrl(shortCode);
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", originalUrl);
        
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
