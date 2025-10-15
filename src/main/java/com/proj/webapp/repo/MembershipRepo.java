package com.proj.webapp.repo;

import com.proj.webapp.model.Membership;
import com.proj.webapp.model.MembershipPlan;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MembershipRepo extends JpaRepository<Membership, Long>
{
    boolean existsByMembershipPlan(@NotNull MembershipPlan membershipPlan);
    List<Membership> findByClient_PeId(@NotNull Long clientId);
    List<Membership> findByTrainer_PeId(@NotNull Long trainerId);
    List<Membership> findByMembershipPlan_PlId(@NotNull Long membershipPlanId);
}
