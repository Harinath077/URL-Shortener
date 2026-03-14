package com.url.shortener.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class Base62EncoderTest {

    private Base62Encoder encoder;

    @BeforeEach
    void setUp() {
        encoder = new Base62Encoder();
    }

    @Test
    @DisplayName("encode(0) should return '0'")
    void encode_zero_returnsZero() {
        assertEquals("0", encoder.encode(0));
    }

    @Test
    @DisplayName("encode(1) should return '1'")
    void encode_one_returnsOne() {
        assertEquals("1", encoder.encode(1));
    }

    @Test
    @DisplayName("encode/decode roundtrip should return original value")
    void encode_decode_roundtrip() {
        long original = 125L;
        String encoded = encoder.encode(original);
        long decoded = encoder.decode(encoded);
        assertEquals(original, decoded);
    }

    @Test
    @DisplayName("encode/decode roundtrip with large number")
    void encode_decode_largeNumber() {
        long original = 999_999_999L;
        String encoded = encoder.encode(original);
        long decoded = encoder.decode(encoded);
        assertEquals(original, decoded);
    }

    @Test
    @DisplayName("encode should produce different codes for different IDs")
    void encode_differentIds_differentCodes() {
        String code1 = encoder.encode(100L);
        String code2 = encoder.encode(101L);
        assertNotEquals(code1, code2);
    }

    @Test
    @DisplayName("encoded string should only contain Base62 characters")
    void encode_outputIsBase62() {
        String encoded = encoder.encode(987654321L);
        assertTrue(encoded.matches("[0-9A-Za-z]+"),
                "Encoded value should only contain alphanumeric characters");
    }
}
