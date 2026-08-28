package com.campusplacement.portal.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusplacement.portal.dto.StudentDto;
import com.campusplacement.portal.entity.Student;
import com.campusplacement.portal.exception.DuplicateResourceException;
import com.campusplacement.portal.exception.ResourceNotFoundException;
import com.campusplacement.portal.repository.StudentRepository;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Student findById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
    }

    public Student create(StudentDto dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("A student with this email already exists: " + dto.getEmail());
        }
        Student student = new Student();
        applyDto(student, dto);
        return studentRepository.save(student);
    }

    public Student update(Long id, StudentDto dto) {
        Student student = findById(id);
        if (!student.getEmail().equals(dto.getEmail()) && studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("A student with this email already exists: " + dto.getEmail());
        }
        applyDto(student, dto);
        return studentRepository.save(student);
    }

    public void delete(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found: " + id);
        }
        studentRepository.deleteById(id);
    }

    private void applyDto(Student student, StudentDto dto) {
        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setPhone(dto.getPhone());
        student.setRollNumber(dto.getRollNumber());
        student.setBranch(dto.getBranch());
        student.setGraduationYear(dto.getGraduationYear());
        student.setCgpa(dto.getCgpa());
        student.setBacklogs(dto.getBacklogs() != null ? dto.getBacklogs() : 0);
        student.setSkills(dto.getSkills() != null ? dto.getSkills() : student.getSkills());
        student.setResumeUrl(dto.getResumeUrl());
    }

}
