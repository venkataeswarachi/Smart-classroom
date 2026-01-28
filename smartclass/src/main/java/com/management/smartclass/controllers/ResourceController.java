package com.management.smartclass.controllers;

import com.management.smartclass.models.Resource;
import com.management.smartclass.services.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resource")
public class ResourceController {
    @Autowired
    private ResourceService resourceService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Resource> uploadResource(@RequestBody Resource resource, Authentication auth) {
        resource.setFacultyEmail(auth.getName());
        return ResponseEntity.ok(resourceService.addResource(resource));
    }

    @GetMapping("/subject/{code}")
    public ResponseEntity<List<Resource>> getBySubject(@PathVariable String code) {
        return ResponseEntity.ok(resourceService.getBySubject(code));
    }
}
