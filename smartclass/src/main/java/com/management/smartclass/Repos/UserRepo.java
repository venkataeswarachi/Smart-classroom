package com.management.smartclass.Repos;

import com.management.smartclass.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<Users,Long> {
    Optional<Users> findByEmail(String email);
    boolean existsByEmail(String email);
}
