package com.management.smartclass.Repos;

import com.management.smartclass.models.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepo extends JpaRepository<Resource, Long> {
    List<Resource> findBySubjectCode(String subjectCode);

    List<Resource> findByFacultyEmail(String facultyEmail);
}
