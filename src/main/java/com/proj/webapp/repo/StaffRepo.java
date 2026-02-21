package com.proj.webapp.repo;

import com.proj.webapp.model.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffRepo extends JpaRepository<Staff,Long>
{
    boolean existsByPersonalCode(String personalCode);
    @Query("""
    select s from Staff s
    where lower(s.name) like concat('%', :term, '%')
       or lower(s.surname) like concat('%', :term, '%')
       or lower(s.personalCode) like concat('%', :term, '%')
       or lower(s.email) like concat('%', :term, '%')
       or lower(s.jobTitle) like concat('%', :term, '%')
""")
    Page<Staff> searchByTerm(@Param("term") String term, Pageable pageable);
}
