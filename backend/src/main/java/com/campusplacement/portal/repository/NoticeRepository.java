package com.campusplacement.portal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusplacement.portal.entity.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    List<Notice> findAllByOrderByCreatedAtDesc();

}
