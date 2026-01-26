package com.management.smartclass.controllers;

import com.management.smartclass.payload.TimeTableGridDTO;
import com.management.smartclass.services.DEOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/deo")
@PreAuthorize("hasRole('DEO')")
public class DEOController {

    @Autowired
    private DEOService deoService;

    @PostMapping("/post-timetable")
    public ResponseEntity<String> saveTimetable(
            @RequestBody TimeTableGridDTO dto) {

        return ResponseEntity.ok(
                deoService.saveGridTimetable(dto)
        );
    }
}

