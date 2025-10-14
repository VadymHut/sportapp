package com.proj.webapp.repo;

import com.proj.webapp.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRepo extends JpaRepository<Staff,Long>
{
    boolean existsByPersonalCode(String personalCode);
}
