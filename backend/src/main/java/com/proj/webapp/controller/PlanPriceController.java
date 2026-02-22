package com.proj.webapp.controller;

import com.proj.webapp.model.Client;
import com.proj.webapp.model.MembershipPlan;
import com.proj.webapp.model.PlanPrice;
import com.proj.webapp.service.MembershipPlanService;
import com.proj.webapp.service.PlanPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plan-prices")
@RequiredArgsConstructor
public class PlanPriceController
{

    private final PlanPriceService planPriceService;
    private final MembershipPlanService membershipPlanService;

    @PostMapping
    public ResponseEntity<PlanPrice> create(@RequestBody @Valid PlanPrice body)
    {
        var saved = planPriceService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public PlanPrice get(@PathVariable Long id)
    {
        return planPriceService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<PlanPrice>> list(
            @RequestParam(value = "filter", required = false) String filterJson,
            @RequestParam(value = "_start", required = false) Integer start,
            @RequestParam(value = "_end", required = false) Integer end,
            @RequestParam(value = "_sort", required = false) String sortField,
            @RequestParam(value = "_order", required = false) String sortDir
    ) {
        List<PlanPrice> all = planPriceService.listAll();

        Map<Long, MembershipPlan> planById = membershipPlanService.listAll().stream()
                .collect(java.util.stream.Collectors.toMap(MembershipPlan::getId, java.util.function.Function.identity()));

        java.util.function.Function<Long, String> planLabel = pid -> {
            if (pid == null) return "";
            MembershipPlan p = planById.get(pid);
            if (p == null) return "";
            String a = p.getActivityType()  != null ? p.getActivityType().name()  : "";
            String g = p.getGroupType()     != null ? p.getGroupType().name()     : "";
            String f = p.getFrequencyType() != null ? p.getFrequencyType().name() : "";
            return (a + " / " + g + " / " + f).trim();
        };

        String q = null;
        if (filterJson != null && !filterJson.isBlank()) {
            try {
                var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                @SuppressWarnings("unchecked")
                var map = mapper.readValue(filterJson, java.util.Map.class);
                Object qObj = map.get("q");
                if (qObj != null) q = qObj.toString().trim();
            } catch (Exception ignore) {}
        }

        List<PlanPrice> filtered = all;
        if (q != null && !q.isBlank()) {
            final String needle = q.toLowerCase();
            filtered = all.stream().filter(pp -> {
                boolean idMatch = pp.getId() != null && String.valueOf(pp.getId()).contains(needle);

                boolean priceMatch = String.valueOf(pp.getPrice()).toLowerCase().contains(needle);

                boolean fromMatch = pp.getValidFrom() != null && pp.getValidFrom().toString().toLowerCase().contains(needle);
                boolean toMatch   = pp.getValidTo()   != null && pp.getValidTo().toString().toLowerCase().contains(needle);

                Long pid = (pp.getMembershipPlan() != null) ? pp.getMembershipPlan().getId() : null;
                boolean planIdMatch = pid != null && String.valueOf(pid).contains(needle);
                boolean planLabelMatch = planLabel.apply(pid).toLowerCase().contains(needle);

                return idMatch || priceMatch || fromMatch || toMatch || planIdMatch || planLabelMatch;
            }).toList();
        }

        if (sortField != null && !sortField.isBlank()) {
            java.util.Comparator<PlanPrice> cmp = null;

            switch (sortField) {
                case "id" -> cmp = java.util.Comparator.comparing(
                        p -> p.getId() == null ? Long.MIN_VALUE : p.getId()
                );
                case "price" -> cmp = java.util.Comparator.comparingDouble(PlanPrice::getPrice);
                case "validFrom" -> cmp = java.util.Comparator.comparing(
                        PlanPrice::getValidFrom,
                        java.util.Comparator.nullsFirst(java.time.LocalDate::compareTo)
                );
                case "validTo" -> cmp = java.util.Comparator.comparing(
                        PlanPrice::getValidTo,
                        java.util.Comparator.nullsLast(java.time.LocalDate::compareTo)
                );
                case "membershipPlan" -> cmp = java.util.Comparator.comparing(
                        p -> (p.getMembershipPlan() == null || p.getMembershipPlan().getId() == null)
                                ? Long.MIN_VALUE : p.getMembershipPlan().getId()
                );
                case "planLabel", "label" -> cmp = java.util.Comparator.comparing(
                        p -> planLabel.apply(p.getMembershipPlan() == null ? null : p.getMembershipPlan().getId()),
                        String.CASE_INSENSITIVE_ORDER
                );
                default -> {}
            }

            if (cmp != null) {
                if ("DESC".equalsIgnoreCase(sortDir)) cmp = cmp.reversed();
                filtered = filtered.stream().sorted(cmp).toList();
            }
        }

        int total = filtered.size();
        int from = (start == null) ? 0 : Math.max(0, start);
        int toExclusive = (end == null) ? total : Math.min(end, total);
        List<PlanPrice> page = (from >= toExclusive) ? java.util.List.of() : filtered.subList(from, toExclusive);

        var headers = new org.springframework.http.HttpHeaders();
        int displayedEnd = page.isEmpty()
                ? (total == 0 ? 0 : Math.max(from - 1, 0))
                : (toExclusive - 1);
        headers.add("Content-Range", "plan-prices " + from + "-" + displayedEnd + "/" + total);
        headers.add(org.springframework.http.HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Range");

        return new ResponseEntity<>(page, headers, org.springframework.http.HttpStatus.OK);
    }


    @GetMapping("/by-plan/{planId}")
    public List<PlanPrice> listByPlan(@PathVariable Long planId)
    {
        return planPriceService.listByPlan(planId);
    }

    @GetMapping("/active")
    public PlanPrice getActive(@RequestParam Long planId, @RequestParam LocalDate date)
    {
        return planPriceService.findActivePrice(planId, date).orElseThrow(() -> new IllegalArgumentException("Active price not found for the given date"));
    }

    @PutMapping("/{id}")
    public PlanPrice update(@PathVariable Long id, @RequestBody @Valid PlanPrice body)
    {
        return planPriceService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        planPriceService.delete(id);
    }
}
