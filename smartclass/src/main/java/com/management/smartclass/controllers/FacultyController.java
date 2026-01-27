package com.management.smartclass.controllers;

import com.management.smartclass.models.Faculty;
import com.management.smartclass.payload.*;
import com.management.smartclass.services.AttendanceService;
import com.management.smartclass.services.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/faculty")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {
    @Autowired
    private FacultyService facultyService;
    @Autowired
    private AttendanceService attendanceService;
    @GetMapping("/profile")
    public ResponseEntity<Faculty> viewProfile(Authentication auth) {
        return ResponseEntity.ok(
                facultyService.getProfile(auth.getName())
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<Faculty> editProfile(
            Authentication auth,
            @RequestBody FacultyProfileDTO dto) {

        return ResponseEntity.ok(
                facultyService.updateProfile(auth.getName(), dto)
        );
    }

    @GetMapping("/today")
    public ResponseEntity<List<FacultyPeriodDTO>> getToday(
            Authentication auth) {

        return ResponseEntity.ok(
                facultyService.getTodayTimetable(auth.getName())
        );
    }

    // perticlar DAY
    @GetMapping("/day/{day}")
    public ResponseEntity<List<FacultyPeriodDTO>> getByDay(
            @PathVariable String day,
            Authentication auth) {

        return ResponseEntity.ok(
                facultyService.getTimetableByDay(
                        auth.getName(),
                        day
                )
        );
    }
    @PostMapping("/generate-qr")
    public ResponseEntity<String> generateQr(
            @RequestBody QrGenerateDTO dto,
            Authentication auth) {

        return ResponseEntity.ok(
                facultyService.generateQr(dto, auth.getName())
        );
    }
    @GetMapping("/session")
    public ResponseEntity<List<FacultyAttendanceViewDTO>> getSession(
            Authentication auth,
            @RequestParam String subjectCode,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String dept,
            @RequestParam String section,
            @RequestParam int semester) {

        return ResponseEntity.ok(
                attendanceService.getSessionAttendance(
                        auth.getName(),
                        subjectCode,
                        LocalDate.parse(date),
                        LocalTime.parse(startTime),
                        dept,
                        section,
                        semester
                )
        );
    }
    @PutMapping("/update")
    public ResponseEntity<String> updateAttendance(
            Authentication auth,
            @RequestParam String subjectCode,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestBody FacultyAttendanceUpdateDTO dto) {

        attendanceService.updateAttendance(
                auth.getName(),
                subjectCode,
                LocalDate.parse(date),
                LocalTime.parse(startTime),
                dto
        );

        return ResponseEntity.ok("Attendance updated");
    }
}
