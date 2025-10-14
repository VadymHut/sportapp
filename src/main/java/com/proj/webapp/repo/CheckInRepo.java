package com.proj.webapp.repo;

import com.proj.webapp.model.CheckIn;
import com.proj.webapp.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckInRepo extends JpaRepository<CheckIn, Long>
{
    boolean existsByStaff(Staff staff);
}
