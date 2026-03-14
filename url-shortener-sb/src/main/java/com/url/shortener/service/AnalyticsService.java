package com.url.shortener.service;

import com.url.shortener.dto.DailyClickDto;
import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ClickEventRepository clickEventRepository;
    private final UrlMappingRepository urlMappingRepository;

    // In-memory queues for massive throughput (Millions of clicks per second scale)
    private final ConcurrentLinkedQueue<ClickEvent> eventQueue = new ConcurrentLinkedQueue<>();
    private final ConcurrentHashMap<Long, Integer>  clickCounts = new ConcurrentHashMap<>();

    /**
     * Non-blocking Analytics Logger — Puts events into memory, returns instantly.
     * ZERO database queries at the time of click.
     */
    public void logClickEvent(UrlMapping urlMapping) {
        // Increment purely in RAM
        clickCounts.merge(urlMapping.getId(), 1, Integer::sum);

        // Add to RAM queue
        ClickEvent event = new ClickEvent();
        event.setUrlMapping(urlMapping);
        event.setClickDate(LocalDateTime.now());
        eventQueue.add(event);
    }

    /**
     * Background flusher — Runs every 2 seconds, safely sweeping RAM to DB in bulk.
     */
    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void flushEventsToDatabase() {
        // 1. Drain click count map and bulk-increment PostgreSQL
        if (!clickCounts.isEmpty()) {
            for (Map.Entry<Long, Integer> entry : clickCounts.entrySet()) {
                Integer count = clickCounts.remove(entry.getKey());
                if (count != null && count > 0) {
                    urlMappingRepository.incrementClickCount(entry.getKey(), count);
                }
            }
        }

        // 2. Drain event queue and save in one massive batch
        if (!eventQueue.isEmpty()) {
            List<ClickEvent> batch = new ArrayList<>();
            ClickEvent event;
            // Drain up to 10,000 max at a time to keep memory safe
            while ((event = eventQueue.poll()) != null && batch.size() < 10000) {
                batch.add(event);
            }
            if (!batch.isEmpty()) {
                clickEventRepository.saveAll(batch);
            }
        }
    }

    public List<ClickEvent> getClickEvents(UrlMapping urlMapping) {
        return clickEventRepository.findByUrlMapping(urlMapping);
    }

    /**
     * Returns daily click counts for the last N days.
     * Days with zero clicks are gap-filled — every day in the range always
     * appears in the result so the chart has no missing bars.
     *
     * @param shortUrl the short code (e.g. "aZ91K")
     * @param days     how many days back to look (7 or 30)
     */
    public List<DailyClickDto> getDailyStats(String shortUrl, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        // DB returns only days that have at least one click
        List<DailyClickDto> rawResults =
                clickEventRepository.findDailyClickCounts(shortUrl, since);

        // Convert to Map<date, count> for O(1) lookup during gap-fill
        Map<LocalDate, Long> clicksByDate = rawResults.stream()
                .collect(Collectors.toMap(
                        DailyClickDto::getDate,
                        DailyClickDto::getClickCount
                ));

        // Build the full date range — every day gets an entry (0 if no clicks)
        List<DailyClickDto> fullRange = new ArrayList<>();
        LocalDate start = LocalDate.now().minusDays(days - 1);

        for (int i = 0; i < days; i++) {
            LocalDate day = start.plusDays(i);
            long count = clicksByDate.getOrDefault(day, 0L);
            fullRange.add(new DailyClickDto(day, count));
        }

        return fullRange;
    }
}

