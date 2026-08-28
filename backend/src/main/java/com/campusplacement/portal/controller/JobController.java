package com.campusplacement.portal.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusplacement.portal.dto.JobDto;
import com.campusplacement.portal.entity.Job;
import com.campusplacement.portal.service.JobService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public List<Job> getAll() {
        return jobService.findAll();
    }

    @GetMapping("/{id}")
    public Job getById(@PathVariable Long id) {
        return jobService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Job> create(@Valid @RequestBody JobDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.create(dto));
    }

    @PutMapping("/{id}")
    public Job update(@PathVariable Long id, @Valid @RequestBody JobDto dto) {
        return jobService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
