package com.proj.webapp.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record TrainerInfo(
        Long id,
        String name,
        String surname,
        String email,
        Stats stats,
        List<Long> activeClientIds,
        Integer activeClientsNow,
        Integer totalClientsEver,
        List<MembershipInfo> activeMemberships,
        List<MembershipInfo> pastMemberships
) {
    public record Stats(
            Integer activeMemberships,
            Integer totalMemberships,
            Long totalCheckIns,
            Instant lastCheckInAt,
            LocalDate nearestEnding
    ) {}
}
