package com.campusplacement.portal.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusplacement.portal.dto.PlacementDto;
import com.campusplacement.portal.entity.ApplicationStatus;
import com.campusplacement.portal.entity.JobApplication;
import com.campusplacement.portal.entity.Placement;
import com.campusplacement.portal.exception.DuplicateResourceException;
import com.campusplacement.portal.exception.ResourceNotFoundException;
import com.campusplacement.portal.repository.JobApplicationRepository;
import com.campusplacement.portal.repository.PlacementRepository;

@Service
@Transactional
public class PlacementService {

    private final PlacementRepository placementRepository;
    private final JobApplicationRepository applicationRepository;

    public PlacementService(PlacementRepository placementRepository, JobApplicationRepository applicationRepository) {
        this.placementRepository = placementRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public List<Placement> findAll() {
        return placementRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Placement findById(Long id) {
        return placementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Placement not found: " + id));
    }

    public Placement create(PlacementDto dto) {
        JobApplication application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + dto.getApplicationId()));

        if (placementRepository.existsByApplicationId(application.getId())) {
            throw new DuplicateResourceException("A placement record already exists for this application");
        }

        // Recording a placement implies the application resulted in an offer.
        application.setStatus(ApplicationStatus.OFFERED);
        applicationRepository.save(application);

        Placement placement = new Placement();
        placement.setApplication(application);
        applyDto(placement, dto);
        return placementRepository.save(placement);
    }

    public Placement update(Long id, PlacementDto dto) {
        Placement placement = findById(id);
        applyDto(placement, dto);
        return placementRepository.save(placement);
    }

    public void delete(Long id) {
        if (!placementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Placement not found: " + id);
        }
        placementRepository.deleteById(id);
    }

    private void applyDto(Placement placement, PlacementDto dto) {
        placement.setPackageLpa(dto.getPackageLpa());
        placement.setOfferDate(dto.getOfferDate());
        placement.setJoiningDate(dto.getJoiningDate());
    }

}
