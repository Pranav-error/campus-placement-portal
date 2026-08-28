package com.campusplacement.portal.controller;

import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusplacement.portal.dto.DashboardStatsDto;
import com.campusplacement.portal.entity.ApplicationStatus;
import com.campusplacement.portal.repository.CompanyRepository;
import com.campusplacement.portal.repository.JobApplicationRepository;
import com.campusplacement.portal.repository.JobRepository;
import com.campusplacement.portal.repository.PlacementRepository;
import com.campusplacement.portal.repository.StudentRepository;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final PlacementRepository placementRepository;

    public DashboardController(
            StudentRepository studentRepository,
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            JobApplicationRepository applicationRepository,
            PlacementRepository placementRepository) {
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.placementRepository = placementRepository;
    }

    @GetMapping("/stats")
    public DashboardStatsDto stats() {
        var applications = applicationRepository.findAll();
        var byStatus = applications.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));

        for (ApplicationStatus status : ApplicationStatus.values()) {
            byStatus.putIfAbsent(status.name(), 0L);
        }

        return new DashboardStatsDto(
                studentRepository.count(),
                companyRepository.count(),
                jobRepository.count(),
                applicationRepository.count(),
                placementRepository.count(),
                byStatus
        );
    }

}
