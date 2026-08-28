package com.campusplacement.portal.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusplacement.portal.dto.ApplicationRequest;
import com.campusplacement.portal.entity.Job;
import com.campusplacement.portal.entity.JobApplication;
import com.campusplacement.portal.entity.Student;
import com.campusplacement.portal.exception.DuplicateResourceException;
import com.campusplacement.portal.entity.ApplicationStatus;
import com.campusplacement.portal.exception.NotEligibleException;
import com.campusplacement.portal.exception.ResourceNotFoundException;
import com.campusplacement.portal.repository.JobApplicationRepository;
import com.campusplacement.portal.repository.JobRepository;
import com.campusplacement.portal.repository.StudentRepository;

@Service
@Transactional
public class ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;

    public ApplicationService(
            JobApplicationRepository applicationRepository,
            StudentRepository studentRepository,
            JobRepository jobRepository,
            JobService jobService) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.jobService = jobService;
    }

    @Transactional(readOnly = true)
    public List<JobApplication> findAll() {
        return applicationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public JobApplication findById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<JobApplication> findByStudent(Long studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public List<JobApplication> findByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public JobApplication apply(ApplicationRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + request.getStudentId()));
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.getJobId()));

        if (applicationRepository.existsByStudentIdAndJobId(student.getId(), job.getId())) {
            throw new DuplicateResourceException("Student has already applied to this job");
        }
        if (!jobService.isEligible(student, job)) {
            throw new NotEligibleException("Student does not meet the eligibility criteria for this job");
        }

        JobApplication application = new JobApplication();
        application.setStudent(student);
        application.setJob(job);
        return applicationRepository.save(application);
    }

    public JobApplication updateStatus(Long id, ApplicationStatus status) {
        JobApplication application = findById(id);
        application.setStatus(status);
        application.setUpdatedAt(java.time.Instant.now());
        return applicationRepository.save(application);
    }

    public void withdraw(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found: " + id);
        }
        applicationRepository.deleteById(id);
    }

}
