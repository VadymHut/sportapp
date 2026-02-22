package com.proj.webapp.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ClientInfo(
        Long id,
        String name,
        String surname,
        String personalCode,
        String email,
        LocalDate joinedOn,
        Stats stats,
        List<Long> activeMembershipIds,
        Long primaryMembershipId,
        List<MembershipInfo> memberships
) {
    public record Stats(
            int totalMemberships,
            int activeMemberships,
            long totalCheckIns,
            Instant lastCheckInAt,
            LocalDate nearestEnding
    ) {}
}