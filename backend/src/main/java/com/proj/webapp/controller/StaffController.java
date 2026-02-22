package com.proj.webapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proj.webapp.model.Client;
import com.proj.webapp.model.Staff;
import com.proj.webapp.service.StaffService;
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
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController
{

    private final StaffService staffService;

    @PostMapping
    public ResponseEntity<Staff> create(@RequestBody @Valid Staff body)
    {
        var saved = staffService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public Staff get(@PathVariable Long id)
    {
        return staffService.getById(id);
    }

    @GetMapping
    public ResponseEntity<List<Staff>> list(
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

        String sortProperty = (sortField == null || sortField.isBlank()) ? "id" : sortField;
        Sort.Direction direction =
                "DESC".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(pageIndex, size, direction, sortProperty);

        Page<Staff> page = staffService.listPaged(q, pageable);

        long total = page.getTotalElements();
        int from = pageIndex * size;
        int to = page.getNumberOfElements() == 0
                ? (total == 0 ? 0 : Math.max(from - 1, 0))
                : (from + page.getNumberOfElements() - 1);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", "staff " + from + "-" + to + "/" + total);
        headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Range");

        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public Staff update(@PathVariable Long id, @RequestBody @Valid Staff body)
    {
        return staffService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id)
    {
        staffService.delete(id);
    }
}
