package com.proj.webapp.service;

import com.proj.webapp.dto.MembershipInfo;
import com.proj.webapp.model.*;
import com.proj.webapp.repo.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@RequiredArgsConstructor
@Validated
@Transactional
public class MembershipService
{

    private final MembershipRepo membershipRepo;
    private final ClientRepo clientRepo;
    private final TrainerRepo trainerRepo;
    private final MembershipPlanRepo membershipPlanRepo;
    private final CheckInRepo checkInRepo;

    public Membership create(@Valid @NotNull Membership body) {
        if (body.getId() != null) throw new IllegalArgumentException("mId should not be set");

        if (body.getClient() == null || body.getClient().getId() == null)
            throw new IllegalArgumentException("client id is required");
        var client = clientRepo.findById(body.getClient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        body.setClient(client);

        if (body.getTrainer() != null) {
            Long tId = body.getTrainer().getId();
            if (tId != null) {
                var trainer = trainerRepo.findById(tId)
                        .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));
                body.setTrainer(trainer);
            } else {
                body.setTrainer(null);
            }
        }

        if (body.getMembershipPlan() == null || body.getMembershipPlan().getId() == null)
            throw new IllegalArgumentException("membershipPlan id is required");
        var plan = membershipPlanRepo.findById(body.getMembershipPlan().getId())
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        body.setMembershipPlan(plan);

        ensureTrainerMatchesPlanActivity(body.getTrainer(), body.getMembershipPlan());

        return membershipRepo.save(body);
    }


    @Transactional(readOnly = true)
    public Membership getById(@NotNull Long id)
    {
        return membershipRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Membership with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public List<Membership> listAll()
    {
        return membershipRepo.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    @Transactional(readOnly = true)
    public Page<Membership> listPaged(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return membershipRepo.findAll(pageable);
        }
        return membershipRepo.searchByTerm(q.toLowerCase(), pageable);
    }


    public Membership update(@NotNull Long id, @Valid @NotNull Membership body) {
        var existing = membershipRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found"));

        if (body.getClient() != null && body.getClient().getId() != null) {
            var client = clientRepo.findById(body.getClient().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found"));
            existing.setClient(client);
        }

        if (body.getTrainer() != null) {
            Long tId = body.getTrainer().getId();
            if (tId != null) {
                var trainer = trainerRepo.findById(tId)
                        .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));
                existing.setTrainer(trainer);
            } else {
                existing.setTrainer(null);
            }
        }

        if (body.getMembershipPlan() != null && body.getMembershipPlan().getId() != null) {
            var plan = membershipPlanRepo.findById(body.getMembershipPlan().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
            existing.setMembershipPlan(plan);
        }

        if (body.getStartingDate() != null) existing.setStartingDate(body.getStartingDate());

        ensureTrainerMatchesPlanActivity(existing.getTrainer(), existing.getMembershipPlan());

        return existing;
    }


    public void delete(@NotNull Long id)
    {
        if (!membershipRepo.existsById(id))
        {
            throw new IllegalArgumentException("Membership with id " + id + " not found");
        }
        membershipRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Membership> listByClient(@NotNull Long clientId)
    {
        return membershipRepo.findByClient_id(clientId);
    }

    @Transactional(readOnly = true)
    public List<Membership> listByTrainer(@NotNull Long trainerId)
    {
        return membershipRepo.findByTrainer_id(trainerId);
    }

    @Transactional(readOnly = true)
    public List<Membership> listByPlan(@NotNull Long planId)
    {
        return membershipRepo.findByMembershipPlan_id(planId);
    }


    public Membership reassignTrainer(@NotNull Long membershipId, Long trainerIdOrNull)
    {
        var m = membershipRepo.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership with id " + membershipId + " not found"));
        if (trainerIdOrNull == null)
        {
            m.setTrainer(null);
        }
        else
        {
            var t = trainerRepo.findById(trainerIdOrNull)
                    .orElseThrow(() -> new IllegalArgumentException("Trainer with id " + trainerIdOrNull + " not found"));
            m.setTrainer(t);
        }
        return m;
    }

    private void ensureTrainerMatchesPlanActivity(Trainer trainer, MembershipPlan plan) {
        if (trainer == null || plan == null) {
            return;
        }

        var trainerActivity = trainer.getActivity();
        var planActivity = plan.getActivityType();

        if (trainerActivity != null && planActivity != null && !trainerActivity.equals(planActivity)) {
            throw new IllegalArgumentException("Trainer activity must match membership plan activity");
        }
    }

    @Transactional(readOnly = true)
    public MembershipInfo getMembershipInfo(Long id) {
        Membership m = membershipRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found"));

        var client = m.getClient();
        var trainer = m.getTrainer();
        var plan = m.getMembershipPlan();

        String planLabel = null;
        if (plan != null) {
            String a = plan.getActivityType() != null ? plan.getActivityType().name() : "-";
            String g = plan.getGroupType() != null ? plan.getGroupType().name() : "-";
            String f = plan.getFrequencyType() != null ? plan.getFrequencyType().name() : "-";
            planLabel = a + " / " + g + " / " + f;
        }

        int maxVisits;
        if (plan == null || plan.getFrequencyType() == null) {
            maxVisits = 0;
        } else {
            maxVisits = switch (plan.getFrequencyType()) {
                case UNLIMITED -> Integer.MAX_VALUE;
                case ONCE -> 1;
                case EIGHT -> 8;
                case TWELVE -> 12;
            };
        }

        var checkIns = m.getCheckIns().stream()
                .sorted(java.util.Comparator.comparing(
                        com.proj.webapp.model.CheckIn::getVisitedAt
                ))
                .map(ci -> new MembershipInfo.CheckInInfo(
                        ci.getId(),
                        ci.getVisitedAt(),
                        ci.getStaff() != null ? ci.getStaff().getId() : null,
                        ci.getStaff() != null ? ci.getStaff().getName() : null,
                        ci.getStaff() != null ? ci.getStaff().getSurname() : null
                ))
                .toList();

        return new MembershipInfo(
                m.getId(),

                client != null ? client.getId() : null,
                client != null ? client.getName() : null,
                client != null ? client.getSurname() : null,
                client != null ? client.getPersonalCode() : null,

                trainer != null ? trainer.getId() : null,
                trainer != null ? trainer.getName() : null,
                trainer != null ? trainer.getSurname() : null,

                plan != null ? plan.getId() : null,
                planLabel,

                m.getStartingDate(),
                m.getEndingDate(),

                maxVisits,

                checkIns
        );
    }
}
