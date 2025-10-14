package com.proj.webapp.repo;

import com.proj.webapp.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepo extends JpaRepository<Client, Long>
{
}
