package com.campusplacement.portal.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusplacement.portal.dto.JobDto;
import com.campusplacement.portal.entity.Company;
import com.campusplacement.portal.entity.Job;
import com.campusplacement.portal.entity.Student;
import com.campusplacement.portal.exception.ResourceNotFoundException;
import com.campusplacement.portal.repository.CompanyRepository;
import com.campusplacement.portal.repository.JobRepository;

@Service
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    public JobService(JobRepository jobRepository, CompanyRepository companyRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public List<Job> findAll() {
        return jobRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Job findById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
    }

    public Job create(JobDto dto) {
        Job job = new Job();
        applyDto(job, dto);
        return jobRepository.save(job);
    }

    public Job update(Long id, JobDto dto) {
        Job job = findById(id);
        applyDto(job, dto);
        return jobRepository.save(job);
    }

    public void delete(Long id) {
        if (!jobRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job not found: " + id);
        }
        jobRepository.deleteById(id);
    }

    /** Whether a student meets a job's eligibility criteria (CGPA, backlogs, branch, graduation year). */
    public boolean isEligible(Student student, Job job) {
        if (job.getMinCgpa() != null && (student.getCgpa() == null || student.getCgpa() < job.getMinCgpa())) {
            return false;
        }
        if (job.getMaxBacklogs() != null) {
            int backlogs = student.getBacklogs() != null ? student.getBacklogs() : 0;
            if (backlogs > job.getMaxBacklogs()) {
                return false;
            }
        }
        if (job.getEligibleBranches() != null && !job.getEligibleBranches().isEmpty()) {
            if (student.getBranch() == null || !job.getEligibleBranches().contains(student.getBranch())) {
                return false;
            }
        }
        if (job.getEligibleGraduationYear() != null) {
            if (student.getGraduationYear() == null || !student.getGraduationYear().equals(job.getEligibleGraduationYear())) {
                return false;
            }
        }
        return true;
    }

    private void applyDto(Job job, JobDto dto) {
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + dto.getCompanyId()));

        job.setCompany(company);
        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setCtcLpa(dto.getCtcLpa());
        job.setOpenings(dto.getOpenings() != null ? dto.getOpenings() : 1);
        job.setApplicationDeadline(dto.getApplicationDeadline());
        job.setMinCgpa(dto.getMinCgpa());
        job.setMaxBacklogs(dto.getMaxBacklogs());
        job.setEligibleBranches(dto.getEligibleBranches() != null ? dto.getEligibleBranches() : job.getEligibleBranches());
        job.setEligibleGraduationYear(dto.getEligibleGraduationYear());
        job.setRequiredSkills(dto.getRequiredSkills() != null ? dto.getRequiredSkills() : job.getRequiredSkills());
    }

}
