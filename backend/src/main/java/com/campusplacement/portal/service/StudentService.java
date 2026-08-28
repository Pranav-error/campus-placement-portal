package com.campusplacement.portal.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.campusplacement.portal.dto.BulkImportResult;
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

    /**
     * Bulk-imports students from a CSV file. Expected header (order-sensitive, no
     * quoted commas): name,email,phone,rollNumber,branch,graduationYear,cgpa,backlogs,skills
     * — skills within a row are pipe-separated (e.g. "Java|React|SQL"). Rows with a
     * duplicate email or a malformed cgpa/backlogs/graduationYear are skipped and
     * reported back rather than failing the whole import.
     */
    public BulkImportResult bulkImport(MultipartFile file) {
        int imported = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line = reader.readLine(); // header
            int rowNum = 1;

            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (line.isBlank()) continue;

                String[] cols = line.split(",", -1);
                if (cols.length < 2 || cols[0].isBlank() || cols[1].isBlank()) {
                    errors.add("Row " + rowNum + ": name and email are required");
                    skipped++;
                    continue;
                }

                String email = cols[1].trim();
                if (studentRepository.existsByEmail(email)) {
                    errors.add("Row " + rowNum + ": email already exists (" + email + ")");
                    skipped++;
                    continue;
                }

                try {
                    Student student = new Student();
                    student.setName(cols[0].trim());
                    student.setEmail(email);
                    student.setPhone(col(cols, 2));
                    student.setRollNumber(col(cols, 3));
                    student.setBranch(col(cols, 4));
                    student.setGraduationYear(intOrNull(col(cols, 5)));
                    student.setCgpa(doubleOrNull(col(cols, 6)));
                    Integer backlogs = intOrNull(col(cols, 7));
                    student.setBacklogs(backlogs != null ? backlogs : 0);
                    student.setSkills(skillsFrom(col(cols, 8)));

                    studentRepository.save(student);
                    imported++;
                } catch (Exception e) {
                    errors.add("Row " + rowNum + ": " + e.getMessage());
                    skipped++;
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not read CSV file: " + e.getMessage(), e);
        }

        return new BulkImportResult(imported, skipped, errors);
    }

    private String col(String[] cols, int i) {
        return i < cols.length ? cols[i].trim() : null;
    }

    private Integer intOrNull(String s) {
        return (s == null || s.isBlank()) ? null : Integer.valueOf(s);
    }

    private Double doubleOrNull(String s) {
        return (s == null || s.isBlank()) ? null : Double.valueOf(s);
    }

    private Set<String> skillsFrom(String s) {
        if (s == null || s.isBlank()) return new HashSet<>();
        return new HashSet<>(Arrays.asList(s.split("\\|")));
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
