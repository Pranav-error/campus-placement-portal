package com.campusplacement.portal.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusplacement.portal.dto.CompanyDto;
import com.campusplacement.portal.entity.Company;
import com.campusplacement.portal.exception.ResourceNotFoundException;
import com.campusplacement.portal.repository.CompanyRepository;

@Service
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public List<Company> findAll() {
        return companyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Company findById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
    }

    public Company create(CompanyDto dto) {
        Company company = new Company();
        applyDto(company, dto);
        return companyRepository.save(company);
    }

    public Company update(Long id, CompanyDto dto) {
        Company company = findById(id);
        applyDto(company, dto);
        return companyRepository.save(company);
    }

    public void delete(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found: " + id);
        }
        companyRepository.deleteById(id);
    }

    private void applyDto(Company company, CompanyDto dto) {
        company.setName(dto.getName());
        company.setIndustry(dto.getIndustry());
        company.setWebsite(dto.getWebsite());
        company.setDescription(dto.getDescription());
        company.setContactEmail(dto.getContactEmail());
    }

}
