package com.management.smartclass.services;

import com.management.smartclass.Repos.CurriculumRepo;
import com.management.smartclass.models.Curriculum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CurriculumService {
    @Autowired
    private CurriculumRepo curriculumRepo;

    public Curriculum addCurriculum(Curriculum curriculum) {
        return curriculumRepo.save(curriculum);
    }

    public List<Curriculum> getAll() {
        return curriculumRepo.findAll();
    }

    public List<Curriculum> getByDeptAndSemester(String dept, int semester) {
        return curriculumRepo.findByDeptAndSemester(dept, semester);
    }
}
