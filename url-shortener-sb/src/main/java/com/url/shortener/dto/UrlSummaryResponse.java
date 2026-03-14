package com.url.shortener.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UrlSummaryResponse {
    private String        shortUrl;
    private String        originalUrl;
    private int           clickCount;
    private LocalDateTime createdDate;
    private LocalDateTime expiresAt;   // null = never expires
    private boolean       expired;     // computed server-side — frontend just reads the flag
}
