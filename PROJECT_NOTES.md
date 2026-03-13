# 🔗 URL Shortener — My Personal Project Notes
> Written for: Harinath E | Date: March 13, 2026

---

## 🧠 What Did I Build?

A **Production-Grade Distributed URL Shortener** backend using:

| Technology | Purpose |
|------------|---------|
| Java 21 + Spring Boot 3.3.5 | Backend framework |
| PostgreSQL | Persistent database |
| Redis | Caching layer (fast redirects) |
| Spring Security + JWT | Authentication |
| Maven | Build tool |
| Lombok | Reduce boilerplate code |

---

## 📁 Project Location

```
c:\New folder\URL-SHORTENER\
└── url-shortener-sb\          ← Main Spring Boot project
    ├── pom.xml                ← All dependencies
    └── src\main\
        ├── java\com\url\shortener\
        │   ├── UrlShortenerApplication.java   ← App entry point
        │   ├── config\
        │   │   └── SecurityConfig.java         ← JWT + Spring Security setup
        │   ├── controller\
        │   │   ├── AuthController.java          ← Register / Login
        │   │   ├── RedirectController.java      ← GET /{shortCode} → 302
        │   │   └── UrlController.java           ← Shorten + Analytics APIs
        │   ├── dto\
        │   │   ├── AuthRequest / Response       ← Login request/response
        │   │   ├── RegisterRequest              ← Signup request
        │   │   ├── UrlRequest / Response        ← Shorten request/response
        │   │   └── AnalyticsResponse            ← Analytics data
        │   ├── exception\
        │   │   ├── UrlNotFoundException.java    ← Custom 404 error
        │   │   └── GlobalExceptionHandler.java  ← Returns clean JSON errors
        │   ├── models\
        │   │   ├── User.java                    ← DB table: users
        │   │   ├── UrlMapping.java              ← DB table: url_mapping
        │   │   └── ClickEvent.java              ← DB table: click_event
        │   ├── repository\
        │   │   ├── UserRepository               ← DB queries for User
        │   │   ├── UrlMappingRepository         ← DB queries for URLs
        │   │   └── ClickEventRepository         ← DB queries for clicks
        │   ├── security\
        │   │   ├── JwtUtil.java                 ← Generate + validate JWT tokens
        │   │   ├── JwtAuthenticationFilter.java ← Intercepts each request
        │   │   └── CustomUserDetailsService.java← Load user from DB for auth
        │   ├── service\
        │   │   ├── UrlShorteningService.java    ← Shorten URL logic
        │   │   ├── UrlRedirectionService.java   ← Redirect logic + Redis cache
        │   │   └── AnalyticsService.java        ← Click count + click events
        │   └── util\
        │       └── Base62Encoder.java           ← Converts DB ID → short code
        └── resources\
            └── application.properties          ← DB + Redis + App config
```

---

## 🗄️ Database Schema (PostgreSQL)

**Database name:** `url_shortener`

### Table: `users`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT | Auto-generated primary key |
| email | VARCHAR | User email |
| username | VARCHAR | Used for login |
| password | VARCHAR | BCrypt hashed |
| role | VARCHAR | Default: `ROLE_USER` |

### Table: `url_mapping`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT | Auto-generated primary key |
| original_url | VARCHAR | The long URL |
| short_url | VARCHAR | Base62 short code (e.g. `1`, `b9`) |
| click_count | INT | Total number of times clicked |
| created_date | DATETIME | When it was created |
| user_id | BIGINT | FK to users (nullable — anonymous allowed) |

### Table: `click_event`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT | Auto-generated |
| click_date | DATETIME | Exact time of the click |
| url_mapping_id | BIGINT | FK to url_mapping |

> 💡 Tables are **auto-created** by Hibernate on first boot (`ddl-auto=update`)

---

## ⚙️ How Short Codes Are Generated

Uses **Base62 encoding** on the database row ID.

```
DB saves row → gets ID (e.g. 125)
Base62Encoder.encode(125) → "b9"
Short URL = http://localhost:8080/b9
```

Base62 characters: `0-9`, `A-Z`, `a-z` (62 total)
Result: short, URL-safe, unique codes.

---

## 🔒 How Authentication Works (JWT)

```
1. User registers → password BCrypt hashed → saved to DB
2. User logs in   → Spring Security verifies password
3. Server returns → JWT token (valid 10 hours)
4. Client sends   → "Authorization: Bearer <token>" on every protected request
5. JwtFilter      → reads token, validates, sets user in SecurityContext
```

