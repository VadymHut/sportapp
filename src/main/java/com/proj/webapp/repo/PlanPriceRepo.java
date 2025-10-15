package com.proj.webapp.repo;

import com.proj.webapp.model.MembershipPlan;
import com.proj.webapp.model.PlanPrice;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanPriceRepo extends JpaRepository<PlanPrice, Long>
{
    List<PlanPrice> findByMembershipPlan(@NotNull MembershipPlan membershipPlan);
}
