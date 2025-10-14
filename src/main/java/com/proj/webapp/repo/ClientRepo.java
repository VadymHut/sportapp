package com.proj.webapp.repo;

import com.proj.webapp.model.Client;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepo extends JpaRepository<Client, Long>
{
    Optional<Client> findByPersonalCode(String personalCode);
    boolean existsByPersonalCode(String personalCode);
}
