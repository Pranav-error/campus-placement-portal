package com.campusplacement.portal.dto;

import com.campusplacement.portal.entity.Role;

public class AuthResponse {

    private String token;
    private String email;
    private Role role;
    private Long studentId;

    public AuthResponse(String token, String email, Role role, Long studentId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.studentId = studentId;
    }

    public String getToken() {
        return token;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public Long getStudentId() {
        return studentId;
    }

}
