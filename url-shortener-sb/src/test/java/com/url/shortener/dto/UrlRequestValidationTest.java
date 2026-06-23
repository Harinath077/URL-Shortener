package com.url.shortener.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UrlRequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidatorFactory() {
        validatorFactory.close();
    }

    @Test
    void acceptsValidUrlWithoutExpiry() {
        UrlRequest request = new UrlRequest();
        request.setOriginalUrl("https://example.com");
        request.setExpiryDays(null);

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void acceptsValidUrlWithValidExpiry() {
        UrlRequest request = new UrlRequest();
        request.setOriginalUrl("https://example.com");
        request.setExpiryDays(30);

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void rejectsBlankUrl() {
        UrlRequest request = new UrlRequest();
        request.setOriginalUrl("   ");
        request.setExpiryDays(10);

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("originalUrl");
    }

    @Test
    void rejectsInvalidUrlFormat() {
        UrlRequest request = new UrlRequest();
        request.setOriginalUrl("not-a-valid-url");
        request.setExpiryDays(10);

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("originalUrl");
    }

    @Test
    void rejectsZeroExpiryDays() {
        UrlRequest request = new UrlRequest();
        request.setOriginalUrl("https://example.com");
        request.setExpiryDays(0);

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("expiryDays");
    }

    @Test
    void rejectsNegativeExpiryDays() {
        UrlRequest request = new UrlRequest();
        request.setOriginalUrl("https://example.com");
        request.setExpiryDays(-5);

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("expiryDays");
    }

    @Test
    void rejectsTooLargeExpiryDays() {
        UrlRequest request = new UrlRequest();
        request.setOriginalUrl("https://example.com");
        request.setExpiryDays(366);

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("expiryDays");
    }
}
