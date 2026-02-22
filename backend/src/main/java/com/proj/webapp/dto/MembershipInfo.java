package com.proj.webapp.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record MembershipInfo(
        Long id,
        Long clientId,
        String clientName,
        String clientSurname,
        String clientPersonalCode,
        Long trainerId,
        String trainerName,
        String trainerSurname,
        Long planId,
        String planLabel,
        LocalDate startingDate,
        LocalDate endingDate,
        Integer maxVisits,
        List<CheckInInfo> checkIns
)
{
    public record CheckInInfo(
            Long id,
            Instant visitedAt,
            Long staffId,
            String staffName,
            String staffSurname
    ) {}
}
