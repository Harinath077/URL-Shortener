package com.url.shortener.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Data stored inside Redis cache.
 * Contains everything needed for URL redirection.
 */
public record CachedUrlData(
        Long id,
        String originalUrl,
        LocalDateTime expireAt
) implements Serializable {
}
