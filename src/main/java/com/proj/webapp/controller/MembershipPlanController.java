package com.proj.webapp.controller;

import com.proj.webapp.model.Client;
import com.proj.webapp.model.MembershipPlan;
import com.proj.webapp.service.MembershipPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership-plans")
@RequiredArgsConstructor
public class MembershipPlanController
{

    private final MembershipPlanService membershipPlanService;

    @PostMapping
    public ResponseEntity<MembershipPlan> create(@RequestBody @Valid MembershipPlan body)
    {
        var saved = membershipPlanService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public MembershipPlan get(@PathVariable Long id)
    {
        return membershipPlanService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<MembershipPlan>> list(
            @RequestParam(value = "filter", required = false) String filterJson,
            @RequestParam(value = "_start", required = false) Integer start,
            @RequestParam(value = "_end", required = false) Integer end,
            @RequestParam(value = "_sort", required = false) String sortField,
            @RequestParam(value = "_order", required = false) String sortDir
    ) {
        List<MembershipPlan> all = membershipPlanService.listAll();

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

        List<MembershipPlan> filtered = all;
        if (q != null && !q.isBlank()) {
            final String needle = q.toLowerCase();
            filtered = all.stream().filter(p -> {
                boolean idMatch   = p.getId() != null && String.valueOf(p.getId()).contains(needle);
                boolean actMatch  = p.getActivityType()  != null && p.getActivityType().name().toLowerCase().contains(needle);
                boolean grpMatch  = p.getGroupType()     != null && p.getGroupType().name().toLowerCase().contains(needle);
                boolean freqMatch = p.getFrequencyType() != null && p.getFrequencyType().name().toLowerCase().contains(needle);
                return idMatch || actMatch || grpMatch || freqMatch;
            }).toList();
        }

        if (sortField != null && !sortField.isBlank()) {
            java.util.Comparator<MembershipPlan> cmp = null;

            switch (sortField) {
                case "label" -> {
                    java.util.function.Function<MembershipPlan, String> labelFn = p -> {
                        String a = p.getActivityType()  != null ? p.getActivityType().name()  : "";
                        String g = p.getGroupType()     != null ? p.getGroupType().name()     : "";
                        String f = p.getFrequencyType() != null ? p.getFrequencyType().name() : "";
                        return a + " / " + g + " / " + f;
                    };
                    cmp = java.util.Comparator.comparing(labelFn, String.CASE_INSENSITIVE_ORDER);
                }
                case "id" -> cmp = java.util.Comparator.comparing(
                        p -> p.getId() == null ? Long.MIN_VALUE : p.getId()
                );
                case "activityType" -> cmp = java.util.Comparator.comparing(
                        p -> p.getActivityType() == null ? "" : p.getActivityType().name(),
                        String.CASE_INSENSITIVE_ORDER
                );
                case "groupType" -> cmp = java.util.Comparator.comparing(
                        p -> p.getGroupType() == null ? "" : p.getGroupType().name(),
                        String.CASE_INSENSITIVE_ORDER
                );
                case "frequencyType" -> cmp = java.util.Comparator.comparing(
                        p -> p.getFrequencyType() == null ? "" : p.getFrequencyType().name(),
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
        List<MembershipPlan> page = (from >= toExclusive) ? java.util.List.of() : filtered.subList(from, toExclusive);

        var headers = new org.springframework.http.HttpHeaders();
        int displayedEnd = page.isEmpty()
                ? (total == 0 ? 0 : Math.max(from - 1, 0))
                : (toExclusive - 1);
        headers.add("Content-Range", "membership-plans " + from + "-" + displayedEnd + "/" + total);
        headers.add(org.springframework.http.HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Range");

        return new ResponseEntity<>(page, headers, org.springframework.http.HttpStatus.OK);
    }



    @PutMapping("/{id}")
    public MembershipPlan update(@PathVariable Long id, @RequestBody @Valid MembershipPlan body)
    {
        return membershipPlanService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        membershipPlanService.delete(id);
    }
}
