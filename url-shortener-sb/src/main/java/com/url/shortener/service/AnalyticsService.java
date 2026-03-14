package com.url.shortener.service;

import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ClickEventRepository clickEventRepository;
    private final UrlMappingRepository urlMappingRepository;

    // In-memory queues for massive throughput (Millions of clicks per second scale)
    private final ConcurrentLinkedQueue<ClickEvent> eventQueue = new ConcurrentLinkedQueue<>();
    private final ConcurrentHashMap<Long, Integer> clickCounts = new ConcurrentHashMap<>();

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
                // Remove atomically to avoid double-processing
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
}
