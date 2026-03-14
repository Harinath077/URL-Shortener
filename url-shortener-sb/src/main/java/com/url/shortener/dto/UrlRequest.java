package com.url.shortener.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class UrlRequest {

    @NotBlank(message = "URL must not be blank")
    @URL(message = "Must be a valid URL (e.g. https://example.com)")
    private String originalUrl;

    // Optional — null means no expiry; positive integer = days until expiry
    private Integer expiryDays;
}
