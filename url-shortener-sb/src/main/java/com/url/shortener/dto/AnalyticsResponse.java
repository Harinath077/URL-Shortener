package com.url.shortener.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private String        originalUrl;
    private String        shortUrl;
    private int           clickCount;
    private LocalDateTime createdDate;

    // Daily breakdown for the chart — always `days` entries, zeros included
    private List<DailyClickDto> dailyClicks;
}
