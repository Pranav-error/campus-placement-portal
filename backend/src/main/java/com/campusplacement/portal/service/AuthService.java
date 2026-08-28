package com.campusplacement.portal.service;

import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campusplacement.portal.dto.AuthResponse;
import com.campusplacement.portal.dto.LoginRequest;
import com.campusplacement.portal.dto.RegisterRequest;
import com.campusplacement.portal.entity.Role;
import com.campusplacement.portal.entity.User;
import com.campusplacement.portal.exception.DuplicateResourceException;
import com.campusplacement.portal.exception.InvalidCredentialsException;
import com.campusplacement.portal.repository.UserRepository;
import com.campusplacement.portal.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        if (request.getRole() == Role.STUDENT) {
            user.setStudentId(request.getStudentId());
        }
        userRepository.save(user);

        return buildResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return buildResponse(user);
    }

    private AuthResponse buildResponse(User user) {
        String token = jwtService.generateToken(user.getEmail(), Map.of(
                "role", user.getRole().name(),
                "studentId", user.getStudentId() == null ? "" : user.getStudentId()
        ));
        return new AuthResponse(token, user.getEmail(), user.getRole(), user.getStudentId());
    }

}
