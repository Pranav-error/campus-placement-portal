package com.campusplacement.portal.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.campusplacement.portal.security.JwtAuthFilter;

/**
 * JWT-based stateless security.
 *
 * Access model:
 *  - /api/auth/**            public (register/login)
 *  - /api/health             public
 *  - GET on students/companies/jobs/applications/placements  public read (demo-friendly browsing)
 *  - All writes (POST/PUT/DELETE) on students/companies/jobs/placements  require TPO role
 *    (the placement cell manages these records)
 *  - Applications: creating one requires an authenticated user (STUDENT or TPO);
 *    status updates require TPO. Enforced with @PreAuthorize in the controller
 *    where per-request nuance is needed.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins:}")
    private String extraAllowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/complete-profile").authenticated()
                        .requestMatchers("/api/auth/**", "/api/health", "/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/companies/**", "/api/jobs/**", "/api/placements/**", "/api/students/**").hasRole("TPO")
                        .requestMatchers(HttpMethod.PUT, "/api/companies/**", "/api/jobs/**", "/api/placements/**", "/api/students/**").hasRole("TPO")
                        .requestMatchers(HttpMethod.DELETE, "/api/companies/**", "/api/jobs/**", "/api/placements/**", "/api/students/**").hasRole("TPO")
                        .anyRequest().authenticated())
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // allow H2 console frame in dev
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        List<String> origins = new ArrayList<>(List.of(
                "http://localhost:4200",
                "https://*.vercel.app",
                "https://*.up.railway.app"));
        if (extraAllowedOrigins != null && !extraAllowedOrigins.isBlank()) {
            origins.addAll(Arrays.asList(extraAllowedOrigins.split(",")));
        }
        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

}
