package com.campusplacement.portal.dto;

import java.util.Map;

public class DashboardStatsDto {

    private long totalStudents;
    private long totalCompanies;
    private long totalJobs;
    private long totalApplications;
    private long totalPlacements;
    private Map<String, Long> applicationsByStatus;

    public DashboardStatsDto(
            long totalStudents,
            long totalCompanies,
            long totalJobs,
            long totalApplications,
            long totalPlacements,
            Map<String, Long> applicationsByStatus) {
        this.totalStudents = totalStudents;
        this.totalCompanies = totalCompanies;
        this.totalJobs = totalJobs;
        this.totalApplications = totalApplications;
        this.totalPlacements = totalPlacements;
        this.applicationsByStatus = applicationsByStatus;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public long getTotalCompanies() {
        return totalCompanies;
    }

    public long getTotalJobs() {
        return totalJobs;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public long getTotalPlacements() {
        return totalPlacements;
    }

    public Map<String, Long> getApplicationsByStatus() {
        return applicationsByStatus;
    }

}