**Protected endpoints** (need JWT):
- `GET /api/analytics/{shortCode}`

**Public endpoints** (no JWT needed):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/shorten`
- `GET /{shortCode}` (the redirect)

---

## 🚀 How Redis Caching Works

```
User visits → http://localhost:8080/1
              ↓
         Redis cache check
              ↓
     Hit? → Return URL instantly (no DB call)
     Miss? → Query PostgreSQL → Store in Redis → Return URL
              ↓
         Always: Log click_event + increment click_count
```

> 💡 **Bug I fixed:** Originally, analytics was inside the `@Cacheable` method.
> That meant after the first visit, analytics was never called again (cache skipped the method body).
> **Fix:** Split into two methods — `fetchOriginalUrl()` is cached, `getOriginalUrl()` always calls analytics.

---

## 📡 API Endpoints

| Method | URL | Auth | What it does |
|--------|-----|------|--------------|
| `POST` | `/api/auth/register` | ❌ | Create new account |
| `POST` | `/api/auth/login` | ❌ | Login → get JWT token |
| `POST` | `/api/shorten` | ❌ | Shorten a long URL |
| `GET`  | `/{shortCode}` | ❌ | Redirect to original URL (HTTP 302) |
| `GET`  | `/api/analytics/{shortCode}` | ✅ JWT | Get click stats |

---

## 🧪 How to Test (PowerShell Terminal)

> ⚠️ Always use `curl.exe` not `curl` in PowerShell.
> Always use `'{\"key\":\"value\"}'` for JSON bodies.

### Register
```powershell
curl.exe -s -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"you@gmail.com\",\"username\":\"yourname\",\"password\":\"yourpass\"}'
```

### Login + Save Token
```powershell
$token = (curl.exe -s -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"yourname\",\"password\":\"yourpass\"}' | ConvertFrom-Json).token
```

### Shorten a URL
```powershell
curl.exe -s -X POST http://localhost:8080/api/shorten `
  -H "Content-Type: application/json" `
  -d '{\"originalUrl\":\"https://leetcode.com/u/Harinath_E07/\"}'
```

### Test Redirect (check HTTP status)
```powershell
curl.exe -s -o NUL -w "HTTP Status: %{http_code}`nRedirects to: %{redirect_url}`n" http://localhost:8080/2
```
Or open browser: `http://localhost:8080/2` → goes to LeetCode ✅

### Check Analytics
```powershell
curl.exe -s http://localhost:8080/api/analytics/2 `
  -H "Authorization: Bearer $token"
```

---

## ▶️ How to Start the App

> Requires: PostgreSQL running, Redis running on port 6379

```powershell
mvn spring-boot:run -f "c:\New folder\URL-SHORTENER\url-shortener-sb\pom.xml"
```

App starts at: `http://localhost:8080`

---

## 🐛 Bugs Found & Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| App failed to start | `pom.xml` had `<packaging>pom</packaging>` instead of `jar` | Changed to `jar` |
| App failed to start | Stale `<module>model</module>` reference in pom.xml | Removed it |
| DB connection failed | DB name was `urlshortener` but actual DB is `url_shortener` | Fixed datasource URL |
| Analytics not tracked after 1st click | `@Cacheable` wrapped analytics — cache skipped it | Split into two methods |
| 404s returned HTTP 500 | Generic `RuntimeException` used | Added `UrlNotFoundException` → proper 404 |

---

## 📊 Build Status

```
mvn compile              → ✅ SUCCESS
mvn package -DskipTests  → ✅ SUCCESS
Spring Boot startup      → ✅ Started in ~9.9 seconds
```

---

## 🗺️ What's Next (Phase 7)

- **Frontend** — React (Vite) UI with:
  - Input box → paste long URL → click Shorten
  - Show short URL with copy button
  - Analytics dashboard (click count chart)

---

## 💡 Key Concepts I Learned

| Concept | Where it's used |
|---------|----------------|
| REST API design | All controllers |
| JWT Authentication | Security package |
| Spring Security filter chain | `SecurityConfig.java` |
| JPA / Hibernate ORM | All models + repositories |
| Redis caching | `UrlRedirectionService` |
| Base62 encoding | `Base62Encoder.java` |
| Layered architecture | controller → service → repository |
| Global exception handling | `GlobalExceptionHandler.java` |
| DTO pattern | Separate request/response objects |
