package com.proj.webapp.repo;

import com.proj.webapp.model.AppUser;
import com.proj.webapp.model.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AppUserRepo extends JpaRepository<AppUser, Long>
{
    boolean existsByStaff(Staff staff);
    boolean existsByLogin(String login);
    Optional<AppUser> findByLogin(String login);
    @Query("""
        select u from AppUser u
        left join u.staff s
        where lower(u.login) like concat('%', :term, '%')
           or (s is not null and (
                  lower(s.name) like concat('%', :term, '%')
               or lower(s.surname) like concat('%', :term, '%')
               or lower(s.personalCode) like concat('%', :term, '%')
           ))
    """)
    Page<AppUser> searchByTerm(@Param("term") String term, Pageable pageable);

}
