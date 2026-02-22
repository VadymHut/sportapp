package com.proj.webapp.repo;

import com.proj.webapp.model.Trainer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TrainerRepo extends JpaRepository<Trainer, Long>
{
    boolean existsByPersonalCode(String personalCode);

    @Query("""
    select t from Trainer t
    where lower(t.name) like concat('%', :term, '%')
       or lower(t.surname) like concat('%', :term, '%')
       or lower(t.personalCode) like concat('%', :term, '%')
       or lower(t.email) like concat('%', :term, '%')
""")
    Page<Trainer> searchByTerm(@Param("term") String term, Pageable pageable);
}
