package com.campusplacement.portal.service;

import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusplacement.portal.dto.AuthResponse;
import com.campusplacement.portal.dto.CompleteProfileRequest;
import com.campusplacement.portal.dto.LoginRequest;
import com.campusplacement.portal.dto.RegisterRequest;
import com.campusplacement.portal.entity.Role;
import com.campusplacement.portal.entity.Student;
import com.campusplacement.portal.entity.User;
import com.campusplacement.portal.exception.DuplicateResourceException;
import com.campusplacement.portal.exception.InvalidCredentialsException;
import com.campusplacement.portal.exception.ResourceNotFoundException;
import com.campusplacement.portal.repository.StudentRepository;
import com.campusplacement.portal.repository.UserRepository;
import com.campusplacement.portal.security.JwtService;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
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
            if (request.getStudentId() != null) {
                // Link to a profile a TPO already created.
                user.setStudentId(request.getStudentId());
            } else if (request.getName() != null && !request.getName().isBlank()) {
                // Self-registration: create the profile now so the student shows up
                // in the Students list and everywhere else immediately.
                Student student = new Student();
                student.setName(request.getName());
                student.setEmail(request.getEmail());
                student.setBacklogs(0);
                Student saved = studentRepository.save(student);
                user.setStudentId(saved.getId());
            }
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

    /**
     * For a STUDENT account that registered before a profile existed (or without
     * one): creates the profile now and links it, without needing a new account.
     */
    public AuthResponse completeProfile(String email, CompleteProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + email));

        if (user.getRole() != Role.STUDENT) {
            throw new DuplicateResourceException("Only student accounts can complete a student profile");
        }
        if (user.getStudentId() != null) {
            throw new DuplicateResourceException("This account already has a linked student profile");
        }

        Student student;
        if (studentRepository.existsByEmail(email)) {
            // A profile with this email exists (e.g. a TPO added it after the account
            // registered) but was never linked — link to it instead of duplicating.
            student = studentRepository.findByEmail(email).orElseThrow();
        } else {
            student = new Student();
            student.setName(request.getName());
            student.setEmail(email);
            student.setBranch(request.getBranch());
            student.setRollNumber(request.getRollNumber());
            student.setBacklogs(0);
            student = studentRepository.save(student);
        }

        user.setStudentId(student.getId());
        userRepository.save(user);

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
