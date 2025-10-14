package com.proj.webapp.repo;

import com.proj.webapp.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepo extends JpaRepository<AppUser, Long>
{
}
