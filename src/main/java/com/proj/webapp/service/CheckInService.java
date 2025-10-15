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
public class CheckinService {

    private final CheckInRepo checkInRepo;
    private final MembershipRepo membershipRepo;
    private final StaffRepo staffRepo;

    public CheckIn create(@Valid @NotNull CheckIn newCheckIn)
    {
        if (newCheckIn.getChId() != null)
            throw new IllegalArgumentException("chId should not be set");
        if (newCheckIn.getMembership() == null || newCheckIn.getMembership().getMId() == null)
            throw new IllegalArgumentException("membership id is required");
        if (newCheckIn.getStaff() == null || newCheckIn.getStaff().getPeId() == null)
            throw new IllegalArgumentException("staff id is required");

        Membership m = membershipRepo.findById(newCheckIn.getMembership().getMId()).orElseThrow(() -> new IllegalArgumentException("Membership not found"));
        Staff s = staffRepo.findById(newCheckIn.getStaff().getPeId()).orElseThrow(() -> new IllegalArgumentException("Staff not found"));

        ZoneId zone = ZoneId.systemDefault();
        Instant periodStart = m.getStartingDate().atStartOfDay(zone).toInstant();
        Instant periodEndInclusive = m.getEndingDate().plusDays(1).atStartOfDay(zone).minusNanos(1).toInstant();

        long used = checkInRepo.countByMembershipAndVisitedAtBetween(m, periodStart, periodEndInclusive);

        int allowed = monthlyLimit(m.getMembershipPlan().getFrequencyType(), m.getStartingDate(), m.getEndingDate());
        if (allowed != Integer.MAX_VALUE && used >= allowed)
        {
            throw new IllegalStateException("Check-in limit reached for this membership period");
        }

        newCheckIn.setMembership(m);
        newCheckIn.setStaff(s);

        if (newCheckIn.getVisitedAt() == null)
        {
            newCheckIn.setVisitedAt(Instant.now());
        }
        return checkInRepo.save(newCheckIn);
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
    public List<CheckIn> listByMembership(@NotNull Long membershipId)
    {
        return checkInRepo.findByMembership_MId(membershipId);
    }

    @Transactional(readOnly = true)
    public List<CheckIn> listByClient(@NotNull Long clientId)
    {
        return checkInRepo.findByMembership_Client_PeId(clientId);
    }

    @Transactional(readOnly = true)
    public List<CheckIn> listByStaff(@NotNull Long staffId)
    {
        return checkInRepo.findByStaff_PeId(staffId);
    }

    public CheckIn update(@NotNull Long id, @Valid @NotNull CheckIn edited)
    {
        var existing = checkInRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("CheckIn with id " + id + " not found"));

        if (edited.getVisitedAt() != null) existing.setVisitedAt(edited.getVisitedAt());

        if (edited.getMembership() != null && edited.getMembership().getMId() != null)
        {
            var m = membershipRepo.findById(edited.getMembership().getMId())
                    .orElseThrow(() -> new IllegalArgumentException("Membership not found"));
            existing.setMembership(m);
        }

        if (edited.getStaff() != null && edited.getStaff().getPeId() != null)
        {
            var s = staffRepo.findById(edited.getStaff().getPeId())
                    .orElseThrow(() -> new IllegalArgumentException("Staff not found"));
            existing.setStaff(s);
        }

        if (existing.getStaff() == null) throw new IllegalArgumentException("staff is required");
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
