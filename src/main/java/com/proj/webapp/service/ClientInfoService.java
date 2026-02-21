package com.proj.webapp.service;

import com.proj.webapp.dto.ClientInfo;
import com.proj.webapp.dto.MembershipInfo;
import com.proj.webapp.repo.CheckInRepo;
import com.proj.webapp.repo.ClientRepo;
import com.proj.webapp.repo.MembershipRepo;
import com.proj.webapp.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class ClientInfoService {

    private final ClientRepo clientRepo;
    private final MembershipRepo membershipRepo;
    private final CheckInRepo checkInRepo;

    public ClientInfoService(ClientRepo clientRepo,
                             MembershipRepo membershipRepo,
                             CheckInRepo checkInRepo) {
        this.clientRepo = clientRepo;
        this.membershipRepo = membershipRepo;
        this.checkInRepo = checkInRepo;
    }

    @Transactional(readOnly = true)
    public ClientInfo get(Long clientId, boolean includeCheckIns) {
        Client client = clientRepo.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found: " + clientId));

        LocalDate today = LocalDate.now();

        List<Membership> memberships = includeCheckIns
                ? membershipRepo.findWithCheckInsByClientId(clientId)
                : membershipRepo.findByClient_id(clientId);

        List<MembershipInfo> membershipInfos = memberships.stream()
                .sorted(Comparator.comparing(Membership::getStartingDate).reversed())
                .map(m -> toMembershipInfo(m, includeCheckIns))
                .toList();

        int totalMemberships   = membershipRepo.countByClientId(clientId);
        int activeMemberships  = membershipRepo.countActiveByClientId(clientId, today);
        long totalCheckIns     = checkInRepo.countByClientId(clientId);
        Instant lastCheckInAt  = checkInRepo.lastCheckInAt(clientId);
        LocalDate nearestEnding= membershipRepo.nearestEndingDate(clientId, today);

        List<Long> activeIds = membershipRepo.findActiveMembershipIds(clientId, today);
        Long primaryMembershipId = activeIds.isEmpty() ? null : activeIds.get(0);

        ClientInfo.Stats stats = new ClientInfo.Stats(
                totalMemberships,
                activeMemberships,
                totalCheckIns,
                lastCheckInAt,
                nearestEnding
        );

        return new ClientInfo(
                client.getId(),
                client.getName(),
                client.getSurname(),
                client.getPersonalCode(),
                client.getEmail(),
                client.getJoinedOn(),
                stats,
                activeIds,
                primaryMembershipId,
                membershipInfos
        );
    }

    private MembershipInfo toMembershipInfo(Membership m, boolean includeCheckIns) {
        MembershipPlan p = m.getMembershipPlan();
        Trainer t = m.getTrainer();

        String planLabel = null;
        Long planId = null;
        Integer maxVisits = null;

        if (p != null) {
            planId = p.getId();
            String activity = safeString(p.getActivityType());
            String group    = safeString(p.getGroupType());
            String freq     = safeString(p.getFrequencyType());

            planLabel = String.format("%s / %s / %s", activity, group, freq);

            String f = freq == null ? "" : freq.trim().toUpperCase();
            maxVisits = switch (f) {
                case "ONCE"      -> 1;
                case "EIGHT"     -> 8;
                case "TWELVE"    -> 12;
                case "UNLIMITED" -> null;
                default          -> null;
            };
        }

        List<MembershipInfo.CheckInInfo> checkInsDto = includeCheckIns && m.getCheckIns() != null
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
