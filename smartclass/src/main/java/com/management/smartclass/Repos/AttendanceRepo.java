package com.management.smartclass.Repos;

import com.management.smartclass.models.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepo extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentEmailAndDate(
            String email, LocalDate date);

    List<Attendance> findByStudentEmailAndSemester(
            String email, int semester);

    List<Attendance> findByStudentEmailAndSubjectCode(
            String email, String subjectCode);
    List<Attendance> findByStudentEmailAndDateBetween(
            String studentEmail,
            LocalDate startDate,
            LocalDate endDate
    );
    Optional<Attendance> findByStudentEmailAndSubjectCodeAndDate(
            String studentEmail,
            String subjectCode,
            LocalDate date
    );

}

