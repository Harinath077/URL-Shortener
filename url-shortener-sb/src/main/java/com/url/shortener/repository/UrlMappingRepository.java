package com.url.shortener.repository;

import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlMappingRepository extends JpaRepository<UrlMapping, Long> {

    Optional<UrlMapping> findByShortUrl(String shortUrl);

    // Existing — unordered (kept for internal uses)
    List<UrlMapping> findByUser(User user);

    // Dashboard query — newest link appears first
    List<UrlMapping> findByUserOrderByCreatedDateDesc(User user);

    // Expiry cleanup — fetch codes before eviction for cache invalidation
    @Query("SELECT u.shortUrl FROM UrlMapping u WHERE u.expiresAt IS NOT NULL AND u.expiresAt < :now")
    List<String> findShortUrlsExpiredBefore(@Param("now") LocalDateTime now);

    // Bulk-delete all past-expiry rows in one statement
    @Modifying
    @Query("DELETE FROM UrlMapping u WHERE u.expiresAt IS NOT NULL AND u.expiresAt < :now")
    int deleteAllExpiredBefore(@Param("now") LocalDateTime now);

    // Used by the batched analytics flusher
    @Modifying
    @Query("UPDATE UrlMapping u SET u.clickCount = u.clickCount + :count WHERE u.id = :id")
    void incrementClickCount(@Param("id") Long id, @Param("count") int count);
}
