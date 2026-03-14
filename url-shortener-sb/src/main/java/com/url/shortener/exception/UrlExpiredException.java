package com.url.shortener.exception;

public class UrlExpiredException extends RuntimeException {
    public UrlExpiredException(String shortUrl) {
        super("The URL for short code '" + shortUrl + "' has expired.");
    }
}
