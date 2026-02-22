package com.proj.webapp.service;

import com.proj.webapp.dto.DashboardAnalytics;
import com.proj.webapp.repo.CheckInRepo;
import com.proj.webapp.repo.MembershipRepo;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;

@Service
public class AnalyticsService {
    private final CheckInRepo checkInRepo;
    private final MembershipRepo membershipRepo;
    private final ZoneId zone = ZoneId.of("Europe/Riga");

    public AnalyticsService(CheckInRepo ci, MembershipRepo mr) {
        this.checkInRepo = ci;
        this.membershipRepo = mr;
    }

    public DashboardAnalytics overview(LocalDate day, int windowMinutes) {
        ZonedDateTime startZ = day.atStartOfDay(zone);
        ZonedDateTime endZ   = day.plusDays(1).atStartOfDay(zone).minusNanos(1);
        Instant from = startZ.toInstant();
        Instant to   = endZ.toInstant();

        Instant now = Instant.now();
        Instant winFrom = now.minusSeconds(windowMinutes * 60L);

        int checkInsToday = (int) checkInRepo.countBetween(from, to);

        var actRows = checkInRepo.presentByActivity(winFrom, now);
        var presentByActivity = actRows.stream()
                .map(r -> new DashboardAnalytics.ActivityCount((String) r[0], ((Number) r[1]).intValue()))
                .toList();
        int presentNow = actRows.stream().map(r -> ((Number) r[1]).intValue()).reduce(0, Integer::sum);

        var hourlyRows = checkInRepo.hourlyCounts(from, to, zone.getId()).stream()
                .map(r -> new DashboardAnalytics.HourPoint((String) r[0], ((Number) r[1]).intValue()))
                .toList();
        String peakHour = "-";
        if (!hourlyRows.isEmpty()) {
            var best = hourlyRows.stream().max(Comparator.comparingInt(DashboardAnalytics.HourPoint::count)).orElse(null);
            if (best != null) {
                String h = best.hour();
                peakHour = h + "-" + h.substring(0, 2) + ":59";
            }
        }

        int membershipsStartedToday = (int) membershipRepo.countStartingBetween(day, day);

        LocalDate first = day.with(TemporalAdjusters.firstDayOfMonth());
        ZonedDateTime mFromZ = first.atStartOfDay(zone);
        ZonedDateTime mToZ   = day.plusDays(1).atStartOfDay(zone).minusNanos(1);

        var monthDaily = checkInRepo.dailyCounts(mFromZ.toInstant(), mToZ.toInstant(), zone.getId()).stream()
                .map(r -> new DashboardAnalytics.DayPoint((String) r[0], ((Number) r[1]).intValue()))
                .toList();

        int checkInsMonth = monthDaily.stream().mapToInt(DashboardAnalytics.DayPoint::count).sum();

        String busiestDay = monthDaily.stream().max(Comparator.comparingInt(DashboardAnalytics.DayPoint::count))
                .map(DashboardAnalytics.DayPoint::day).orElse("-");

        int daysSoFar = day.getDayOfMonth();
        Integer avgDaily = daysSoFar > 0 ? Math.round(checkInsMonth * 1f / daysSoFar) : null;

        var monthByActivityRows = checkInRepo.byActivityBetween(mFromZ.toInstant(), mToZ.toInstant());
        var monthByActivity = monthByActivityRows.stream()
                .map(r -> new DashboardAnalytics.ActivityCount((String) r[0], ((Number) r[1]).intValue()))
                .toList();

        var topTrainersRows = checkInRepo.topTrainersBetween(mFromZ.toInstant(), mToZ.toInstant());
        var topTrainers = topTrainersRows.stream()
                .map(r -> new DashboardAnalytics.TrainerCount(
                        ((Number) r[0]).longValue(),
                        (String) r[1],
                        (String) r[2],
                        ((Number) r[3]).intValue()
                )).toList();

        int membershipsStartedMonth = (int) membershipRepo.countStartingBetween(first, day);

        var month = new DashboardAnalytics.MonthSection(
                String.format("%d-%02d", day.getYear(), day.getMonthValue()),
                checkInsMonth,
                membershipsStartedMonth,
                monthDaily,
                monthByActivity,
                topTrainers,
                busiestDay,
                avgDaily
        );

        return new DashboardAnalytics(
                day.toString(),
                checkInsToday,
                presentNow,
                presentByActivity,
                peakHour,
                membershipsStartedToday,
                month
        );
    }
}
