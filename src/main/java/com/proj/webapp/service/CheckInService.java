package com.proj.webapp.service;

import com.proj.webapp.model.CheckIn;
import com.proj.webapp.model.FrequencyType;
import com.proj.webapp.model.Membership;
import com.proj.webapp.model.Staff;
import com.proj.webapp.repo.CheckInRepo;
import com.proj.webapp.repo.MembershipRepo;
import com.proj.webapp.repo.StaffRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Validated
@Transactional
public class CheckInService {

    private final CheckInRepo checkInRepo;
    private final MembershipRepo membershipRepo;
    private final StaffRepo staffRepo;

    @Transactional
    public CheckIn create(@Valid @NotNull CheckIn body) {
        if (body.getId() != null) {
            throw new IllegalArgumentException("chId should not be set");
        }
        if (body.getMembership() == null || body.getMembership().getId() == null) {
            throw new IllegalArgumentException("membership id is required");
        }
        if (body.getStaff() == null || body.getStaff().getId() == null) {
            throw new IllegalArgumentException("staff id is required");
        }

        var m = membershipRepo.findById(body.getMembership().getId())
                .orElseThrow(() -> new IllegalArgumentException("Membership not found"));
        var s = staffRepo.findById(body.getStaff().getId())
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));

        var visit = body.getVisitedAt() != null ? body.getVisitedAt() : Instant.now();

        var zone = ZoneId.systemDefault();
        var periodStart = m.getStartingDate().atStartOfDay(zone).toInstant();
        var periodEndInclusive = m.getEndingDate().plusDays(1).atStartOfDay(zone).minusNanos(1).toInstant();
        if (visit.isBefore(periodStart) || visit.isAfter(periodEndInclusive)) {
            throw new IllegalArgumentException("Membership is not active on this date");
        }

        long used = checkInRepo.countByMembershipAndVisitedAtBetween(m, periodStart, periodEndInclusive);
        int allowed = monthlyLimit(m.getMembershipPlan().getFrequencyType(), m.getStartingDate(), m.getEndingDate());
        if (allowed != Integer.MAX_VALUE && used >= allowed) {
            throw new IllegalStateException("Check-in limit reached for this membership period");
        }

        body.setMembership(m);
        body.setStaff(s);
        if (body.getVisitedAt() == null) body.setVisitedAt(visit);

        return checkInRepo.save(body);
    }

    @Transactional(readOnly = true)
    public CheckIn getById(@NotNull Long id)
    {
        return checkInRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("CheckIn with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public List<CheckIn> listAll()
    {
        return checkInRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Page<CheckIn> listPaged(String q, Pageable pageable) {
        if (q != null && !q.isBlank()) {
            String term = q.trim().toLowerCase();

            Long idTerm = null;
            try {
                idTerm = Long.valueOf(q.trim());
            } catch (NumberFormatException ignored) {
            }

            return checkInRepo.searchByTerm(term, idTerm, pageable);
        }

        return checkInRepo.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<CheckIn> listByMembership(@NotNull Long membershipId)
    {
        return checkInRepo.findByMembership_id(membershipId);
    }

    @Transactional(readOnly = true)
    public List<CheckIn> listByClient(@NotNull Long clientId)
    {
        return checkInRepo.findByMembership_Client_id(clientId);
    }

    @Transactional(readOnly = true)
    public List<CheckIn> listByStaff(@NotNull Long staffId)
    {
        return checkInRepo.findByStaff_id(staffId);
    }

    @Transactional
    public CheckIn update(@NotNull Long id, @Valid @NotNull CheckIn body) {
        var existing = checkInRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("CheckIn not found: " + id));

        Membership targetMembership = existing.getMembership();
        if (body.getMembership() != null && body.getMembership().getId() != null) {
            Long newMid = body.getMembership().getId();
            if (!newMid.equals(targetMembership.getId())) {
                targetMembership = membershipRepo.findById(newMid)
                        .orElseThrow(() -> new IllegalArgumentException("Membership not found"));
                existing.setMembership(targetMembership);
            }
        }

        if (body.getStaff() != null && body.getStaff().getId() != null) {
            Long newSid = body.getStaff().getId();
            if (!newSid.equals(existing.getStaff().getId())) {
                var newStaff = staffRepo.findById(newSid)
                        .orElseThrow(() -> new IllegalArgumentException("Staff not found"));
                existing.setStaff(newStaff);
            }
        }

        Instant visit = existing.getVisitedAt();
        if (body.getVisitedAt() != null) {
            visit = body.getVisitedAt();
            existing.setVisitedAt(visit);
        }

        var zone = ZoneId.systemDefault();
        var periodStart = targetMembership.getStartingDate().atStartOfDay(zone).toInstant();
        var periodEndInclusive = targetMembership.getEndingDate().plusDays(1).atStartOfDay(zone).minusNanos(1).toInstant();
        if (visit.isBefore(periodStart) || visit.isAfter(periodEndInclusive)) {
            throw new IllegalArgumentException("Membership is not active on this date");
        }

        long used = checkInRepo.countByMembershipAndVisitedAtBetween(targetMembership, periodStart, periodEndInclusive);

        boolean sameMembership = existing.getMembership().getId().equals(targetMembership.getId());
        boolean existingInsidePeriod = !existing.getVisitedAt().isBefore(periodStart) && !existing.getVisitedAt().isAfter(periodEndInclusive);
        if (sameMembership && existingInsidePeriod) {
            used = Math.max(0, used - 1);
        }

        int allowed = monthlyLimit(targetMembership.getMembershipPlan().getFrequencyType(),
                targetMembership.getStartingDate(), targetMembership.getEndingDate());
        if (allowed != Integer.MAX_VALUE && used >= allowed) {
            throw new IllegalStateException("Check-in limit reached for this membership period");
        }

        return existing;
    }

    public void delete(@NotNull Long id)
    {
        if (!checkInRepo.existsById(id)) throw new IllegalArgumentException("CheckIn with id " + id + " not found");
        checkInRepo.deleteById(id);
    }

    private int monthlyLimit(FrequencyType ft, java.time.LocalDate start, java.time.LocalDate end)
    {
        return switch (ft) {
            case UNLIMITED -> Integer.MAX_VALUE;
            case ONCE -> 1;
            case EIGHT -> 8;
            case TWELVE -> 12;
            default -> throw new IllegalStateException("No limit mapping for frequency: " + ft);
        };
    }



}
