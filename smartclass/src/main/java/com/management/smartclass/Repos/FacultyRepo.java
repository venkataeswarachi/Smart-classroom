package com.management.smartclass.Repos;

import com.management.smartclass.models.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepo extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByEmail(String email);
}
