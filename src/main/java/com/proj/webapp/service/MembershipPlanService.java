package com.proj.webapp.service;

import com.proj.webapp.model.MembershipPlan;
import com.proj.webapp.repo.MembershipPlanRepo;
import com.proj.webapp.repo.MembershipRepo;
import com.proj.webapp.repo.PlanPriceRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@RequiredArgsConstructor
@Validated
@Transactional
public class MembershipPlanService
{

    private final MembershipPlanRepo membershipPlanRepo;
    private final MembershipRepo membershipRepo;
    private final PlanPriceRepo planPriceRepo;

    public MembershipPlan create(@Valid @NotNull MembershipPlan plan)
    {
        if (plan.getPlId() != null) throw new IllegalArgumentException("plId should not be set");
        try
        {
            return membershipPlanRepo.save(plan);
        }
        catch (DataIntegrityViolationException e)
        {
            throw new IllegalArgumentException("A plan with the same activity/group/frequency already exists");
        }
    }

    @Transactional(readOnly = true)
    public MembershipPlan getById(@NotNull Long id)
    {
        return membershipPlanRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("MembershipPlan with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public List<MembershipPlan> listAll()
    {
        return membershipPlanRepo.findAll();
    }


    public MembershipPlan update(@NotNull Long id, @Valid @NotNull MembershipPlan edited)
    {
        var existing = membershipPlanRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("MembershipPlan with id " + id + " not found"));
        existing.setActivityType(edited.getActivityType());
        existing.setGroupType(edited.getGroupType());
        existing.setFrequencyType(edited.getFrequencyType());
        try
        {
            return existing;
        }
        catch (DataIntegrityViolationException e)
        {
            throw new IllegalArgumentException("A plan with the same activity/group/frequency already exists");
        }
    }

    public void delete(@NotNull Long id)
    {
        var plan = membershipPlanRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("MembershipPlan with id " + id + " not found"));

        if (membershipRepo.existsByMembershipPlan(plan))
        {
            throw new IllegalStateException("Cannot delete a plan that has memberships; reassign or end them first");
        }
        planPriceRepo.deleteAll(planPriceRepo.findByMembershipPlan(plan));
        membershipPlanRepo.delete(plan);
    }
}
