package com.url.shortener.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class UrlMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String originalUrl;
    private String shortUrl;
    private int clickCount = 0;
    private LocalDateTime createdDate;
    private LocalDateTime expiresAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @OneToMany(mappedBy = "urlMapping", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private java.util.List<ClickEvent> clickEvents;
}
