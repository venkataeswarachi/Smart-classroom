package com.management.smartclass.services;

import com.management.smartclass.Repos.FacultyResourceRepo;
import com.management.smartclass.models.FacultyResource;
import com.management.smartclass.payload.FacultyResourceMetaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Service
public class ResourcesService {
    private static final String UPLOAD_DIR = "uploads/faculty/";

    @Autowired
    private FacultyResourceRepo repository;

    public FacultyResource uploadPdf(
            MultipartFile file,
            String subject,
            String facultyUsername
    ) throws IOException {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new RuntimeException("Only PDF files are allowed");
        }

        // Base directory (change once, works everywhere)
        Path baseDir = Paths.get("/uploads/faculty", facultyUsername);

        // ✅ Create directories if not exists
        Files.createDirectories(baseDir);

        // Unique stored filename
        String storedFilename =
                UUID.randomUUID() + "_" + file.getOriginalFilename();

        Path filePath = baseDir.resolve(storedFilename);

        // ✅ Copy file
        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        // Save metadata
        FacultyResource resource = new FacultyResource();
        resource.setFileName(file.getOriginalFilename());
        resource.setFileType(file.getContentType());
        resource.setFilePath(filePath.toAbsolutePath().toString());
        resource.setFileSize(file.getSize());
        resource.setSubject(subject);
        resource.setUploadedBy(facultyUsername);
        resource.setUploadedAt(LocalDateTime.now());

        return repository.save(resource);
    }

    public List<FacultyResourceMetaDTO> getMyResourceMetadata(String faculty) {
        return repository.findByUploadedBy(faculty)
                .stream()
                .map(r -> {
                    FacultyResourceMetaDTO dto = new FacultyResourceMetaDTO();
                    dto.setId(r.getId());
                    dto.setFileName(r.getFileName());
                    dto.setSubject(r.getSubject());
                    dto.setFileSize(r.getFileSize());
                    dto.setUploadedAt(r.getUploadedAt());
                    dto.setUploadedBy(r.getUploadedBy());
                    return dto;
                })
                .toList();
    }


    public FacultyResource getResourceById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
    }
    public List<FacultyResourceMetaDTO> getAllResourcesBySubject(String subject) {
        return repository.findBySubjectIgnoreCase(subject)
                .stream()
                .map(r -> {
                    FacultyResourceMetaDTO dto = new FacultyResourceMetaDTO();
                    dto.setId(r.getId());
                    dto.setFileName(r.getFileName());
                    dto.setSubject(r.getSubject());
                    dto.setFileSize(r.getFileSize());
                    dto.setUploadedAt(r.getUploadedAt());
                    dto.setUploadedBy(r.getUploadedBy());
                    return dto;
                })
                .toList();
    }
    public List<FacultyResourceMetaDTO> getAllResources(){
        return repository.findAll()
                .stream()
                .map(r->{
                    FacultyResourceMetaDTO dto = new FacultyResourceMetaDTO();
                    dto.setId(r.getId());
                    dto.setFileName(r.getFileName());
                    dto.setSubject(r.getSubject());
                    dto.setFileSize(r.getFileSize());
                    dto.setUploadedAt(r.getUploadedAt());
                    dto.setUploadedBy(r.getUploadedBy());
                    return dto;
                })
                .toList();
    }
}
