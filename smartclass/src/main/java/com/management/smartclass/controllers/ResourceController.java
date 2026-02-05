package com.management.smartclass.controllers;

import com.management.smartclass.models.FacultyResource;
import com.management.smartclass.payload.FacultyResourceMetaDTO;
import com.management.smartclass.services.ResourcesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/faculty/resources")
public class ResourceController {

    @Autowired
    private ResourcesService service;

    // Upload PDF
    @PostMapping("/upload")
    public ResponseEntity<FacultyResource> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("subject") String subject,
            Authentication auth
    ) throws IOException {
        String facultyUsername = auth.getName();

        return ResponseEntity.ok(
                service.uploadPdf(file, subject, facultyUsername)
        );
    }

    // View own uploaded PDFs
    @GetMapping("/my-uploads")
    public ResponseEntity<List<FacultyResourceMetaDTO>> listMetadata(
            Authentication auth
    ) {
        return ResponseEntity.ok(
                service.getMyResourceMetadata(auth.getName())
        );
    }

    // 2️⃣ VIEW PDF BY ID
    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewPdf(@PathVariable Long id)
            throws IOException {

        FacultyResource resource = service.getResourceById(id);

        FileSystemResource file =
                new FileSystemResource(resource.getFilePath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }
    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<FacultyResourceMetaDTO>> bySubject(
            @PathVariable String subject
    ) {
        return ResponseEntity.ok(
                service.getAllResourcesBySubject(subject)
        );
    }
    @GetMapping("/view/all")
    public ResponseEntity<List<FacultyResourceMetaDTO>> viewAll(){
        return ResponseEntity.ok(service.getAllResources());
    }
}
