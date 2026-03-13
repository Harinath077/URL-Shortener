# Walkthrough — URL Shortener Backend (Phase 1–6)

## What Was Built

A complete Spring Boot backend for a production-grade distributed URL shortener, implementing all 6 phases from the original plan.

---

## Phase Completion Summary

| Phase | Status | What Was Done |
|-------|--------|---------------|
| Phase 1 — Project Setup | ✅ Done | [pom.xml](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/pom.xml) configured with PostgreSQL, JPA, Spring Security, Redis, JWT, Lombok dependencies |
| Phase 2 — Database Layer | ✅ Done | [User](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/models/User.java#6-20), [UrlMapping](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/models/UrlMapping.java#8-25), [ClickEvent](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/models/ClickEvent.java#8-22) entities + JPA Repositories created |
| Phase 3 — Core Services | ✅ Done | [Base62Encoder](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/util/Base62Encoder.java#5-30), [UrlShorteningService](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/service/UrlShorteningService.java#13-39), [UrlRedirectionService](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/service/UrlRedirectionService.java#12-32), [AnalyticsService](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/service/AnalyticsService.java#14-38) |
| Phase 4 — API Layer | ✅ Done | Controllers for shortening, 302 redirect, and analytics endpoints |
| Phase 5 — Auth | ✅ Done | JWT-based auth with Spring Security, Register/Login endpoints |
| Phase 6 — Caching | ✅ Done | Redis `@Cacheable` applied to redirect path via `spring.cache.type=redis` |

---

## Project File Structure

```
src/main/java/com/url/shortener/
├── UrlShortenerApplication.java     (main entry point, @EnableCaching)
├── config/
│   └── SecurityConfig.java          (Spring Security + JWT filter chain)
├── controller/
│   ├── AuthController.java          (POST /api/auth/register, /login)
│   ├── RedirectController.java      (GET /{shortCode} → 302 redirect)
│   └── UrlController.java           (POST /api/shorten, GET /api/analytics/{code})
├── dto/
│   ├── AuthRequest.java, AuthResponse.java, RegisterRequest.java
│   ├── UrlRequest.java, UrlResponse.java, AnalyticsResponse.java
├── exception/
│   ├── GlobalExceptionHandler.java  (returns JSON errors via @RestControllerAdvice)
│   └── UrlNotFoundException.java    (custom 404)
├── models/
│   ├── User.java, UrlMapping.java, ClickEvent.java
├── repository/
│   ├── UserRepository.java, UrlMappingRepository.java, ClickEventRepository.java
├── security/
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtUtil.java
├── service/
│   ├── UrlShorteningService.java    (Base62 encoding + DB save)
│   ├── UrlRedirectionService.java   (Redis cache → DB lookup → analytics log)
│   └── AnalyticsService.java       (click_count increment + ClickEvent record)
└── util/
    └── Base62Encoder.java
```

---

## Build Verification

```
mvn compile    → ✅ SUCCESS (3.864s)
mvn package -DskipTests → ✅ SUCCESS (6.757s, Exit code: 0)
```

---

## Bugs Fixed During Verification

| Issue | Fix |
|-------|-----|
| [pom.xml](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/pom.xml) had `<packaging>pom</packaging>` (wrong for single-module Spring Boot) | Changed to `jar` |
| [pom.xml](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/pom.xml) had stale `<module>model</module>` reference (no such folder) | Removed |
| `UrlMapping.user_id` FK needed to be nullable for anonymous shortening | Added `nullable = true` |
| Generic [RuntimeException](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/exception/GlobalExceptionHandler.java#19-24) thrown on 404 — returns HTTP 500 | Replaced with [UrlNotFoundException](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/exception/UrlNotFoundException.java#3-8) → 404 via [GlobalExceptionHandler](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/java/com/url/shortener/exception/GlobalExceptionHandler.java#10-25) |
| [application.properties](file:///c:/New%20folder/URL-SHORTENER/url-shortener-sb/src/main/resources/application.properties) missing `spring.cache.type=redis` | Added + Redis timeout |

---

## API Endpoints Summary

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/auth/register` | Create account | No |
| `POST` | `/api/auth/login` | Login, get JWT | No |
| `POST` | `/api/shorten` | Shorten a URL | Optional |
| `GET`  | `/{shortCode}` | Redirect (302) | No |
| `GET`  | `/api/analytics/{shortCode}` | Click stats | Yes (JWT) |

---

## How to Run

> [!IMPORTANT]
> Make sure **PostgreSQL** is running on port 5432 with a database named `url_shortener`, and **Redis** is running on port 6379 before starting the app.

```bash
# Start the application
mvn spring-boot:run -f "url-shortener-sb/pom.xml"
```

**Test the shorten endpoint:**
```bash
curl -X POST http://localhost:8080/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.google.com"}'
```

**Test redirect:**
```
GET http://localhost:8080/{shortCode}   → 302 → original URL
```
