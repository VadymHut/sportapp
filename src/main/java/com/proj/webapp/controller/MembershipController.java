package com.proj.webapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proj.webapp.dto.MembershipInfo;
import com.proj.webapp.model.Client;
import com.proj.webapp.model.Membership;
import com.proj.webapp.service.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @PostMapping
    public ResponseEntity<Membership> create(@RequestBody @Valid Membership body)
    {
        var saved = membershipService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public Membership get(@PathVariable Long id)
    {
        return membershipService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<Membership>> list(
            @RequestParam(value = "filter", required = false) String filterJson,
            @RequestParam(value = "_start", required = false) Integer start,
            @RequestParam(value = "_end", required = false) Integer end,
            @RequestParam(value = "_sort", required = false) String sortField,
            @RequestParam(value = "_order", required = false) String sortDir
    ) {
        String q = null;
        if (filterJson != null && !filterJson.isBlank()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                @SuppressWarnings("unchecked")
                Map<String, Object> map = mapper.readValue(filterJson, Map.class);
                Object qObj = map.get("q");
                if (qObj != null) {
                    q = qObj.toString().trim();
                }
            } catch (Exception ignore) {
            }
        }

        int defaultPageSize = 10;
        int s = (start == null) ? 0 : Math.max(0, start);
        int e = (end == null || end <= s) ? (s + defaultPageSize) : end;
        int size = e - s;
        if (size <= 0) size = defaultPageSize;
        int pageIndex = s / size;

        String sortProperty;
        if (sortField == null || sortField.isBlank()) {
            sortProperty = "id";
        } else {
            switch (sortField) {
                case "startingDate" -> sortProperty = "startingDate";
                case "endingDate"   -> sortProperty = "endingDate";
                case "client"       -> sortProperty = "client.surname";
                default             -> sortProperty = "id";
            }
        }

        Sort.Direction direction =
                "DESC".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(pageIndex, size, direction, sortProperty);

        Page<Membership> page = membershipService.listPaged(q, pageable);

        long total = page.getTotalElements();
        int from = pageIndex * size;
        int to = page.getNumberOfElements() == 0
                ? (total == 0 ? 0 : Math.max(from - 1, 0))
                : (from + page.getNumberOfElements() - 1);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "memberships " + from + "-" + to + "/" + total);
        headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Range");

        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    @GetMapping("/by-client/{clientId}")
    public List<Membership> listByClient(@PathVariable Long clientId)
    {
        return membershipService.listByClient(clientId);
    }

    @GetMapping("/by-trainer/{trainerId}")
    public List<Membership> listByTrainer(@PathVariable Long trainerId)
    {
        return membershipService.listByTrainer(trainerId);
    }

    @GetMapping("/by-plan/{planId}")
    public List<Membership> listByPlan(@PathVariable Long planId)
    {
        return membershipService.listByPlan(planId);
    }

    @PutMapping("/{id}")
    public Membership update(@PathVariable Long id, @RequestBody @Valid Membership body)
    {
        return membershipService.update(id, body);
    }

    @PatchMapping("/{id}/trainer")
    public Membership reassignTrainer(@PathVariable Long id, @RequestParam(required = false) Long trainerId)
    {
        return membershipService.reassignTrainer(id, trainerId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        membershipService.delete(id);
    }

    @GetMapping("/{id}/info")
    public ResponseEntity<MembershipInfo> getMembershipInfo(@PathVariable Long id)
    {
        MembershipInfo info = membershipService.getMembershipInfo(id);
        return ResponseEntity.ok(info);
    }

}
