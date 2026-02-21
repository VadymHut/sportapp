package com.proj.webapp.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.proj.webapp.model.CheckIn;
import com.proj.webapp.service.CheckInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping
    public ResponseEntity<CheckIn> create(@RequestBody @Valid CheckIn body) {
        var saved = checkInService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public CheckIn get(@PathVariable Long id) {
        return checkInService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<CheckIn>> list(
            @RequestParam(value = "filter", required = false) String filterJson,
            @RequestParam(value = "_start", required = false) Integer start,
            @RequestParam(value = "_end", required = false) Integer end,
            @RequestParam(value = "_sort", required = false) String sortField,
            @RequestParam(value = "_order", required = false) String sortDir
    ) {
        String q = null;
        if (filterJson != null && !filterJson.isBlank()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                @SuppressWarnings("unchecked")
                Map<String, Object> map = objectMapper.readValue(filterJson, Map.class);
                Object qObj = map.get("q");
                if (qObj != null) q = qObj.toString().trim();
            } catch (Exception ignore) {}
        }

        int from = (start == null) ? 0 : Math.max(0, start);
        int size;
        if (start == null || end == null || end <= start) {
            size = 20;
        } else {
            size = end - start;
        }
        int page = from / size;

        Sort sort = Sort.unsorted();
        if (sortField != null && !sortField.isBlank()) {
            Sort.Direction dir =
                    "DESC".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(dir, sortField);
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<CheckIn> pageResult = checkInService.listPaged(q, pageable);

        long total = pageResult.getTotalElements();
        List<CheckIn> content = pageResult.getContent();

        HttpHeaders headers = new HttpHeaders();
        int toExclusive = from + content.size();
        int displayedEnd = content.isEmpty()
                ? (total == 0 ? 0 : Math.max(from - 1, 0))
                : (toExclusive - 1);

        headers.add("Content-Range", "checkins " + from + "-" + displayedEnd + "/" + total);
        headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Range");

        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }

    @GetMapping("/by-membership/{membershipId}")
    public List<CheckIn> listByMembership(@PathVariable Long membershipId) {
        return checkInService.listByMembership(membershipId);
    }

    @GetMapping("/by-client/{clientId}")
    public List<CheckIn> listByClient(@PathVariable Long clientId) {
        return checkInService.listByClient(clientId);
    }

    @GetMapping("/by-staff/{staffId}")
    public List<CheckIn> listByStaff(@PathVariable Long staffId) {
        return checkInService.listByStaff(staffId);
    }

    @PutMapping("/{id}")
    public CheckIn update(@PathVariable Long id, @RequestBody @Valid CheckIn body) {
        return checkInService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        checkInService.delete(id);
    }
}
