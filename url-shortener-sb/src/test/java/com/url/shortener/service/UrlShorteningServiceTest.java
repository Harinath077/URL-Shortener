package com.url.shortener.service;

import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.UrlMappingRepository;
import com.url.shortener.util.Base62Encoder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UrlShorteningServiceTest {

    @Mock
    private UrlMappingRepository urlMappingRepository;

    @Mock
    private Base62Encoder base62Encoder;

    @InjectMocks
    private UrlShorteningService urlShorteningService;

    @BeforeEach
    void setUp() {
        // Return a mapping with ID 1 on first save, then return the updated version
        UrlMapping firstSave = new UrlMapping();
        firstSave.setId(1L);
        firstSave.setOriginalUrl("https://www.google.com");
        firstSave.setCreatedDate(LocalDateTime.now());
        firstSave.setClickCount(0);

        UrlMapping secondSave = new UrlMapping();
        secondSave.setId(1L);
        secondSave.setOriginalUrl("https://www.google.com");
        secondSave.setShortUrl("1");
        secondSave.setCreatedDate(firstSave.getCreatedDate());
        secondSave.setClickCount(0);

        when(urlMappingRepository.save(any(UrlMapping.class)))
                .thenReturn(firstSave)
                .thenReturn(secondSave);

        when(base62Encoder.encode(1000000001L)).thenReturn("1");
    }

    @Test
    @DisplayName("shortenUrl should save mapping and set short code")
    void shortenUrl_savesWithShortCode() {
        UrlMapping result = urlShorteningService.shortenUrl("https://www.google.com", null);

        assertNotNull(result);
        assertEquals("1", result.getShortUrl());
        assertEquals("https://www.google.com", result.getOriginalUrl());

        // Verify repo was called twice: once for initial save, once for update with short code
        verify(urlMappingRepository, times(2)).save(any(UrlMapping.class));
        verify(base62Encoder).encode(1000000001L);
    }

    @Test
    @DisplayName("shortenUrl with user should attach user to mapping")
    void shortenUrl_withUser_attachesUser() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        ArgumentCaptor<UrlMapping> captor = ArgumentCaptor.forClass(UrlMapping.class);

        urlShorteningService.shortenUrl("https://www.google.com", user);

        verify(urlMappingRepository, times(2)).save(captor.capture());

        // First save should have the user set
        UrlMapping firstCapture = captor.getAllValues().get(0);
        assertEquals(user, firstCapture.getUser());
    }

    @Test
    @DisplayName("shortenUrl sets createdDate to now")
    void shortenUrl_setsCreatedDate() {
        LocalDateTime before = LocalDateTime.now().minusSeconds(1);

        urlShorteningService.shortenUrl("https://www.google.com", null);

        ArgumentCaptor<UrlMapping> captor = ArgumentCaptor.forClass(UrlMapping.class);
        verify(urlMappingRepository, times(2)).save(captor.capture());

        UrlMapping firstCapture = captor.getAllValues().get(0);
        assertNotNull(firstCapture.getCreatedDate());
        assertTrue(firstCapture.getCreatedDate().isAfter(before));
    }
}
