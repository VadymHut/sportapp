package com.proj.webapp.repo;

import com.proj.webapp.model.AppUser;
import com.proj.webapp.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepo extends JpaRepository<AppUser, Long>
{
    boolean existsByStaff(Staff staff);
    boolean existsByLogin(String login);
    Optional<AppUser> findByLogin(String login);
}
