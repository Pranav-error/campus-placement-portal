package com.campusplacement.portal.dto;

import jakarta.validation.constraints.NotBlank;

/** Used by an already-registered STUDENT account with no linked profile yet. */
public class CompleteProfileRequest {

    @NotBlank(message = "name is required")
    private String name;

    private String branch;

    private String rollNumber;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

}
