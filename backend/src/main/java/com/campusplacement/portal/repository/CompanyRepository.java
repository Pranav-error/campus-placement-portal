package com.campusplacement.portal.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusplacement.portal.entity.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}
