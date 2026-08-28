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

import com.campusplacement.portal.dto.PlacementDto;
import com.campusplacement.portal.entity.Placement;
import com.campusplacement.portal.service.PlacementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/placements")
public class PlacementController {

    private final PlacementService placementService;

    public PlacementController(PlacementService placementService) {
        this.placementService = placementService;
    }

    @GetMapping
    public List<Placement> getAll() {
        return placementService.findAll();
    }

    @GetMapping("/{id}")
    public Placement getById(@PathVariable Long id) {
        return placementService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Placement> create(@Valid @RequestBody PlacementDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(placementService.create(dto));
    }

    @PutMapping("/{id}")
    public Placement update(@PathVariable Long id, @Valid @RequestBody PlacementDto dto) {
        return placementService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        placementService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
