package com.url.shortener.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private static final String JWT_SECRET =
            "dGVzdC1vbmx5LWtleS10aGF0LWlzLWF0LWxlYXN0LTMyLWJ5dGVzLWxvbmc=";

    @Test
    void tokenCreatedByOneInstanceIsValidInAnotherInstance() {
        JwtUtil tokenIssuer = new JwtUtil(JWT_SECRET);
        JwtUtil tokenValidator = new JwtUtil(JWT_SECRET);
        UserDetails user = User.withUsername("alice")
                .password("unused")
                .authorities("USER")
                .build();

        String token = tokenIssuer.generateToken(user);

        assertThat(tokenValidator.validateToken(token, user)).isTrue();
    }
}
