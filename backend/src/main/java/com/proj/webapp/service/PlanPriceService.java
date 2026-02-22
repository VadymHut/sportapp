package com.proj.webapp.service;

import com.proj.webapp.model.MembershipPlan;
import com.proj.webapp.model.PlanPrice;
import com.proj.webapp.repo.MembershipPlanRepo;
import com.proj.webapp.repo.PlanPriceRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Validated
@Transactional
public class PlanPriceService
{

    private final PlanPriceRepo planPriceRepo;
    private final MembershipPlanRepo membershipPlanRepo;

    public PlanPrice create(@Valid @NotNull PlanPrice body)
    {
        if (body.getId() != null) throw new IllegalArgumentException("prId should not be set");

        if (body.getMembershipPlan() == null)
            throw new IllegalArgumentException("membershipPlan is required");

        Long planId = body.getMembershipPlan().getId();
        if (planId == null)
            throw new IllegalArgumentException("membershipPlan id is required");

        var plan = membershipPlanRepo.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found: " + planId));
        body.setMembershipPlan(plan);

        return planPriceRepo.save(body);
    }

    @Transactional(readOnly = true)
    public PlanPrice getById(@NotNull Long id) {
        return planPriceRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PlanPrice with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public List<PlanPrice> listAll() {
        return planPriceRepo.findAll();
    }


    @Transactional(readOnly = true)
    public List<PlanPrice> listByPlan(@NotNull Long planId)
    {
        var plan = membershipPlanRepo.findById(planId).orElseThrow(() -> new IllegalArgumentException("MembershipPlan with id " + planId + " not found"));
        return planPriceRepo.findByMembershipPlan(plan);
    }

    public PlanPrice update(@NotNull Long id, @Valid @NotNull PlanPrice body) {
        var existing = planPriceRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PlanPrice not found: " + id));

        if (body.getMembershipPlan() != null) {
            Long newPlanId = body.getMembershipPlan().getId();
            if (newPlanId == null)
                throw new IllegalArgumentException("membershipPlan id is required");
            if (!newPlanId.equals(existing.getMembershipPlan().getId())) {
                var newPlan = membershipPlanRepo.findById(newPlanId)
                        .orElseThrow(() -> new IllegalArgumentException("Plan not found: " + newPlanId));
                existing.setMembershipPlan(newPlan);
            }
        }

        existing.setPrice(body.getPrice());
        existing.setValidFrom(body.getValidFrom());
        existing.setValidTo(body.getValidTo());
        return existing;
    }

    public void delete(@NotNull Long id)
    {
        if (!planPriceRepo.existsById(id)) throw new IllegalArgumentException("PlanPrice with id " + id + " not found");
        planPriceRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<PlanPrice> findActivePrice(@NotNull Long planId, @NotNull LocalDate date)
    {
        var plan = membershipPlanRepo.findById(planId).orElseThrow(() -> new IllegalArgumentException("MembershipPlan with id " + planId + " not found"));
        return planPriceRepo.findByMembershipPlan(plan).stream()
                .filter(p -> !p.getValidFrom().isAfter(date))
                .filter(p -> p.getValidTo() == null || !p.getValidTo().isBefore(date))
                .sorted((a, b) -> b.getValidFrom().compareTo(a.getValidFrom()))
                .findFirst();
    }

    private MembershipPlan ensurePlan(MembershipPlan planRef)
    {
        if (planRef.getId() == null) throw new IllegalArgumentException("membershipPlan id is required");
        return membershipPlanRepo.findById(planRef.getId()).orElseThrow(() -> new IllegalArgumentException("MembershipPlan with id " + planRef.getId() + " not found"));
    }

    private void assertNoOverlap(MembershipPlan plan, LocalDate from, LocalDate to, Long excludeId)
    {
        var existing = planPriceRepo.findByMembershipPlan(plan);
        for (var p : existing)
        {
            if (excludeId != null && excludeId.equals(p.getId())) continue;
            var eFrom = p.getValidFrom();
            var eTo = p.getValidTo();
            var overlaps = (eTo == null || !eTo.isBefore(from)) && (to == null || !eFrom.isAfter(to));
            if (overlaps) throw new IllegalStateException("Overlapping price period exists for this plan");
        }
    }
}
