package com.proj.webapp.dto;

import java.util.List;

public record DashboardAnalytics(
        String date,
        int checkInsToday,
        int presentNow,
        List<ActivityCount> presentNowByActivity,
        String peakHour,
        int membershipsStartedToday,
        MonthSection month
) {
    public record ActivityCount(String activityType, int count) {}

    public record HourPoint(String hour, int count) {}
    public record DayPoint(String day, int count) {}

    public record TrainerCount(Long id, String name, String surname, int count) {}

    public record MonthSection(
            String month,
            int checkInsMonth,
            int membershipsStartedMonth,
            List<DayPoint> dailyCheckIns,
            List<ActivityCount> byActivity,
            List<TrainerCount> topTrainers,
            String busiestDay,
            Integer avgDailyCheckIns
    ) {}
}
