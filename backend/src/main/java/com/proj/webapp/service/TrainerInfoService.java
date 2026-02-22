package com.proj.webapp.service;

import com.proj.webapp.dto.MembershipInfo;
import com.proj.webapp.dto.TrainerInfo;
import com.proj.webapp.model.*;
import com.proj.webapp.repo.CheckInRepo;
import com.proj.webapp.repo.MembershipRepo;
import com.proj.webapp.repo.TrainerRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class TrainerInfoService {

    private final TrainerRepo trainerRepo;
    private final MembershipRepo membershipRepo;
    private final CheckInRepo checkInRepo;

    public TrainerInfoService(TrainerRepo trainerRepo,
                              MembershipRepo membershipRepo,
                              CheckInRepo checkInRepo) {
        this.trainerRepo = trainerRepo;
        this.membershipRepo = membershipRepo;
        this.checkInRepo = checkInRepo;
    }

    @Transactional(readOnly = true)
    public TrainerInfo get(Long trainerId, boolean includeCheckIns) {
        Trainer trainer = trainerRepo.findById(trainerId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + trainerId));

        LocalDate today = LocalDate.now();

        List<Membership> active = includeCheckIns
                ? membershipRepo.findActiveWithCheckInsByTrainerId(trainerId, today)
                : membershipRepo.findActiveByTrainerId(trainerId, today);

        List<Membership> past = includeCheckIns
                ? membershipRepo.findPastWithCheckInsByTrainerId(trainerId, today)
                : membershipRepo.findPastByTrainerId(trainerId, today);

        List<MembershipInfo> activeDtos = active.stream()
                .sorted(Comparator.comparing(Membership::getEndingDate,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(m -> toMembershipInfo(m, includeCheckIns))
                .toList();

        List<MembershipInfo> pastDtos = past.stream()
                .sorted(Comparator.comparing(Membership::getEndingDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(m -> toMembershipInfo(m, includeCheckIns))
                .toList();

        int totalMemberships = membershipRepo.countByTrainerId(trainerId);
        int activeMemberships = membershipRepo.countActiveByTrainerId(trainerId, today);
        long totalCheckIns = checkInRepo.countByTrainerId(trainerId);
        var lastCheckInAt = checkInRepo.lastCheckInAtByTrainer(trainerId);
        var nearestEnding = membershipRepo.nearestEndingDateForTrainer(trainerId, today);

        List<Long> activeClientIds = membershipRepo.findActiveClientIdsByTrainerId(trainerId, today);
        int totalClientsEver = membershipRepo.findDistinctClientIdsByTrainerId(trainerId).size();

        TrainerInfo.Stats stats = new TrainerInfo.Stats(
                activeMemberships,
                totalMemberships,
                totalCheckIns,
                lastCheckInAt,
                nearestEnding
        );

        return new TrainerInfo(
                trainer.getId(),
                trainer.getName(),
                trainer.getSurname(),
                trainer.getEmail(),
                stats,
                activeClientIds,
                activeClientIds.size(),
                totalClientsEver,
                activeDtos,
                pastDtos
        );
    }

    private MembershipInfo toMembershipInfo(Membership m, boolean includeCheckIns) {
        Trainer t = m.getTrainer();
        MembershipPlan p = m.getMembershipPlan();

        String planLabel = null;
        Long planId = null;
        Integer maxVisits = null;

        if (p != null) {
            planId = p.getId();
            String activity = safeString(p.getActivityType());
            String group = safeString(p.getGroupType());
            String freq = safeString(p.getFrequencyType());
            planLabel = String.format("%s / %s / %s", activity, group, freq);

            String f = freq == null ? "" : freq.trim().toUpperCase();
            maxVisits = switch (f) {
                case "ONCE" -> 1;
                case "EIGHT" -> 8;
                case "TWELVE" -> 12;
                case "UNLIMITED" -> null;
                default -> null;
            };
        }

        List<MembershipInfo.CheckInInfo> checkInsDto =
                includeCheckIns && m.getCheckIns() != null
                        ? m.getCheckIns().stream()
                        .sorted(Comparator.comparing(CheckIn::getVisitedAt))
                        .map(ci -> new MembershipInfo.CheckInInfo(
                                ci.getId(),
                                ci.getVisitedAt(),
                                ci.getStaff() != null ? ci.getStaff().getId() : null,
                                ci.getStaff() != null ? ci.getStaff().getName() : null,
                                ci.getStaff() != null ? ci.getStaff().getSurname() : null
                        ))
                        .toList()
                        : List.of();

        return new MembershipInfo(
                m.getId(),
                m.getClient() != null ? m.getClient().getId() : null,
                m.getClient() != null ? m.getClient().getName() : null,
                m.getClient() != null ? m.getClient().getSurname() : null,
                m.getClient() != null ? m.getClient().getPersonalCode() : null,
                t != null ? t.getId() : null,
                t != null ? t.getName() : null,
                t != null ? t.getSurname() : null,
                planId,
                planLabel,
                m.getStartingDate(),
                m.getEndingDate(),
                maxVisits,
                checkInsDto
        );
    }

    private static String safeString(Object o) {
        return o == null ? null : o.toString();
    }
}
