package com.url.shortener.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class UrlRequest {

    @NotBlank(message = "URL must not be blank")
    @URL(message = "Must be a valid URL (e.g. https://example.com)")
    private String originalUrl;

    // Optional — null means no expiry; positive integer = days until expiry
    @Min(value = 1, message = "Expiry days must be at least 1")
    @Max(value = 365, message = "Expiry days must not exceed 365 days")
    private Integer expiryDays;
}

