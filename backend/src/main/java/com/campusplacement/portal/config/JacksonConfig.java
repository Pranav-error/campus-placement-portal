package com.campusplacement.portal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;

@Configuration
public class JacksonConfig {

    /**
     * Lets Jackson serialize Hibernate lazy-loaded associations (e.g. Job.company,
     * JobApplication.student/job) without hitting ByteBuddyInterceptor errors, and
     * without forcing every relation to FetchType.EAGER.
     */
    @Bean
    public Hibernate6Module hibernate6Module() {
        Hibernate6Module module = new Hibernate6Module();
        module.enable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        return module;
    }

}
