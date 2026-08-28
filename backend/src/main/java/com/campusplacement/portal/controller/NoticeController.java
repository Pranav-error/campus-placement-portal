package com.campusplacement.portal.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusplacement.portal.dto.NoticeDto;
import com.campusplacement.portal.entity.Notice;
import com.campusplacement.portal.exception.ResourceNotFoundException;
import com.campusplacement.portal.repository.NoticeRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeRepository noticeRepository;

    public NoticeController(NoticeRepository noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    @GetMapping
    public List<Notice> getAll() {
        return noticeRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<Notice> create(@Valid @RequestBody NoticeDto dto, Authentication auth) {
        Notice notice = new Notice();
        notice.setTitle(dto.getTitle());
        notice.setBody(dto.getBody());
        notice.setPostedBy(auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(noticeRepository.save(notice));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notice not found: " + id);
        }
        noticeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
