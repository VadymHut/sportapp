package com.proj.webapp.repo;

import com.proj.webapp.model.Client;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ClientRepo extends JpaRepository<Client, Long>
{
    Optional<Client> findByPersonalCode(String personalCode);
    boolean existsByPersonalCode(String personalCode);

    @Query("""
    select c from Client c
    where lower(c.name) like concat('%', :term, '%')
       or lower(c.surname) like concat('%', :term, '%')
       or lower(c.personalCode) like concat('%', :term, '%')
       or lower(c.email) like concat('%', :term, '%')
""")
    Page<Client> searchByTerm(@Param("term") String term, Pageable pageable);
}
