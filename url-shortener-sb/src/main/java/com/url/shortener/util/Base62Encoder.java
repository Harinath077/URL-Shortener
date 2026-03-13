package com.url.shortener.util;

import org.springframework.stereotype.Component;

@Component
public class Base62Encoder {

    private static final String BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    public String encode(long value) {
        StringBuilder sb = new StringBuilder();
        if (value == 0) {
            return "0";
        }
        while (value > 0) {
            sb.append(BASE62.charAt((int) (value % 62)));
            value /= 62;
        }
        return sb.reverse().toString();
    }

    public long decode(String base62) {
        long value = 0;
        for (int i = 0; i < base62.length(); i++) {
            value = value * 62 + BASE62.indexOf(base62.charAt(i));
        }
        return value;
    }
}
