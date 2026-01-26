package com.management.smartclass.controllers;

import com.management.smartclass.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private AdminService adminService;
    @PostMapping("/upload-users")
    public ResponseEntity<String> uploadUsers(@RequestParam MultipartFile file,@RequestParam String role){
        String res= adminService.uploadUsers(file,role);
        return ResponseEntity.ok(res);
    }
}
