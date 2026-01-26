package com.management.smartclass.services;

import com.management.smartclass.Repos.FacultyRepo;
import com.management.smartclass.Repos.StudentRepo;
import com.management.smartclass.Repos.UserRepo;
import com.management.smartclass.models.Faculty;
import com.management.smartclass.models.Students;
import com.management.smartclass.models.Users;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
@Service
public class AdminService {
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private FacultyRepo facultyRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String uploadUsers(MultipartFile file, String role) {

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null) continue;

                String email = row.getCell(0).getStringCellValue();

                if (userRepo.existsByEmail(email)) continue;


                Users user = new Users();
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("Welcome@123"));
                user.setRole(role);
                user.setFirstlogin(true);
                userRepo.save(user);


                if ("STUDENT".equalsIgnoreCase(role)) {
                    saveStudent(row, email);
                } else if ("FACULTY".equalsIgnoreCase(role) || "DEO".equalsIgnoreCase(role)) {
                    saveFaculty(row, email);
                }
            }
        return "Accounts Created successfully";
        } catch (Exception e) {
            throw new RuntimeException("Excel upload failed: " + e.getMessage());
        }
    }


    private void saveStudent(Row row, String email) {

        Students s = new Students();
        s.setEmail(email);
        s.setRollno(row.getCell(1).getStringCellValue());
        s.setName(row.getCell(2).getStringCellValue());
        s.setSection(row.getCell(3).getStringCellValue());
        s.setDept(row.getCell(4).getStringCellValue());
        s.setYear((int) row.getCell(5).getNumericCellValue());
        s.setSemester((int) row.getCell(6).getNumericCellValue());
        s.setMobile((long) row.getCell(7).getNumericCellValue());
        s.setAddress(row.getCell(8).getStringCellValue());
        s.setBloodGroup(row.getCell(9).getStringCellValue());
        s.setMothername(row.getCell(10).getStringCellValue());
        s.setFathername(row.getCell(11).getStringCellValue());

        studentRepo.save(s);
    }


    private void saveFaculty(Row row, String email) {

        Faculty f = new Faculty();
        f.setEmail(email);
        f.setName(row.getCell(1).getStringCellValue());
        f.setDept(row.getCell(2).getStringCellValue());
        f.setPosition(row.getCell(3).getStringCellValue());
        f.setQualification(row.getCell(4).getStringCellValue());

        facultyRepo.save(f);
    }

}
