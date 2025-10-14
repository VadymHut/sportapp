package com.proj.webapp.repo;

import com.proj.webapp.model.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipPlanRepo extends JpaRepository<MembershipPlan, Long>
{
}
