package com.campusplacement.portal.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusplacement.portal.dto.AuthResponse;
import com.campusplacement.portal.dto.CompleteProfileRequest;
import com.campusplacement.portal.dto.LoginRequest;
import com.campusplacement.portal.dto.RegisterRequest;
import com.campusplacement.portal.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * For a STUDENT account that has no linked profile yet (e.g. it registered
     * before this existed, or without a name). Requires auth; operates on the
     * caller's own account only.
     */
    @PostMapping("/complete-profile")
    public AuthResponse completeProfile(@Valid @RequestBody CompleteProfileRequest request, Authentication auth) {
        return authService.completeProfile(auth.getName(), request);
    }

}
