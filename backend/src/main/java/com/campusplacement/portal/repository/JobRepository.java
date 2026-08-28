package com.campusplacement.portal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusplacement.portal.entity.Job;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByCompanyId(Long companyId);

}
