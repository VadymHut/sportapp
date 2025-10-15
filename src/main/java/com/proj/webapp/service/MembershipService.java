package com.proj.webapp.service;

import com.proj.webapp.model.Client;
import com.proj.webapp.model.Membership;
import com.proj.webapp.model.MembershipPlan;
import com.proj.webapp.model.Trainer;
import com.proj.webapp.repo.ClientRepo;
import com.proj.webapp.repo.MembershipPlanRepo;
import com.proj.webapp.repo.MembershipRepo;
import com.proj.webapp.repo.TrainerRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
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

    public Membership create(@Valid @NotNull Membership newMembership)
    {
        if (newMembership.getMId() != null)
            throw new IllegalArgumentException("mId should not be set");
        if (newMembership.getClient() == null || newMembership.getClient().getPeId() == null)
            throw new IllegalArgumentException("client id is required");
        if (newMembership.getMembershipPlan() == null || newMembership.getMembershipPlan().getPlId() == null)
            throw new IllegalArgumentException("membershipPlan id is required");

        Client client = clientRepo.findById(newMembership.getClient().getPeId()).orElseThrow(() -> new IllegalArgumentException("Client not found"));

        MembershipPlan plan = membershipPlanRepo.findById(newMembership.getMembershipPlan().getPlId()).orElseThrow(() -> new IllegalArgumentException("MembershipPlan not found"));

        newMembership.setClient(client);
        newMembership.setMembershipPlan(plan);

        if (newMembership.getTrainer() != null)
        {
            Long tId = newMembership.getTrainer().getPeId();
            Trainer trainer = (tId == null) ? null : trainerRepo.findById(tId).orElseThrow(() -> new IllegalArgumentException("Trainer not found"));
            newMembership.setTrainer(trainer);
        }

        return membershipRepo.save(newMembership);
    }

    @Transactional(readOnly = true)
    public Membership getById(@NotNull Long id)
    {
        return membershipRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Membership with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public List<Membership> listAll()
    {
        return membershipRepo.findAll();
    }


    public Membership update(@NotNull Long id, @Valid @NotNull Membership edited) {
        var existing = membershipRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Membership with id " + id + " not found"));

        if (edited.getMembershipPlan() != null && edited.getMembershipPlan().getPlId() != null)
        {
            var plan = membershipPlanRepo.findById(edited.getMembershipPlan().getPlId())
                    .orElseThrow(() -> new IllegalArgumentException("MembershipPlan not found"));
            existing.setMembershipPlan(plan);
        }

        if (edited.getTrainer() != null)
        {
            Long tId = edited.getTrainer().getPeId();
            var trainer = (tId == null) ? null : trainerRepo.findById(tId).orElseThrow(() -> new IllegalArgumentException("Trainer not found"));
            existing.setTrainer(trainer);
        }

        if (edited.getStartingDate() != null)
        {
            existing.setStartingDate(edited.getStartingDate());
        }

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
        return membershipRepo.findByClient_PeId(clientId);
    }

    @Transactional(readOnly = true)
    public List<Membership> listByTrainer(@NotNull Long trainerId)
    {
        return membershipRepo.findByTrainer_PeId(trainerId);
    }

    @Transactional(readOnly = true)
    public List<Membership> listByPlan(@NotNull Long planId)
    {
        return membershipRepo.findByMembershipPlan_PlId(planId);
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
}
