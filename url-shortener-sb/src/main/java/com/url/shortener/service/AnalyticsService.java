package com.url.shortener.service;

import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ClickEventRepository clickEventRepository;
    private final UrlMappingRepository urlMappingRepository;

    @Transactional
    public void logClickEvent(UrlMapping urlMapping) {
        // Increment click count
        urlMapping.setClickCount(urlMapping.getClickCount() + 1);
        urlMappingRepository.save(urlMapping);

        // Record the event
        ClickEvent event = new ClickEvent();
        event.setUrlMapping(urlMapping);
        event.setClickDate(LocalDateTime.now());
        clickEventRepository.save(event);
    }
    
    public List<ClickEvent> getClickEvents(UrlMapping urlMapping) {
        return clickEventRepository.findByUrlMapping(urlMapping);
    }
}
