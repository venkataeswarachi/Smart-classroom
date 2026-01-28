package com.management.smartclass.controllers;

import com.management.smartclass.models.Curriculum;
import com.management.smartclass.services.CurriculumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/curriculum")
public class CurriculumController {
    @Autowired
    private CurriculumService curriculumService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DEPT_ADMIN')")
    public ResponseEntity<Curriculum> addCurriculum(@RequestBody Curriculum curriculum) {
        return ResponseEntity.ok(curriculumService.addCurriculum(curriculum));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Curriculum>> getAll() {
        return ResponseEntity.ok(curriculumService.getAll());
    }

    @GetMapping("/student/view")
    public ResponseEntity<List<Curriculum>> getForStudent(
            @RequestParam String dept, @RequestParam int semester) {
        return ResponseEntity.ok(curriculumService.getByDeptAndSemester(dept, semester));
    }
}
