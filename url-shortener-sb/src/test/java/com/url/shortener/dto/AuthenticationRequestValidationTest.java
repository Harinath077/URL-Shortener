package com.url.shortener.dto;

import com.url.shortener.controller.AuthController;
import jakarta.validation.Valid;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class AuthenticationRequestValidationTest {

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
    void acceptsValidRegistrationInput() {
        RegisterRequest request = new RegisterRequest(
                "alice@example.com",
                "alice_01",
                "Secure@123"
        );

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void rejectsInvalidRegistrationInput() {
        RegisterRequest request = new RegisterRequest("not-an-email", " ", "weak");

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("email", "username", "password");
    }

    @Test
    void rejectsBlankLoginInput() {
        AuthRequest request = new AuthRequest(" ", "");

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("username", "password");
    }

    @Test
    void controllerActivatesValidationForRegistrationAndLogin() throws Exception {
        Method register = AuthController.class.getMethod("register", RegisterRequest.class);
        Method login = AuthController.class.getMethod("login", AuthRequest.class);

        assertThat(register.getParameters()[0].isAnnotationPresent(Valid.class)).isTrue();
        assertThat(login.getParameters()[0].isAnnotationPresent(Valid.class)).isTrue();
    }
}
