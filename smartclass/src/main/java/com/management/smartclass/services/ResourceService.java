package com.management.smartclass.services;

import com.management.smartclass.Repos.ResourceRepo;
import com.management.smartclass.models.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {
    @Autowired
    private ResourceRepo resourceRepo;

    public Resource addResource(Resource resource) {
        return resourceRepo.save(resource);
    }

    public List<Resource> getBySubject(String subjectCode) {
        return resourceRepo.findBySubjectCode(subjectCode);
    }

    public List<Resource> getByFaculty(String email) {
        return resourceRepo.findByFacultyEmail(email);
    }
}
