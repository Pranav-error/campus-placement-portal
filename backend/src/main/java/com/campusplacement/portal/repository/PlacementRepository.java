package com.campusplacement.portal.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusplacement.portal.entity.Placement;

public interface PlacementRepository extends JpaRepository<Placement, Long> {

    boolean existsByApplicationId(Long applicationId);

}
