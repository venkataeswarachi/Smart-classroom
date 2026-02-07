package com.management.smartclass.Repos;

import com.management.smartclass.models.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CurriculumRepo extends JpaRepository<Curriculum, Long> {

}
