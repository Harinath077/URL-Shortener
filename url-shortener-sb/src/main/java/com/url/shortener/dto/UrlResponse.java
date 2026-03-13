package com.url.shortener.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UrlResponse {
    private String originalUrl;
    private String shortUrl;
    private LocalDateTime createdDate;
}
