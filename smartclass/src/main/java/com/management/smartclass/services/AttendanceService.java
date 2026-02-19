package com.management.smartclass.services;

import com.management.smartclass.Repos.AttendanceRepo;
import com.management.smartclass.Repos.QrSessionRepo;
import com.management.smartclass.Repos.StudentRepo;
import com.management.smartclass.Repos.TimeTableRepo;
import com.management.smartclass.models.Attendance;
import com.management.smartclass.models.QrSession;
import com.management.smartclass.models.Students;
import com.management.smartclass.models.TimeTableSlot;
import com.management.smartclass.payload.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

        @Autowired
        private QrSessionRepo qrRepo;

        @Autowired
        private AttendanceRepo attendanceRepo;
        @Autowired
        private StudentRepo studentRepo;
        @Autowired
        private TimeTableRepo timeTableRepo;

        // ---------------- QR ATTENDANCE ----------------
        public String markAttendance(String token, String studentEmail) {

                QrSession qr = qrRepo.findByToken(token)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                "Invalid or expired QR code"));

                if (qr.getExpiresAt().isBefore(LocalDateTime.now())) {
                        throw new ResponseStatusException(HttpStatus.GONE,
                                        "QR code has expired. Ask your faculty to generate a new one.");
                }

                boolean alreadyMarked = attendanceRepo.existsByStudentEmailAndSubjectCodeAndDateAndStartTime(
                                studentEmail,
                                qr.getSubjectCode(),
                                LocalDate.now(),
                                qr.getStartTime());

                if (alreadyMarked) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "Attendance already marked for this period");
                }

                Attendance att = new Attendance();
                att.setStudentEmail(studentEmail);
                att.setSubjectCode(qr.getSubjectCode());
                att.setSubjectName(qr.getSubjectName());
                att.setFacultyEmail(qr.getFacultyEmail());
                att.setDept(qr.getDept());
                att.setSection(qr.getSection());
                att.setSemester(qr.getSemester());
                att.setDate(LocalDate.now());
                att.setPresent(true);
                att.setStartTime(qr.getStartTime());
                att.setEndTime(qr.getEndTime());
                attendanceRepo.save(att);
                return "Attendance marked";
        }

        // ---------------- DAILY ATTENDANCE BHAI ----------------
        public List<DailyAttendanceDTO> getDailyAttendance(
                        String studentEmail, LocalDate date) {

                Students student = studentRepo.findByEmail(studentEmail)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                String day = date.getDayOfWeek().name();
                LocalDate today = LocalDate.now();
                LocalTime now = LocalTime.now();

                List<TimeTableSlot> slots = timeTableRepo.findByDeptAndSectionAndSemesterAndDayOrderByStartTime(
                                student.getDept(),
                                student.getSection(),
                                student.getSemester(),
                                day);

                return slots.stream().map(slot -> {

                        DailyAttendanceDTO dto = new DailyAttendanceDTO();
                        dto.setStartTime(slot.getStartTime().toString());
                        dto.setEndTime(slot.getEndTime().toString());
                        dto.setSubjectCode(slot.getSubjectCode());
                        dto.setSubjectName(slot.getSubjectName());
                        dto.setBreak(slot.isBreak());

                        // 🟨 BREAK
                        if (slot.isBreak()) {
                                dto.setStatus("BREAK");
                                return dto;
                        }

                        boolean attendanceExists = attendanceRepo
                                        .findByStudentEmailAndSubjectCodeAndDateAndStartTime(
                                                        studentEmail,
                                                        slot.getSubjectCode(),
                                                        date,
                                                        slot.getStartTime())
                                        .isPresent();

                        if (attendanceExists) {
                                dto.setStatus("PRESENT");
                        } else if (date.equals(today) && now.isBefore(slot.getEndTime())) {
                                dto.setStatus("NOT_MARKED");
                        } else {
                                dto.setStatus("ABSENT");
                        }

                        return dto;
                }).toList();
        }

        // ---------------- SUBJECT-WISE BHAI----------------
        public long getSubjectAttendance(
                        String studentEmail, String subjectCode) {

                return attendanceRepo
                                .findByStudentEmailAndSubjectCode(studentEmail, subjectCode)
                                .stream()
                                .filter(Attendance::isPresent)
                                .count();
        }

        // ---------------- SEMESTER TOTAL BHAI----------------
        public long getSemesterAttendance(
                        String studentEmail, int semester) {

                return attendanceRepo
                                .findByStudentEmailAndSemester(studentEmail, semester)
                                .stream()
                                .filter(Attendance::isPresent)
                                .count();
        }

        public SemesterAttendanceDTO getSemesterAttendancePercentage(
                        String studentEmail, int semester) {

                List<Attendance> records = attendanceRepo.findByStudentEmailAndSemester(
                                studentEmail, semester);

                long totalClasses = records.size();
                long presentClasses = records.stream()
                                .filter(Attendance::isPresent)
                                .count();

                double percentage = totalClasses == 0
                                ? 0.0
                                : (presentClasses * 100.0) / totalClasses;

                SemesterAttendanceDTO dto = new SemesterAttendanceDTO();
                dto.setSemester(semester);
                dto.setTotalClasses(totalClasses);
                dto.setPresentClasses(presentClasses);
                dto.setPercentage(
                                Math.round(percentage * 100.0) / 100.0 // 2 decimals
                );

                return dto;
        }

        // ---------------- MAPPER ----------------
        private AttendanceDTO mapToDTO(Attendance attendance) {

                AttendanceDTO dto = new AttendanceDTO();
                dto.setDate(attendance.getDate());
                dto.setSubjectCode(attendance.getSubjectCode());
                dto.setPresent(attendance.isPresent());

                return dto;
        }

        public List<MonthlyAttendanceDTO> getMonthlyAttendance(
                        String studentEmail,
                        int year,
                        int month) {

                LocalDate startDate = LocalDate.of(year, month, 1);
                LocalDate endDate = startDate.withDayOfMonth(
                                startDate.lengthOfMonth());

                return attendanceRepo
                                .findByStudentEmailAndDateBetween(
                                                studentEmail,
                                                startDate,
                                                endDate)
                                .stream()
                                .map(this::mapToMonthlyDTO)
                                .toList();
        }

        // ---------------- MAPPER ----------------
        private MonthlyAttendanceDTO mapToMonthlyDTO(Attendance attendance) {

                MonthlyAttendanceDTO dto = new MonthlyAttendanceDTO();
                dto.setDate(attendance.getDate());
                dto.setSubjectCode(attendance.getSubjectCode());
                dto.setPresent(attendance.isPresent());
                return dto;
        }

        // ---------------- MANUAL & CLASS ATTENDANCE ----------------
        public String manualAttendance(String studentEmail, String subjectCode, LocalDate date, LocalTime startTime,
                        boolean present, String facultyEmail) {

                java.util.Optional<Attendance> existing = attendanceRepo
                                .findByStudentEmailAndSubjectCodeAndDateAndStartTime(
                                                studentEmail, subjectCode, date, startTime);

                if (existing.isPresent()) {
                        Attendance att = existing.get();
                        att.setPresent(present);
                        attendanceRepo.save(att);
                        return "Updated";
                }

                Students student = studentRepo.findByEmail(studentEmail)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Student not found: " + studentEmail));

                // Look up the timetable slot to fill in subjectName and endTime
                List<TimeTableSlot> slots = timeTableRepo.findByDeptAndSectionAndSemesterAndDayOrderByStartTime(
                                student.getDept(), student.getSection(), student.getSemester(),
                                date.getDayOfWeek().name());
                TimeTableSlot matchedSlot = slots.stream()
                                .filter(s -> s.getSubjectCode().equals(subjectCode)
                                                && s.getStartTime().equals(startTime))
                                .findFirst().orElse(null);

                Attendance att = new Attendance();
                att.setStudentEmail(studentEmail);
                att.setSubjectCode(subjectCode);
                att.setSubjectName(matchedSlot != null ? matchedSlot.getSubjectName() : subjectCode);
                att.setFacultyEmail(facultyEmail);
                att.setDate(date);
                att.setStartTime(startTime);
                att.setEndTime(matchedSlot != null ? matchedSlot.getEndTime() : null);
                att.setPresent(present);

                att.setDept(student.getDept());
                att.setSection(student.getSection());
                att.setSemester(student.getSemester());

                attendanceRepo.save(att);
                return "Marked";
        }

        public List<Attendance> getClassAttendance(String subjectCode, LocalDate date, LocalTime startTime) {
                return attendanceRepo.findBySubjectCodeAndDateAndStartTime(subjectCode, date, startTime);
        }

        // ---------------- CLASS ROSTER (ALL STUDENTS + PRESENT/ABSENT)
        // ----------------
        public List<FacultyAttendanceViewDTO> getClassRoster(
                        String facultyEmail, String subjectCode, LocalDate date, LocalTime startTime) {

                // 1. Find the timetable slot to get dept/section/semester
                List<TimeTableSlot> slots = timeTableRepo.findByFacultyEmail(facultyEmail);
                TimeTableSlot matchedSlot = slots.stream()
                                .filter(s -> s.getSubjectCode() != null
                                                && s.getSubjectCode().equals(subjectCode)
                                                && s.getStartTime() != null
                                                && s.getStartTime().equals(startTime))
                                .findFirst()
                                .orElse(null);

                if (matchedSlot == null) {
                        // Slot not found — still return scanned students so faculty isn't left blank
                        return attendanceRepo
                                        .findBySubjectCodeAndDateAndStartTime(subjectCode, date, startTime)
                                        .stream()
                                        .map(a -> new FacultyAttendanceViewDTO(
                                                        a.getStudentEmail(),
                                                        a.getStudentEmail(),
                                                        "",
                                                        a.isPresent()))
                                        .collect(Collectors.toList());
                }

                String dept = matchedSlot.getDept();
                String section = matchedSlot.getSection();
                int semester = matchedSlot.getSemester();

                // 2. Get ALL enrolled students for this class
                List<Students> enrolled = studentRepo.findByDeptAndSectionAndSemester(dept, section, semester);

                // 3. Get existing attendance records for this specific session
                List<Attendance> records = attendanceRepo
                                .findBySubjectCodeAndDateAndStartTime(subjectCode, date, startTime);

                // Build a lookup map: email -> attendance record
                Map<String, Attendance> recordMap = records.stream()
                                .collect(Collectors.toMap(
                                                Attendance::getStudentEmail,
                                                a -> a,
                                                (a1, a2) -> a1 // keep first if duplicates
                                ));

                // 4. Merge: for each enrolled student, check if they have an attendance record
                return enrolled.stream().map(student -> {
                        Attendance att = recordMap.get(student.getEmail());
                        boolean present = att != null && att.isPresent();
                        return new FacultyAttendanceViewDTO(
                                        student.getEmail(),
                                        student.getName() != null ? student.getName() : student.getEmail(),
                                        student.getRollno() != null ? student.getRollno() : "",
                                        present);
                }).collect(Collectors.toList());
        }
}
