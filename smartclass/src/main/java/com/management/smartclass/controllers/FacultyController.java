package com.management.smartclass.controllers;

import com.management.smartclass.models.Faculty;
import com.management.smartclass.payload.FacultyPeriodDTO;
import com.management.smartclass.payload.FacultyProfileDTO;
import com.management.smartclass.payload.QrGenerateDTO;
import com.management.smartclass.services.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faculty")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {
    @Autowired
    private FacultyService facultyService;

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
}
