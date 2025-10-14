package com.proj.webapp.repo;

import com.proj.webapp.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipRepo extends JpaRepository<Membership, Long>
{
}
