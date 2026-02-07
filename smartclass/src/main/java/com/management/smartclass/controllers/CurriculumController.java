package com.management.smartclass.controllers;

import com.management.smartclass.models.Curriculum;
import com.management.smartclass.services.CurriculumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/curriculum")
public class CurriculumController {
    @Autowired
    private CurriculumService curriculumService;

    @PostMapping("/add")
    //@PreAuthorize("hasRole('DEO') or hasRole('DEPT_ADMIN')")
    public ResponseEntity<String> addCurriculum(@RequestParam int year, @RequestParam int semester, @RequestParam MultipartFile file,Authentication auth) throws IOException {
        return ResponseEntity.ok(curriculumService.uploadCurriculam(file,year,semester, auth.getName()));
    }


}
