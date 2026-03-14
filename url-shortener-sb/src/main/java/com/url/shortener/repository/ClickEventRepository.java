package com.url.shortener.repository;

import com.url.shortener.dto.DailyClickDto;
import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {

    List<ClickEvent> findByUrlMapping(UrlMapping urlMapping);

    // Groups all click events by calendar day for a given short URL.
    // CAST to LocalDate truncates the timestamp to just the date part (Hibernate 6 / SB 3.x).
    // Constructor expression maps directly into DailyClickDto.
    @Query("""
        SELECT new com.url.shortener.dto.DailyClickDto(
            CAST(c.clickDate AS LocalDate),
            COUNT(c)
        )
        FROM ClickEvent c
        WHERE c.urlMapping.shortUrl = :shortUrl
          AND c.clickDate >= :since
        GROUP BY CAST(c.clickDate AS LocalDate)
        ORDER BY CAST(c.clickDate AS LocalDate)
        """)
    List<DailyClickDto> findDailyClickCounts(
        @Param("shortUrl") String shortUrl,
        @Param("since")    LocalDateTime since
    );
}
