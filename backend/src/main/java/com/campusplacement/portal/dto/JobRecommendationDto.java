package com.campusplacement.portal.dto;

import com.campusplacement.portal.entity.Job;

public class JobRecommendationDto {

    private Job job;
    private double matchScore; // 0..1, skill overlap between student and job
    private boolean eligible;

    public JobRecommendationDto(Job job, double matchScore, boolean eligible) {
        this.job = job;
        this.matchScore = matchScore;
        this.eligible = eligible;
    }

    public Job getJob() {
        return job;
    }

    public double getMatchScore() {
        return matchScore;
    }

    public boolean isEligible() {
        return eligible;
    }

}
