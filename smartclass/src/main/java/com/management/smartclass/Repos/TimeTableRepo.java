package com.management.smartclass.Repos;

import com.management.smartclass.models.TimeTableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeTableRepo extends JpaRepository<TimeTableSlot, Long> {
        List<TimeTableSlot> findByFacultyEmailAndDayOrderByStartTime(
                        String facultyEmail,
                        String day);

        List<TimeTableSlot> findByDeptAndSectionAndSemesterOrderByDayAscStartTimeAsc(
                        String dept,
                        String section,
                        int semester);

        List<TimeTableSlot> findByDeptAndSectionAndSemesterAndDayOrderByStartTime(
                        String dept,
                        String section,
                        int semester,
                        String day);

        List<TimeTableSlot> findByFacultyEmail(String facultyEmail);
}
