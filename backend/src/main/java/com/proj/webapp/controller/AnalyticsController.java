package com.proj.webapp.controller;

import com.proj.webapp.dto.DashboardAnalytics;
import com.proj.webapp.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService svc;
    private final ZoneId zone = ZoneId.of("Europe/Riga");

    public AnalyticsController(AnalyticsService svc) { this.svc = svc; }

    @GetMapping("/overview")
    public DashboardAnalytics overview(
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "90") int windowMinutes
    ) {
        LocalDate day = (date == null || date.isBlank())
                ? LocalDate.now(zone)
                : LocalDate.parse(date);
        return svc.overview(day, windowMinutes);
    }
}
