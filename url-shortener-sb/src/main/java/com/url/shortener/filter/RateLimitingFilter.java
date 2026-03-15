package com.url.shortener.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

// Removed @Component to prevent auto-servlet registration issues. Instantiated in SecurityConfig.
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RedisTemplate<String, String> redisTemplate;

    private static final int    MAX_REQUESTS   = 10;
    private static final long   WINDOW_SECONDS = 60L;
    private static final String KEY_PREFIX     = "rate_limit::";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Only rate-limit POST /api/shorten
        if (!isShortenEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip  = extractClientIp(request);
        String key = KEY_PREFIX + ip;

        Long count = redisTemplate.opsForValue().increment(key);

        // First request — set the expiry window
        if (count != null && count == 1) {
            redisTemplate.expire(key, WINDOW_SECONDS, TimeUnit.SECONDS);
        }

        if (count != null && count > MAX_REQUESTS) {
            long ttl = Optional.ofNullable(
                redisTemplate.getExpire(key, TimeUnit.SECONDS)
            ).orElse(WINDOW_SECONDS);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("X-RateLimit-Limit",     String.valueOf(MAX_REQUESTS));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("Retry-After",           String.valueOf(ttl));
            response.getWriter().write("""
                {
                  "status": 429,
                  "error": "Too Many Requests",
                  "message": "Rate limit exceeded. Max %d requests per %d seconds. Retry after %d seconds.",
                  "retryAfter": %d
                }
                """.formatted(MAX_REQUESTS, WINDOW_SECONDS, ttl, ttl));
            return;
        }

        // Attach rate limit info headers to successful responses too
        long remaining = count == null ? MAX_REQUESTS : Math.max(0, MAX_REQUESTS - count);
        response.setHeader("X-RateLimit-Limit",     String.valueOf(MAX_REQUESTS));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));

        filterChain.doFilter(request, response);
    }

    private boolean isShortenEndpoint(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
            && "/api/shorten".equals(request.getRequestURI());
    }

    /**
     * Respects X-Forwarded-For for users behind proxies/load balancers.
     * Falls back to remoteAddr for direct connections.
     */
    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
