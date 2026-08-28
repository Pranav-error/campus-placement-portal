package com.campusplacement.portal.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campusplacement.portal.dto.JobRecommendationDto;
import com.campusplacement.portal.service.RecommendationService;

@RestController
@RequestMapping("/api/students/{studentId}/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public List<JobRecommendationDto> recommend(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "5") int limit) {
        return recommendationService.recommendFor(studentId, limit);
    }

}
