package com.proj.webapp.repo;

import com.proj.webapp.model.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainerRepo extends JpaRepository<Trainer, Long>
{
    boolean existsByPersonalCode(String personalCode);
}
