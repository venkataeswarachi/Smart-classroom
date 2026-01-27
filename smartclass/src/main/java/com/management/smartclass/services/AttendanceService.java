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
import org.springframework.stereotype.Service;

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
                .orElseThrow(() -> new RuntimeException("Invalid QR"));
        boolean alreadyMarked =
                attendanceRepo.existsByStudentEmailAndSubjectCodeAndDateAndStartTime(
                        studentEmail,
                        qr.getSubjectCode(),
                        LocalDate.now(),
                        qr.getStartTime()
                );

        if (alreadyMarked) {
            throw new RuntimeException("Attendance already marked for this period");
        }

        if (qr.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("QR expired");
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

        List<TimeTableSlot> slots =
                timeTableRepo.findByDeptAndSectionAndSemesterAndDayOrderByStartTime(
                        student.getDept(),
                        student.getSection(),
                        student.getSemester(),
                        day
                );

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

            boolean attendanceExists =
                    attendanceRepo
                            .findByStudentEmailAndSubjectCodeAndDateAndStartTime(
                                    studentEmail,
                                    slot.getSubjectCode(),
                                    date,
                                    slot.getStartTime()
                            )
                            .isPresent();

            if (attendanceExists) {
                dto.setStatus("PRESENT");
            }
            else if (date.equals(today) && now.isBefore(slot.getEndTime())) {
                dto.setStatus("NOT_MARKED");
            }
            else {
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

        List<Attendance> records =
                attendanceRepo.findByStudentEmailAndSemester(
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
                startDate.lengthOfMonth()
        );

        return attendanceRepo
                .findByStudentEmailAndDateBetween(
                        studentEmail,
                        startDate,
                        endDate
                )
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

    public List<FacultyAttendanceViewDTO> getSessionAttendance(
            String facultyEmail,
            String subjectCode,
            LocalDate date,
            LocalTime startTime,
            String dept,
            String section,
            int semester) {

        // 1️⃣ Fetch all students of the class
        List<Students> students =
                studentRepo.findByDeptAndSectionAndSemester(
                        dept, section, semester
                );

        // 2️⃣ Fetch attendance for the session
        Map<String, Attendance> attendanceMap =
                attendanceRepo
                        .findByFacultyEmailAndSubjectCodeAndDateAndStartTimeAndDeptAndSectionAndSemester(
                                facultyEmail,
                                subjectCode,
                                date,
                                startTime,
                                dept,
                                section,
                                semester
                        )
                        .stream()
                        .collect(Collectors.toMap(
                                Attendance::getStudentEmail,
                                a -> a,
                                (oldVal, newVal) -> newVal
                        ));

        // 3️⃣ Merge students + attendance
        return students.stream().map(stu -> {

            FacultyAttendanceViewDTO dto =
                    new FacultyAttendanceViewDTO();

            dto.setStudentEmail(stu.getEmail());
            dto.setStudentName(stu.getName());
            dto.setRollNo(stu.getRollno());

            Attendance att = attendanceMap.get(stu.getEmail());
            dto.setPresent(att != null && att.isPresent());

            return dto;

        }).toList();
    }

    public void updateAttendance(
            String facultyEmail,
            String subjectCode,
            LocalDate date,
            LocalTime startTime,
            FacultyAttendanceUpdateDTO dto) {

        Attendance att =
                attendanceRepo
                        .findByStudentEmailAndSubjectCodeAndDateAndStartTime(
                                dto.getStudentEmail(),
                                subjectCode,
                                date,
                                startTime
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Attendance record not found")
                        );

        //check security
        if (!att.getFacultyEmail().equals(facultyEmail)) {
            throw new RuntimeException("Unauthorized update");
        }

        att.setPresent(dto.isPresent());
        attendanceRepo.save(att);
    }
}


