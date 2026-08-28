package com.campusplacement.portal.service;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.campusplacement.portal.dto.JobRecommendationDto;
import com.campusplacement.portal.entity.Job;
import com.campusplacement.portal.entity.Student;
import com.campusplacement.portal.repository.JobRepository;
import com.campusplacement.portal.repository.StudentRepository;

/**
 * Simple content-based recommender: ranks open jobs for a student by the
 * Jaccard similarity between the student's skills and each job's required
 * skills, case-insensitively. No ML model/training data involved — this is
 * the "AI-assisted recommendation" feature called out in the brief, kept
 * transparent and dependency-free.
 */
@Service
public class RecommendationService {

    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;

    public RecommendationService(StudentRepository studentRepository, JobRepository jobRepository, JobService jobService) {
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.jobService = jobService;
    }

    public List<JobRecommendationDto> recommendFor(Long studentId, int limit) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new com.campusplacement.portal.exception.ResourceNotFoundException(
                        "Student not found: " + studentId));

        Set<String> studentSkills = normalize(student.getSkills());

        return jobRepository.findAll().stream()
                .map(job -> new JobRecommendationDto(
                        job,
                        similarity(studentSkills, normalize(job.getRequiredSkills())),
                        jobService.isEligible(student, job)))
                .sorted(Comparator
                        .comparing(JobRecommendationDto::isEligible).reversed()
                        .thenComparing(Comparator.comparingDouble(JobRecommendationDto::getMatchScore).reversed()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private Set<String> normalize(Set<String> skills) {
        if (skills == null) return Set.of();
        return skills.stream().map(s -> s.trim().toLowerCase()).collect(Collectors.toSet());
    }

    private double similarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

}
